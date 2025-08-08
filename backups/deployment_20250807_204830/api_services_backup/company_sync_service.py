"""
Company Sync Service
===================

Handles synchronization of external company data (LGM, future companies)
with automatic 12-hour sync intervals and comprehensive logging.
"""

import asyncio
import httpx
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from prisma import Prisma
from prisma.models import (
    CompanyIntegration, CompanyDataSyncLog, CompanyBranch, 
    CompanyMaterial, CompanyServiceType, CompanyMoveSize,
    CompanyRoomType, CompanyUser, CompanyReferralSource
)

logger = logging.getLogger(__name__)

class CompanySyncService:
    def __init__(self):
        self.prisma = Prisma()
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def __aenter__(self):
        await self.prisma.connect()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.prisma.disconnect()
        await self.client.aclose()
    
    async def get_pending_syncs(self) -> List[CompanyIntegration]:
        """Get companies that need to be synced"""
        now = datetime.utcnow()
        return await self.prisma.companyintegration.find_many(
            where={
                "isActive": True,
                "nextSyncAt": {"lte": now}
            }
        )
    
    async def create_sync_log(self, company_id: str, sync_type: str) -> CompanyDataSyncLog:
        """Create a new sync log entry"""
        return await self.prisma.companydatasynclog.create(
            data={
                "id": f"sync-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}-{company_id}",
                "companyIntegrationId": company_id,
                "syncType": sync_type,
                "status": "IN_PROGRESS",
                "startedAt": datetime.utcnow()
            }
        )
    
    async def update_sync_log(self, sync_log_id: str, **kwargs):
        """Update sync log with results"""
        await self.prisma.companydatasynclog.update(
            where={"id": sync_log_id},
            data=kwargs
        )
    
    async def update_company_sync_status(self, company_id: str, status: str, next_sync: Optional[datetime] = None):
        """Update company sync status and next sync time"""
        update_data = {
            "syncStatus": status,
            "lastSyncAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        if next_sync:
            update_data["nextSyncAt"] = next_sync
        else:
            # Calculate next sync based on frequency
            company = await self.prisma.companyintegration.find_unique(where={"id": company_id})
            if company:
                next_sync = datetime.utcnow() + timedelta(hours=company.syncFrequencyHours)
                update_data["nextSyncAt"] = next_sync
        
        await self.prisma.companyintegration.update(
            where={"id": company_id},
            data=update_data
        )
    
    async def sync_company_data(self, company: CompanyIntegration) -> bool:
        """Main sync method for a company"""
        logger.info(f"Starting sync for company: {company.name}")
        
        # Create sync log
        sync_log = await self.create_sync_log(company.id, "FULL_SYNC")
        
        try:
            # Update company status
            await self.update_company_sync_status(company.id, "SYNCING")
            
            # Sync based on API source
            if company.apiSource == "SmartMoving API":
                success = await self.sync_smartmoving_data(company, sync_log.id)
            else:
                logger.error(f"Unknown API source: {company.apiSource}")
                success = False
            
            # Update sync log
            await self.update_sync_log(
                sync_log.id,
                status="COMPLETED" if success else "FAILED",
                completedAt=datetime.utcnow()
            )
            
            # Update company status
            await self.update_company_sync_status(
                company.id, 
                "COMPLETED" if success else "FAILED"
            )
            
            return success
            
        except Exception as e:
            logger.error(f"Error syncing company {company.name}: {str(e)}")
            
            # Update sync log with error
            await self.update_sync_log(
                sync_log.id,
                status="FAILED",
                errorMessage=str(e),
                completedAt=datetime.utcnow()
            )
            
            # Update company status
            await self.update_company_sync_status(company.id, "FAILED")
            
            return False
    
    async def sync_smartmoving_data(self, company: CompanyIntegration, sync_log_id: str) -> bool:
        """Sync SmartMoving API data"""
        logger.info(f"Syncing SmartMoving data for {company.name}")
        
        headers = {
            "x-api-key": company.apiKey,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        
        total_processed = 0
        total_created = 0
        total_updated = 0
        total_failed = 0
        
        try:
            # 1. Sync Branches
            logger.info("Syncing branches...")
            branch_stats = await self.sync_smartmoving_branches(company, headers)
            total_processed += branch_stats["processed"]
            total_created += branch_stats["created"]
            total_updated += branch_stats["updated"]
            total_failed += branch_stats["failed"]
            
            # 2. Sync Materials
            logger.info("Syncing materials...")
            material_stats = await self.sync_smartmoving_materials(company, headers)
            total_processed += material_stats["processed"]
            total_created += material_stats["created"]
            total_updated += material_stats["updated"]
            total_failed += material_stats["failed"]
            
            # 3. Sync Service Types
            logger.info("Syncing service types...")
            service_stats = await self.sync_smartmoving_service_types(company, headers)
            total_processed += service_stats["processed"]
            total_created += service_stats["created"]
            total_updated += service_stats["updated"]
            total_failed += service_stats["failed"]
            
            # 4. Sync Move Sizes
            logger.info("Syncing move sizes...")
            move_size_stats = await self.sync_smartmoving_move_sizes(company, headers)
            total_processed += move_size_stats["processed"]
            total_created += move_size_stats["created"]
            total_updated += move_size_stats["updated"]
            total_failed += move_size_stats["failed"]
            
            # 5. Sync Room Types
            logger.info("Syncing room types...")
            room_type_stats = await self.sync_smartmoving_room_types(company, headers)
            total_processed += room_type_stats["processed"]
            total_created += room_type_stats["created"]
            total_updated += room_type_stats["updated"]
            total_failed += room_type_stats["failed"]
            
            # 6. Sync Users
            logger.info("Syncing users...")
            user_stats = await self.sync_smartmoving_users(company, headers)
            total_processed += user_stats["processed"]
            total_created += user_stats["created"]
            total_updated += user_stats["updated"]
            total_failed += user_stats["failed"]
            
            # 7. Sync Referral Sources
            logger.info("Syncing referral sources...")
            referral_stats = await self.sync_smartmoving_referral_sources(company, headers)
            total_processed += referral_stats["processed"]
            total_created += referral_stats["created"]
            total_updated += referral_stats["updated"]
            total_failed += referral_stats["failed"]
            
            # Update sync log with final stats
            await self.update_sync_log(
                sync_log_id,
                recordsProcessed=total_processed,
                recordsCreated=total_created,
                recordsUpdated=total_updated,
                recordsFailed=total_failed,
                metadata={
                    "branches": branch_stats,
                    "materials": material_stats,
                    "service_types": service_stats,
                    "move_sizes": move_size_stats,
                    "room_types": room_type_stats,
                    "users": user_stats,
                    "referral_sources": referral_stats
                }
            )
            
            logger.info(f"SmartMoving sync completed: {total_processed} processed, {total_created} created, {total_updated} updated, {total_failed} failed")
            return total_failed == 0
            
        except Exception as e:
            logger.error(f"Error in SmartMoving sync: {str(e)}")
            await self.update_sync_log(
                sync_log_id,
                recordsProcessed=total_processed,
                recordsCreated=total_created,
                recordsUpdated=total_updated,
                recordsFailed=total_failed,
                errorMessage=str(e)
            )
            return False
    
    async def sync_smartmoving_branches(self, company: CompanyIntegration, headers: Dict) -> Dict:
        """Sync SmartMoving branches"""
        stats = {"processed": 0, "created": 0, "updated": 0, "failed": 0}
        
        try:
            response = await self.client.get(
                f"{company.apiBaseUrl}/api/branches",
                headers=headers,
                params={"PageSize": 100}
            )
            response.raise_for_status()
            
            data = response.json()
            branches = data.get("pageResults", [])
            
            for branch_data in branches:
                stats["processed"] += 1
                
                try:
                    # Prepare branch data
                    branch_update = {
                        "externalId": branch_data["id"],
                        "name": branch_data["name"],
                        "phone": branch_data.get("phoneNumber", ""),
                        "isPrimary": branch_data.get("isPrimary", False),
                        "country": branch_data.get("dispatchLocation", {}).get("country", "Unknown"),
                        "provinceState": branch_data.get("dispatchLocation", {}).get("state", "Unknown"),
                        "city": branch_data.get("dispatchLocation", {}).get("city", "Unknown"),
                        "fullAddress": branch_data.get("dispatchLocation", {}).get("fullAddress", ""),
                        "street": branch_data.get("dispatchLocation", {}).get("street", ""),
                        "zipCode": branch_data.get("dispatchLocation", {}).get("zip", ""),
                        "latitude": branch_data.get("dispatchLocation", {}).get("lat"),
                        "longitude": branch_data.get("dispatchLocation", {}).get("lng"),
                        "lastSyncedAt": datetime.utcnow(),
                        "externalData": branch_data,
                        "updatedAt": datetime.utcnow()
                    }
                    
                    # Upsert branch
                    existing = await self.prisma.companybranch.find_unique(
                        where={
                            "companyIntegrationId_externalId": {
                                "companyIntegrationId": company.id,
                                "externalId": branch_data["id"]
                            }
                        }
                    )
                    
                    if existing:
                        await self.prisma.companybranch.update(
                            where={"id": existing.id},
                            data=branch_update
                        )
                        stats["updated"] += 1
                    else:
                        await self.prisma.companybranch.create(
                            data={
                                "id": f"branch-{company.id}-{branch_data['id']}",
                                "companyIntegrationId": company.id,
                                **branch_update
                            }
                        )
                        stats["created"] += 1
                        
                except Exception as e:
                    logger.error(f"Error syncing branch {branch_data.get('id', 'unknown')}: {str(e)}")
                    stats["failed"] += 1
            
        except Exception as e:
            logger.error(f"Error fetching branches: {str(e)}")
            stats["failed"] += 1
        
        return stats
    
    async def sync_smartmoving_materials(self, company: CompanyIntegration, headers: Dict) -> Dict:
        """Sync SmartMoving materials"""
        stats = {"processed": 0, "created": 0, "updated": 0, "failed": 0}
        
        try:
            # Get tariffs first
            tariffs_response = await self.client.get(
                f"{company.apiBaseUrl}/api/tariffs",
                headers=headers,
                params={"PageSize": 10}
            )
            tariffs_response.raise_for_status()
            
            tariffs_data = tariffs_response.json()
            tariffs = tariffs_data.get("pageResults", [])
            
            for tariff in tariffs:
                # Get materials for this tariff
                materials_response = await self.client.get(
                    f"{company.apiBaseUrl}/api/premium/tariffs/{tariff['id']}/materials",
                    headers=headers,
                    params={"PageSize": 100}
                )
                materials_response.raise_for_status()
                
                materials_data = materials_response.json()
                materials = materials_data.get("pageResults", [])
                
                for material_data in materials:
                    stats["processed"] += 1
                    
                    try:
                        # Prepare material data
                        material_update = {
                            "externalId": material_data["id"],
                            "name": material_data["name"],
                            "description": material_data.get("description"),
                            "rate": float(material_data.get("rate", 0)),
                            "unit": material_data.get("unit"),
                            "category": material_data.get("category", "Unknown"),
                            "dimensions": material_data.get("dimensions"),
                            "maxSize": material_data.get("maxSize"),
                            "sizeRange": material_data.get("sizeRange"),
                            "capacity": material_data.get("capacity"),
                            "weight": material_data.get("weight"),
                            "contents": material_data.get("contents"),
                            "lastSyncedAt": datetime.utcnow(),
                            "externalData": material_data,
                            "updatedAt": datetime.utcnow()
                        }
                        
                        # Upsert material
                        existing = await self.prisma.companymaterial.find_unique(
                            where={
                                "companyIntegrationId_externalId": {
                                    "companyIntegrationId": company.id,
                                    "externalId": material_data["id"]
                                }
                            }
                        )
                        
                        if existing:
                            await self.prisma.companymaterial.update(
                                where={"id": existing.id},
                                data=material_update
                            )
                            stats["updated"] += 1
                        else:
                            await self.prisma.companymaterial.create(
                                data={
                                    "id": f"material-{company.id}-{material_data['id']}",
                                    "companyIntegrationId": company.id,
                                    **material_update
                                }
                            )
                            stats["created"] += 1
                            
                    except Exception as e:
                        logger.error(f"Error syncing material {material_data.get('id', 'unknown')}: {str(e)}")
                        stats["failed"] += 1
        
        except Exception as e:
            logger.error(f"Error fetching materials: {str(e)}")
            stats["failed"] += 1
        
        return stats
    
    async def sync_smartmoving_service_types(self, company: CompanyIntegration, headers: Dict) -> Dict:
        """Sync SmartMoving service types"""
        stats = {"processed": 0, "created": 0, "updated": 0, "failed": 0}
        
        try:
            response = await self.client.get(
                f"{company.apiBaseUrl}/api/service-types",
                headers=headers,
                params={"PageSize": 100}
            )
            response.raise_for_status()
            
            data = response.json()
            service_types = data.get("pageResults", [])
            
            for service_type_data in service_types:
                stats["processed"] += 1
                
                try:
                    # Prepare service type data
                    service_type_update = {
                        "externalId": str(service_type_data["id"]),
                        "name": service_type_data["name"],
                        "scalingFactorPercentage": service_type_data.get("scalingFactorPercentage", 100),
                        "hasActivityLoading": service_type_data.get("hasActivityLoading", False),
                        "hasActivityFinishedLoading": service_type_data.get("hasActivityFinishedLoading", False),
                        "hasActivityUnloading": service_type_data.get("hasActivityUnloading", False),
                        "order": service_type_data.get("order", 0),
                        "lastSyncedAt": datetime.utcnow(),
                        "externalData": service_type_data,
                        "updatedAt": datetime.utcnow()
                    }
                    
                    # Upsert service type
                    existing = await self.prisma.companyservicetype.find_unique(
                        where={
                            "companyIntegrationId_externalId": {
                                "companyIntegrationId": company.id,
                                "externalId": str(service_type_data["id"])
                            }
                        }
                    )
                    
                    if existing:
                        await self.prisma.companyservicetype.update(
                            where={"id": existing.id},
                            data=service_type_update
                        )
                        stats["updated"] += 1
                    else:
                        await self.prisma.companyservicetype.create(
                            data={
                                "id": f"servicetype-{company.id}-{service_type_data['id']}",
                                "companyIntegrationId": company.id,
                                **service_type_update
                            }
                        )
                        stats["created"] += 1
                        
                except Exception as e:
                    logger.error(f"Error syncing service type {service_type_data.get('id', 'unknown')}: {str(e)}")
                    stats["failed"] += 1
        
        except Exception as e:
            logger.error(f"Error fetching service types: {str(e)}")
            stats["failed"] += 1
        
        return stats
    
    async def sync_smartmoving_move_sizes(self, company: CompanyIntegration, headers: Dict) -> Dict:
        """Sync SmartMoving move sizes"""
        stats = {"processed": 0, "created": 0, "updated": 0, "failed": 0}
        
        try:
            response = await self.client.get(
                f"{company.apiBaseUrl}/api/move-sizes",
                headers=headers,
                params={"PageSize": 100}
            )
            response.raise_for_status()
            
            data = response.json()
            move_sizes = data.get("pageResults", [])
            
            for move_size_data in move_sizes:
                stats["processed"] += 1
                
                try:
                    # Prepare move size data
                    move_size_update = {
                        "externalId": move_size_data["id"],
                        "name": move_size_data["name"],
                        "description": move_size_data.get("description"),
                        "volume": move_size_data.get("volume", 0),
                        "weight": move_size_data.get("weight", 0),
                        "lastSyncedAt": datetime.utcnow(),
                        "externalData": move_size_data,
                        "updatedAt": datetime.utcnow()
                    }
                    
                    # Upsert move size
                    existing = await self.prisma.companymovesize.find_unique(
                        where={
                            "companyIntegrationId_externalId": {
                                "companyIntegrationId": company.id,
                                "externalId": move_size_data["id"]
                            }
                        }
                    )
                    
                    if existing:
                        await self.prisma.companymovesize.update(
                            where={"id": existing.id},
                            data=move_size_update
                        )
                        stats["updated"] += 1
                    else:
                        await self.prisma.companymovesize.create(
                            data={
                                "id": f"movesize-{company.id}-{move_size_data['id']}",
                                "companyIntegrationId": company.id,
                                **move_size_update
                            }
                        )
                        stats["created"] += 1
                        
                except Exception as e:
                    logger.error(f"Error syncing move size {move_size_data.get('id', 'unknown')}: {str(e)}")
                    stats["failed"] += 1
        
        except Exception as e:
            logger.error(f"Error fetching move sizes: {str(e)}")
            stats["failed"] += 1
        
        return stats
    
    async def sync_smartmoving_room_types(self, company: CompanyIntegration, headers: Dict) -> Dict:
        """Sync SmartMoving room types"""
        stats = {"processed": 0, "created": 0, "updated": 0, "failed": 0}
        
        try:
            response = await self.client.get(
                f"{company.apiBaseUrl}/api/premium/room-types",
                headers=headers,
                params={"PageSize": 100}
            )
            response.raise_for_status()
            
            data = response.json()
            room_types = data.get("pageResults", [])
            
            for room_type_data in room_types:
                stats["processed"] += 1
                
                try:
                    # Prepare room type data
                    room_type_update = {
                        "externalId": room_type_data["id"],
                        "name": room_type_data["name"],
                        "description": room_type_data.get("description"),
                        "order": room_type_data.get("order", 0),
                        "lastSyncedAt": datetime.utcnow(),
                        "externalData": room_type_data,
                        "updatedAt": datetime.utcnow()
                    }
                    
                    # Upsert room type
                    existing = await self.prisma.companyroomtype.find_unique(
                        where={
                            "companyIntegrationId_externalId": {
                                "companyIntegrationId": company.id,
                                "externalId": room_type_data["id"]
                            }
                        }
                    )
                    
                    if existing:
                        await self.prisma.companyroomtype.update(
                            where={"id": existing.id},
                            data=room_type_update
                        )
                        stats["updated"] += 1
                    else:
                        await self.prisma.companyroomtype.create(
                            data={
                                "id": f"roomtype-{company.id}-{room_type_data['id']}",
                                "companyIntegrationId": company.id,
                                **room_type_update
                            }
                        )
                        stats["created"] += 1
                        
                except Exception as e:
                    logger.error(f"Error syncing room type {room_type_data.get('id', 'unknown')}: {str(e)}")
                    stats["failed"] += 1
        
        except Exception as e:
            logger.error(f"Error fetching room types: {str(e)}")
            stats["failed"] += 1
        
        return stats
    
    async def sync_smartmoving_users(self, company: CompanyIntegration, headers: Dict) -> Dict:
        """Sync SmartMoving users"""
        stats = {"processed": 0, "created": 0, "updated": 0, "failed": 0}
        
        try:
            response = await self.client.get(
                f"{company.apiBaseUrl}/api/users",
                headers=headers,
                params={"PageSize": 100}
            )
            response.raise_for_status()
            
            data = response.json()
            users = data.get("pageResults", [])
            
            for user_data in users:
                stats["processed"] += 1
                
                try:
                    # Prepare user data
                    user_update = {
                        "externalId": user_data["id"],
                        "name": user_data["name"],
                        "title": user_data.get("title"),
                        "email": user_data.get("email"),
                        "primaryBranchId": user_data.get("primaryBranch", {}).get("id"),
                        "roleId": user_data.get("role", {}).get("id"),
                        "roleName": user_data.get("role", {}).get("name"),
                        "lastSyncedAt": datetime.utcnow(),
                        "externalData": user_data,
                        "updatedAt": datetime.utcnow()
                    }
                    
                    # Upsert user
                    existing = await self.prisma.companyuser.find_unique(
                        where={
                            "companyIntegrationId_externalId": {
                                "companyIntegrationId": company.id,
                                "externalId": user_data["id"]
                            }
                        }
                    )
                    
                    if existing:
                        await self.prisma.companyuser.update(
                            where={"id": existing.id},
                            data=user_update
                        )
                        stats["updated"] += 1
                    else:
                        await self.prisma.companyuser.create(
                            data={
                                "id": f"user-{company.id}-{user_data['id']}",
                                "companyIntegrationId": company.id,
                                **user_update
                            }
                        )
                        stats["created"] += 1
                        
                except Exception as e:
                    logger.error(f"Error syncing user {user_data.get('id', 'unknown')}: {str(e)}")
                    stats["failed"] += 1
        
        except Exception as e:
            logger.error(f"Error fetching users: {str(e)}")
            stats["failed"] += 1
        
        return stats
    
    async def sync_smartmoving_referral_sources(self, company: CompanyIntegration, headers: Dict) -> Dict:
        """Sync SmartMoving referral sources"""
        stats = {"processed": 0, "created": 0, "updated": 0, "failed": 0}
        
        try:
            response = await self.client.get(
                f"{company.apiBaseUrl}/api/referral-sources",
                headers=headers,
                params={"PageSize": 100}
            )
            response.raise_for_status()
            
            data = response.json()
            referral_sources = data.get("pageResults", [])
            
            for referral_data in referral_sources:
                stats["processed"] += 1
                
                try:
                    # Prepare referral source data
                    referral_update = {
                        "externalId": referral_data["id"],
                        "name": referral_data["name"],
                        "isLeadProvider": referral_data.get("isLeadProvider", False),
                        "isPublic": referral_data.get("isPublic", False),
                        "lastSyncedAt": datetime.utcnow(),
                        "externalData": referral_data,
                        "updatedAt": datetime.utcnow()
                    }
                    
                    # Upsert referral source
                    existing = await self.prisma.companyreferralsource.find_unique(
                        where={
                            "companyIntegrationId_externalId": {
                                "companyIntegrationId": company.id,
                                "externalId": referral_data["id"]
                            }
                        }
                    )
                    
                    if existing:
                        await self.prisma.companyreferralsource.update(
                            where={"id": existing.id},
                            data=referral_update
                        )
                        stats["updated"] += 1
                    else:
                        await self.prisma.companyreferralsource.create(
                            data={
                                "id": f"referral-{company.id}-{referral_data['id']}",
                                "companyIntegrationId": company.id,
                                **referral_update
                            }
                        )
                        stats["created"] += 1
                        
                except Exception as e:
                    logger.error(f"Error syncing referral source {referral_data.get('id', 'unknown')}: {str(e)}")
                    stats["failed"] += 1
        
        except Exception as e:
            logger.error(f"Error fetching referral sources: {str(e)}")
            stats["failed"] += 1
        
        return stats
    
    async def run_scheduled_syncs(self):
        """Run all pending scheduled syncs"""
        logger.info("Starting scheduled company syncs...")
        
        pending_syncs = await self.get_pending_syncs()
        logger.info(f"Found {len(pending_syncs)} companies to sync")
        
        for company in pending_syncs:
            try:
                await self.sync_company_data(company)
            except Exception as e:
                logger.error(f"Error in scheduled sync for {company.name}: {str(e)}")
        
        logger.info("Scheduled company syncs completed")

# Background task for running syncs
async def run_company_syncs():
    """Background task to run company syncs every 12 hours"""
    while True:
        try:
            async with CompanySyncService() as sync_service:
                await sync_service.run_scheduled_syncs()
        except Exception as e:
            logger.error(f"Error in company sync background task: {str(e)}")
        
        # Wait 12 hours before next sync
        await asyncio.sleep(12 * 60 * 60)  # 12 hours in seconds
