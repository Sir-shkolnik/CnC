#!/usr/bin/env python3
"""
Complete LGM Data Research Script
Research all 66 branches and their data structure for comprehensive sync
"""

import asyncio
import aiohttp
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any

class LGMDataResearch:
    def __init__(self):
        self.api_key = "185840176c73420fbd3a473c2fdccedb"
        self.base_url = "https://api-public.smartmoving.com/v1/api"
        self.session = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def get_all_branches(self) -> List[Dict[str, Any]]:
        """Get all 66 LGM branches"""
        print("🔍 Getting all LGM branches...")
        
        url = f"{self.base_url}/branches"
        headers = {
            "x-api-key": self.api_key,
            "Content-Type": "application/json"
        }
        
        async with self.session.get(url, headers=headers) as response:
            data = await response.json()
            
            branches = data.get("pageResults", [])
            total_results = data.get("totalResults", 0)
            total_pages = data.get("totalPages", 1)
            
            print(f"✅ Found {len(branches)} branches (Total: {total_results}, Pages: {total_pages})")
            
            return branches
    
    async def get_branch_customers(self, branch_id: str, branch_name: str, date: str) -> Dict[str, Any]:
        """Get customers for a specific branch on a specific date"""
        print(f"  📍 Getting customers for {branch_name} on {date}...")
        
        url = f"{self.base_url}/customers"
        params = {
            "FromServiceDate": date.replace("-", ""),
            "ToServiceDate": date.replace("-", ""),
            "IncludeOpportunityInfo": "true",
            "Page": 1,
            "PageSize": 100,
            "BranchId": branch_id
        }
        headers = {
            "x-api-key": self.api_key,
            "Content-Type": "application/json"
        }
        
        all_customers = []
        page = 1
        total_pages = 1
        
        while page <= total_pages:
            params["Page"] = page
            
            async with self.session.get(url, params=params, headers=headers) as response:
                data = await response.json()
                
                customers = data.get("pageResults", [])
                total_pages = data.get("totalPages", 1)
                total_results = data.get("totalResults", 0)
                
                all_customers.extend(customers)
                
                if page == 1:
                    print(f"    📊 Page {page}/{total_pages}: {len(customers)} customers (Total: {total_results})")
                
                page += 1
        
        # Extract jobs from customers
        all_jobs = []
        for customer in all_customers:
            opportunities = customer.get("opportunities", [])
            for opportunity in opportunities:
                jobs = opportunity.get("jobs", [])
                for job in jobs:
                    job["customer"] = customer
                    job["opportunity"] = opportunity
                    job["branch_id"] = branch_id
                    job["branch_name"] = branch_name
                    all_jobs.append(job)
        
        print(f"    ✅ Extracted {len(all_jobs)} jobs from {len(all_customers)} customers")
        
        return {
            "branch_id": branch_id,
            "branch_name": branch_name,
            "date": date,
            "customers_count": len(all_customers),
            "jobs_count": len(all_jobs),
            "customers": all_customers,
            "jobs": all_jobs
        }
    
    async def research_complete_data(self):
        """Research complete LGM data structure"""
        print("🚀 Starting Complete LGM Data Research")
        print("=" * 60)
        
        # Get all branches
        branches = await self.get_all_branches()
        
        # Get today and tomorrow dates
        today = datetime.now().strftime("%Y-%m-%d")
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        
        print(f"\n📅 Researching data for:")
        print(f"   Today: {today}")
        print(f"   Tomorrow: {tomorrow}")
        print()
        
        # Research data for first 5 branches (for testing)
        test_branches = branches[:5]
        
        all_data = {
            "research_date": datetime.now().isoformat(),
            "branches_total": len(branches),
            "test_branches": len(test_branches),
            "dates": [today, tomorrow],
            "branch_data": []
        }
        
        for branch in test_branches:
            branch_id = branch["id"]
            branch_name = branch["name"]
            
            print(f"🏢 Researching Branch: {branch_name}")
            print(f"   ID: {branch_id}")
            
            branch_data = {
                "branch": branch,
                "today_data": None,
                "tomorrow_data": None
            }
            
            # Get today's data
            try:
                today_data = await self.get_branch_customers(branch_id, branch_name, today)
                branch_data["today_data"] = today_data
            except Exception as e:
                print(f"    ❌ Error getting today's data: {e}")
            
            # Get tomorrow's data
            try:
                tomorrow_data = await self.get_branch_customers(branch_id, branch_name, tomorrow)
                branch_data["tomorrow_data"] = tomorrow_data
            except Exception as e:
                print(f"    ❌ Error getting tomorrow's data: {e}")
            
            all_data["branch_data"].append(branch_data)
            print()
        
        # Calculate totals
        total_customers_today = sum(
            len(bd["today_data"]["customers"]) if bd["today_data"] else 0 
            for bd in all_data["branch_data"]
        )
        total_jobs_today = sum(
            len(bd["today_data"]["jobs"]) if bd["today_data"] else 0 
            for bd in all_data["branch_data"]
        )
        total_customers_tomorrow = sum(
            len(bd["tomorrow_data"]["customers"]) if bd["tomorrow_data"] else 0 
            for bd in all_data["branch_data"]
        )
        total_jobs_tomorrow = sum(
            len(bd["tomorrow_data"]["jobs"]) if bd["tomorrow_data"] else 0 
            for bd in all_data["branch_data"]
        )
        
        print("📊 RESEARCH SUMMARY")
        print("=" * 60)
        print(f"Total Branches: {len(branches)}")
        print(f"Test Branches: {len(test_branches)}")
        print(f"Today - Total Customers: {total_customers_today}")
        print(f"Today - Total Jobs: {total_jobs_today}")
        print(f"Tomorrow - Total Customers: {total_customers_tomorrow}")
        print(f"Tomorrow - Total Jobs: {total_jobs_tomorrow}")
        
        # Estimate for all branches
        if test_branches:
            avg_customers_per_branch_today = total_customers_today / len(test_branches)
            avg_jobs_per_branch_today = total_jobs_today / len(test_branches)
            estimated_total_customers_today = avg_customers_per_branch_today * len(branches)
            estimated_total_jobs_today = avg_jobs_per_branch_today * len(branches)
            
            print(f"\n📈 ESTIMATES FOR ALL {len(branches)} BRANCHES:")
            print(f"Average Customers per Branch (Today): {avg_customers_per_branch_today:.1f}")
            print(f"Average Jobs per Branch (Today): {avg_jobs_per_branch_today:.1f}")
            print(f"Estimated Total Customers (Today): {estimated_total_customers_today:.0f}")
            print(f"Estimated Total Jobs (Today): {estimated_total_jobs_today:.0f}")
        
        # Save research data
        with open("lgm_research_data.json", "w") as f:
            json.dump(all_data, f, indent=2, default=str)
        
        print(f"\n💾 Research data saved to: lgm_research_data.json")
        
        return all_data

async def main():
    async with LGMDataResearch() as research:
        await research.research_complete_data()

if __name__ == "__main__":
    asyncio.run(main()) 