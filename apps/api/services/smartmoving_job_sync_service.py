"""
SmartMoving Job Sync Service
============================

Handles synchronization of SmartMoving jobs/opportunities into C&C CRM TruckJourneys
with automatic customer and lead creation.
"""

import asyncio
import httpx
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from decimal import Decimal
from prisma import Prisma
from prisma.models import (
    TruckJourney, Customer, Lead, Quote, Location, Client, User,
    CompanyIntegration, CompanyBranch
)

logger = logging.getLogger(__name__)

class SmartMovingJobSyncService:
    def __init__(self):
        self.prisma = Prisma()
        self.client = httpx.AsyncClient(timeout=30.0)
        
        # SmartMoving API Configuration
        self.api_base_url = "https://api-public.smartmoving.com/v1"
        self.api_key = "185840176c73420fbd3a473c2fdccedb"
        self.client_id = "5aa72e33-be47-42ba-b59e-aeec01250bb5"
    
    async def __aenter__(self):
        await self.prisma.connect()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.prisma.disconnect()
        await self.client.aclose()
    
    def get_smartmoving_headers(self) -> Dict[str, str]:
        """Get headers for SmartMoving API requests"""
        return {
            "x-api-key": self.api_key,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    
    async def fetch_smartmoving_jobs(self, date: Optional[str] = None) -> List[Dict]:
        """Fetch jobs from SmartMoving API"""
        try:
            headers = self.get_smartmoving_headers()
            
            # Build URL with optional date filter
            url = f"{self.api_base_url}/customers"
            params = {}
            if date:
                params["date"] = date
            
            logger.info(f"Fetching SmartMoving jobs from: {url}")
            
            response = await self.client.get(url, headers=headers, params=params)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"Retrieved {len(data.get('customers', []))} customers from SmartMoving")
            
            return data.get('customers', [])
            
        except Exception as e:
            logger.error(f"Error fetching SmartMoving jobs: {str(e)}")
            return []
    
    def convert_smartmoving_date(self, date_int: int) -> datetime:
        """Convert SmartMoving YYYYMMDD format to datetime"""
        date_str = str(date_int)
        return datetime.strptime(date_str, "%Y%m%d").replace(tzinfo=None)
    
    def extract_customer_name(self, customer_data: Dict) -> tuple[str, str]:
        """Extract first and last name from customer data"""
        name = customer_data.get('name', '').strip()
        if ' ' in name:
            parts = name.split(' ', 1)
            return parts[0], parts[1]
        return name, ""
    
    async def find_or_create_customer(self, customer_data: Dict, client_id: str) -> Customer:
        """Find existing customer or create new one"""
        external_id = customer_data.get('id')
        email = customer_data.get('emailAddress')
        phone = customer_data.get('phoneNumber')
        
        # Try to find by external ID first
        if external_id:
            existing = await self.prisma.customer.find_first(
                where={
                    "clientId": client_id,
                    "externalId": external_id
                }
            )
            if existing:
                logger.info(f"Found existing customer by external ID: {external_id}")
                return existing
        
        # Try to find by email
        if email:
            existing = await self.prisma.customer.find_first(
                where={
                    "clientId": client_id,
                    "email": email
                }
            )
            if existing:
                logger.info(f"Found existing customer by email: {email}")
                return existing
        
        # Try to find by phone
        if phone:
            existing = await self.prisma.customer.find_first(
                where={
                    "clientId": client_id,
                    "phone": phone
                }
            )
            if existing:
                logger.info(f"Found existing customer by phone: {phone}")
                return existing
        
        # Create new customer
        first_name, last_name = self.extract_customer_name(customer_data)
        
        customer_data_create = {
            "clientId": client_id,
            "externalId": external_id,
            "firstName": first_name,
            "lastName": last_name,
            "email": email,
            "phone": phone,
            "address": {
                "full": customer_data.get('address', ''),
                "street": "",
                "city": "",
                "state": "",
                "zip": "",
                "country": "Canada"
            },
            "leadSource": "SmartMoving Integration",
            "leadStatus": "NEW",
            "isActive": True
        }
        
        customer = await self.prisma.customer.create(data=customer_data_create)
        logger.info(f"Created new customer: {customer.id} - {first_name} {last_name}")
        return customer
    
    async def find_or_create_lead(self, opportunity_data: Dict, customer: Customer) -> Lead:
        """Find existing lead or create new one"""
        external_id = opportunity_data.get('id')
        quote_number = opportunity_data.get('quoteNumber')
        
        # Try to find by external ID first
        if external_id:
            existing = await self.prisma.lead.find_first(
                where={
                    "clientId": customer.clientId,
                    "externalId": external_id
                }
            )
            if existing:
                logger.info(f"Found existing lead by external ID: {external_id}")
                return existing
        
        # Try to find by quote number
        if quote_number:
            existing = await self.prisma.lead.find_first(
                where={
                    "clientId": customer.clientId,
                    "quoteNumber": quote_number
                }
            )
            if existing:
                logger.info(f"Found existing lead by quote number: {quote_number}")
                return existing
        
        # Create new lead
        service_date = None
        if opportunity_data.get('serviceDate'):
            service_date = self.convert_smartmoving_date(opportunity_data['serviceDate'])
        
        lead_data_create = {
            "clientId": customer.clientId,
            "customerId": customer.id,
            "externalId": external_id,
            "quoteNumber": quote_number,
            "status": "NEW",
            "serviceDate": service_date,
            "estimatedValue": None,  # Will be updated from job data
            "leadSource": "SmartMoving Integration",
            "isActive": True
        }
        
        lead = await self.prisma.lead.create(data=lead_data_create)
        logger.info(f"Created new lead: {lead.id} - Quote: {quote_number}")
        return lead
    
    async def find_location_by_branch_name(self, branch_name: str, client_id: str) -> Optional[Location]:
        """Find C&C CRM location by SmartMoving branch name"""
        # First try to find by exact name match
        location = await self.prisma.location.find_first(
            where={
                "clientId": client_id,
                "name": {"contains": branch_name.split(' ')[0]}  # Match first word (city name)
            }
        )
        
        if location:
            return location
        
        # If not found, try to find by company branch
        company_branch = await self.prisma.companybranch.find_first(
            where={
                "name": {"contains": branch_name.split(' ')[0]}
            }
        )
        
        if company_branch:
            # Create a location based on company branch
            location_data = {
                "clientId": client_id,
                "name": company_branch.name,
                "address": company_branch.fullAddress,
                "timezone": "America/Toronto"
            }
            
            location = await self.prisma.location.create(data=location_data)
            logger.info(f"Created new location from company branch: {location.id} - {company_branch.name}")
            return location
        
        return None
    
    async def sync_smartmoving_jobs_to_journeys(self, client_id: str, date: Optional[str] = None) -> Dict[str, Any]:
        """Sync SmartMoving jobs to C&C CRM TruckJourneys"""
        logger.info(f"Starting SmartMoving job sync for client: {client_id}")
        
        stats = {
            "customers_processed": 0,
            "customers_created": 0,
            "leads_processed": 0,
            "leads_created": 0,
            "journeys_processed": 0,
            "journeys_created": 0,
            "errors": 0
        }
        
        try:
            # Fetch jobs from SmartMoving
            customers_data = await self.fetch_smartmoving_jobs(date)
            
            for customer_data in customers_data:
                try:
                    # Process each customer
                    customer = await self.find_or_create_customer(customer_data, client_id)
                    stats["customers_processed"] += 1
                    
                    if not customer.externalId:
                        stats["customers_created"] += 1
                    
                    # Process opportunities (leads)
                    opportunities = customer_data.get('opportunities', [])
                    for opportunity_data in opportunities:
                        try:
                            lead = await self.find_or_create_lead(opportunity_data, customer)
                            stats["leads_processed"] += 1
                            
                            if not lead.externalId:
                                stats["leads_created"] += 1
                            
                            # Process jobs (journeys)
                            jobs = opportunity_data.get('jobs', [])
                            for job_data in jobs:
                                try:
                                    await self.process_job_to_journey(job_data, customer, lead, client_id, stats)
                                except Exception as e:
                                    logger.error(f"Error processing job {job_data.get('id')}: {str(e)}")
                                    stats["errors"] += 1
                                    
                        except Exception as e:
                            logger.error(f"Error processing opportunity {opportunity_data.get('id')}: {str(e)}")
                            stats["errors"] += 1
                            
                except Exception as e:
                    logger.error(f"Error processing customer {customer_data.get('id')}: {str(e)}")
                    stats["errors"] += 1
            
            logger.info(f"SmartMoving job sync completed. Stats: {stats}")
            return {
                "success": True,
                "stats": stats,
                "message": f"Synced {stats['journeys_processed']} journeys, created {stats['journeys_created']} new"
            }
            
        except Exception as e:
            logger.error(f"Error in SmartMoving job sync: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "stats": stats
            }
    
    async def process_job_to_journey(self, job_data: Dict, customer: Customer, lead: Lead, client_id: str, stats: Dict):
        """Process a SmartMoving job into a C&C CRM TruckJourney"""
        job_id = job_data.get('id')
        job_number = job_data.get('jobNumber')
        
        # Check if journey already exists
        existing_journey = await self.prisma.truckjourney.find_first(
            where={
                "clientId": client_id,
                "externalId": job_id
            }
        )
        
        if existing_journey:
            logger.info(f"Journey already exists for job {job_id}")
            stats["journeys_processed"] += 1
            return existing_journey
        
        # Find location by branch name (from lead data or default)
        location = await self.find_location_by_branch_name("CALGARY", client_id)  # Default for now
        
        if not location:
            logger.warning(f"No location found for job {job_id}, skipping")
            return None
        
        # Calculate estimated total from job charges
        estimated_total = Decimal('0.00')
        estimated_charges = job_data.get('estimatedCharges', [])
        for charge in estimated_charges:
            total_cost = charge.get('totalCost', 0)
            if total_cost:
                estimated_total += Decimal(str(total_cost))
        
        # Convert job date
        job_date = None
        if job_data.get('jobDate'):
            job_date = self.convert_smartmoving_date(job_data['jobDate'])
        else:
            job_date = datetime.now()
        
        # Create journey data
        journey_data = {
            "locationId": location.id,
            "clientId": client_id,
            "date": job_date,
            "status": "MORNING_PREP",
            "externalId": job_id,
            "jobNumber": job_number,
            "quoteNumber": lead.quoteNumber,
            "customerId": customer.id,
            "leadId": lead.id,
            "estimatedTotal": estimated_total,
            "jobType": job_data.get('type'),
            "confirmed": job_data.get('confirmed', False),
            "jobAddresses": job_data.get('jobAddresses', []),
            "notes": f"SmartMoving Job: {job_number}\nCustomer: {customer.firstName} {customer.lastName}\nQuote: {lead.quoteNumber}",
            "createdById": "system"  # Will be updated with actual user ID
        }
        
        # Create the journey
        journey = await self.prisma.truckjourney.create(data=journey_data)
        
        # Update lead with estimated value
        if estimated_total > 0:
            await self.prisma.lead.update(
                where={"id": lead.id},
                data={"estimatedValue": estimated_total}
            )
        
        stats["journeys_processed"] += 1
        stats["journeys_created"] += 1
        
        logger.info(f"Created new journey: {journey.id} for job {job_number}")
        return journey
    
    async def sync_today_jobs(self, client_id: str) -> Dict[str, Any]:
        """Sync today's jobs from SmartMoving"""
        today = datetime.now().strftime("%Y%m%d")
        return await self.sync_smartmoving_jobs_to_journeys(client_id, today)
    
    async def sync_all_jobs(self, client_id: str) -> Dict[str, Any]:
        """Sync all available jobs from SmartMoving"""
        return await self.sync_smartmoving_jobs_to_journeys(client_id)

# Global instance for background sync
smartmoving_job_sync = SmartMovingJobSyncService()
