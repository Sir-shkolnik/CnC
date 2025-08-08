"""
SmartMoving API Client
======================

Handles communication with SmartMoving API to fetch opportunities, jobs, and related data
for integration with C&C CRM journey management system.
"""

import httpx
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from prisma import Prisma

logger = logging.getLogger(__name__)

class SmartMovingAPI:
    def __init__(self):
        self.base_url = "https://api-public.smartmoving.com/v1"
        self.client = httpx.AsyncClient(timeout=30.0)
        self.prisma = Prisma()
    
    async def __aenter__(self):
        await self.prisma.connect()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.prisma.disconnect()
        await self.client.aclose()
    
    async def get_api_credentials(self, company_id: str) -> Dict[str, str]:
        """Get API credentials for a company"""
        company = await self.prisma.companyintegration.find_unique(
            where={"id": company_id}
        )
        
        if not company:
            raise ValueError(f"Company integration not found: {company_id}")
        
        return {
            "api_key": company.apiKey,
            "base_url": company.apiBaseUrl or self.base_url
        }
    
    async def get_opportunities(self, company_id: str, location_id: Optional[str] = None, 
                              date_from: Optional[datetime] = None, 
                              date_to: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """Get opportunities for a company, optionally filtered by location and date range"""
        try:
            credentials = await self.get_api_credentials(company_id)
            
            # Build query parameters
            params = {}
            if location_id:
                params["branchId"] = location_id
            if date_from:
                params["dateFrom"] = date_from.strftime("%Y%m%d")
            if date_to:
                params["dateTo"] = date_to.strftime("%Y%m%d")
            
            # Get opportunities
            response = await self.client.get(
                f"{credentials['base_url']}/opportunities",
                headers={
                    "Authorization": f"Bearer {credentials['api_key']}",
                    "Content-Type": "application/json"
                },
                params=params
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("opportunities", [])
            else:
                logger.error(f"Failed to fetch opportunities: {response.status_code} - {response.text}")
                return []
                
        except Exception as e:
            logger.error(f"Error fetching opportunities: {str(e)}")
            return []
    
    async def get_opportunity_details(self, company_id: str, opportunity_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific opportunity"""
        try:
            credentials = await self.get_api_credentials(company_id)
            
            response = await self.client.get(
                f"{credentials['base_url']}/opportunities/{opportunity_id}",
                headers={
                    "Authorization": f"Bearer {credentials['api_key']}",
                    "Content-Type": "application/json"
                },
                params={
                    "includeJobAddresses": "true",
                    "includeJobDocuments": "true"
                }
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Failed to fetch opportunity details: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error fetching opportunity details: {str(e)}")
            return None
    
    async def get_jobs_for_opportunity(self, company_id: str, opportunity_id: str) -> List[Dict[str, Any]]:
        """Get jobs for a specific opportunity"""
        try:
            credentials = await self.get_api_credentials(company_id)
            
            response = await self.client.get(
                f"{credentials['base_url']}/opportunities/{opportunity_id}/jobs",
                headers={
                    "Authorization": f"Bearer {credentials['api_key']}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("jobs", [])
            else:
                logger.error(f"Failed to fetch jobs: {response.status_code} - {response.text}")
                return []
                
        except Exception as e:
            logger.error(f"Error fetching jobs: {str(e)}")
            return []
    
    async def get_user_opportunities(self, company_id: str, user_location_id: str, 
                                   user_role: str) -> List[Dict[str, Any]]:
        """Get opportunities relevant to a specific user based on their location and role"""
        try:
            # Get today and tomorrow's opportunities for the user's location
            today = datetime.now()
            tomorrow = today + timedelta(days=1)
            
            opportunities = await self.get_opportunities(
                company_id=company_id,
                location_id=user_location_id,
                date_from=today,
                date_to=tomorrow
            )
            
            # Filter based on user role
            filtered_opportunities = []
            for opp in opportunities:
                # For now, include all opportunities for the location
                # In the future, we can add role-based filtering
                filtered_opportunities.append(opp)
            
            return filtered_opportunities
            
        except Exception as e:
            logger.error(f"Error fetching user opportunities: {str(e)}")
            return []
    
    def transform_opportunity_to_journey(self, opportunity: Dict[str, Any], 
                                       company_id: str) -> Dict[str, Any]:
        """Transform SmartMoving opportunity to C&C CRM journey format"""
        try:
            # Extract basic opportunity info
            opportunity_id = opportunity.get("id", "")
            customer_name = opportunity.get("customerName", "Unknown Customer")
            move_date = opportunity.get("moveDate")
            status = opportunity.get("status", "PENDING")
            
            # Get the first job for basic info
            jobs = opportunity.get("jobs", [])
            first_job = jobs[0] if jobs else {}
            
            # Transform to journey format
            journey = {
                "id": f"journey_sm_{opportunity_id}",
                "externalId": opportunity_id,
                "externalSource": "SmartMoving",
                "truckNumber": f"SM-{opportunity_id[:8]}",
                "status": self.map_smartmoving_status_to_journey_status(status),
                "customerName": customer_name,
                "moveDate": move_date,
                "estimatedStartTime": move_date,
                "estimatedEndTime": move_date,
                "originAddress": self.extract_origin_address(opportunity),
                "destinationAddress": self.extract_destination_address(opportunity),
                "estimatedDuration": self.calculate_estimated_duration(jobs),
                "estimatedCost": self.calculate_total_cost(jobs),
                "notes": opportunity.get("notes", ""),
                "clientId": company_id,
                "locationId": opportunity.get("branchId", ""),
                "createdAt": datetime.now().isoformat(),
                "updatedAt": datetime.now().isoformat(),
                "externalData": opportunity
            }
            
            return journey
            
        except Exception as e:
            logger.error(f"Error transforming opportunity to journey: {str(e)}")
            return {}
    
    def map_smartmoving_status_to_journey_status(self, smartmoving_status: str) -> str:
        """Map SmartMoving status to C&C CRM journey status"""
        status_mapping = {
            "PENDING": "MORNING_PREP",
            "CONFIRMED": "MORNING_PREP",
            "IN_PROGRESS": "EN_ROUTE",
            "COMPLETED": "COMPLETED",
            "CANCELLED": "CANCELLED"
        }
        
        return status_mapping.get(smartmoving_status, "MORNING_PREP")
    
    def extract_origin_address(self, opportunity: Dict[str, Any]) -> str:
        """Extract origin address from opportunity"""
        jobs = opportunity.get("jobs", [])
        if jobs and len(jobs) > 0:
            addresses = jobs[0].get("jobAddresses", [])
            if addresses and len(addresses) > 0:
                return addresses[0]
        return "Address not available"
    
    def extract_destination_address(self, opportunity: Dict[str, Any]) -> str:
        """Extract destination address from opportunity"""
        jobs = opportunity.get("jobs", [])
        if jobs and len(jobs) > 0:
            addresses = jobs[0].get("jobAddresses", [])
            if addresses and len(addresses) > 1:
                return addresses[1]
            elif addresses and len(addresses) > 0:
                return addresses[0]
        return "Address not available"
    
    def calculate_estimated_duration(self, jobs: List[Dict[str, Any]]) -> int:
        """Calculate estimated duration in hours based on job charges"""
        total_hours = 0
        for job in jobs:
            charges = job.get("estimatedCharges", [])
            for charge in charges:
                description = charge.get("description", "")
                if "hr" in description.lower():
                    # Extract hours from description like "2h @ $349.00/hr"
                    import re
                    hour_match = re.search(r'(\d+)h', description)
                    if hour_match:
                        total_hours += int(hour_match.group(1))
        
        return max(total_hours, 2)  # Minimum 2 hours
    
    def calculate_total_cost(self, jobs: List[Dict[str, Any]]) -> float:
        """Calculate total estimated cost"""
        total_cost = 0.0
        for job in jobs:
            charges = job.get("estimatedCharges", [])
            for charge in charges:
                total_cost += charge.get("totalCost", 0.0)
        
        return total_cost 