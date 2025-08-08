#!/usr/bin/env python3
"""
C&C CRM Database Connection Test
Test connection to Render deployment and read all current data
"""

import os
import psycopg2
from psycopg2.extras import RealDictCursor
import json
from datetime import datetime
from typing import Dict, Any, List

# Database connection configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://c_and_c_user:c_and_c_password@localhost:5432/c_and_c_crm")

def connect_to_database():
    """Connect to the database"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        print("✅ Successfully connected to database")
        return conn
    except Exception as e:
        print(f"❌ Failed to connect to database: {e}")
        return None

def get_table_names(conn) -> List[str]:
    """Get all table names from the database"""
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
                ORDER BY table_name
            """)
            tables = [row[0] for row in cursor.fetchall()]
            return tables
    except Exception as e:
        print(f"❌ Error getting table names: {e}")
        return []

def get_table_schema(conn, table_name: str) -> Dict[str, Any]:
    """Get schema information for a table"""
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = %s 
                ORDER BY ordinal_position
            """, (table_name,))
            
            columns = []
            for row in cursor.fetchall():
                columns.append({
                    "name": row[0],
                    "type": row[1],
                    "nullable": row[2] == "YES",
                    "default": row[3]
                })
            
            return {"table_name": table_name, "columns": columns}
    except Exception as e:
        print(f"❌ Error getting schema for {table_name}: {e}")
        return {"table_name": table_name, "columns": []}

def get_table_data(conn, table_name: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Get data from a table"""
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(f"SELECT * FROM \"{table_name}\" LIMIT %s", (limit,))
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
    except Exception as e:
        print(f"❌ Error getting data from {table_name}: {e}")
        return []

def get_table_count(conn, table_name: str) -> int:
    """Get row count for a table"""
    try:
        with conn.cursor() as cursor:
            cursor.execute(f'SELECT COUNT(*) FROM "{table_name}"')
            return cursor.fetchone()[0]
    except Exception as e:
        print(f"❌ Error getting count for {table_name}: {e}")
        return 0

def format_json(obj):
    """Format JSON for better readability"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj

def main():
    """Main function to test database connection and read data"""
    print("🚀 C&C CRM Database Connection Test")
    print("=" * 50)
    
    # Connect to database
    conn = connect_to_database()
    if not conn:
        return
    
    try:
        # Get all table names
        print("\n📋 Getting table names...")
        tables = get_table_names(conn)
        print(f"Found {len(tables)} tables: {', '.join(tables)}")
        
        # Database overview
        print("\n📊 Database Overview:")
        print("-" * 30)
        
        total_rows = 0
        table_info = {}
        
        for table in tables:
            count = get_table_count(conn, table)
            total_rows += count
            table_info[table] = count
            print(f"{table}: {count} rows")
        
        print(f"\nTotal rows across all tables: {total_rows}")
        
        # Detailed analysis for each table
        print("\n🔍 Detailed Table Analysis:")
        print("=" * 50)
        
        for table in tables:
            print(f"\n📋 Table: {table}")
            print("-" * 30)
            
            # Get schema
            schema = get_table_schema(conn, table)
            print(f"Columns ({len(schema['columns'])}):")
            for col in schema['columns']:
                nullable = "NULL" if col['nullable'] else "NOT NULL"
                default = f" DEFAULT {col['default']}" if col['default'] else ""
                print(f"  - {col['name']}: {col['type']} {nullable}{default}")
            
            # Get sample data
            data = get_table_data(conn, table, limit=5)
            count = get_table_count(conn, table)
            
            print(f"Row count: {count}")
            print(f"Sample data ({len(data)} rows):")
            
            if data:
                for i, row in enumerate(data, 1):
                    print(f"  Row {i}:")
                    for key, value in row.items():
                        formatted_value = format_json(value)
                        if isinstance(formatted_value, str) and len(formatted_value) > 100:
                            formatted_value = formatted_value[:100] + "..."
                        print(f"    {key}: {formatted_value}")
            else:
                print("  No data found")
        
        # Special analysis for key tables
        print("\n🎯 Key Tables Analysis:")
        print("=" * 30)
        
        # Client analysis
        if "Client" in tables:
            print("\n🏢 Client Analysis:")
            clients = get_table_data(conn, "Client", limit=100)
            for client in clients:
                print(f"  - {client.get('name', 'Unknown')} (ID: {client.get('id', 'Unknown')})")
                print(f"    Industry: {client.get('industry', 'N/A')}")
                print(f"    Franchise: {client.get('isFranchise', 'N/A')}")
                print(f"    Created: {format_json(client.get('createdAt', 'N/A'))}")
        
        # User analysis
        if "User" in tables:
            print("\n👥 User Analysis:")
            users = get_table_data(conn, "User", limit=100)
            role_counts = {}
            for user in users:
                role = user.get('role', 'Unknown')
                role_counts[role] = role_counts.get(role, 0) + 1
            
            print("  Role distribution:")
            for role, count in role_counts.items():
                print(f"    {role}: {count} users")
            
            print("  Sample users:")
            for user in users[:5]:
                print(f"    - {user.get('name', 'Unknown')} ({user.get('email', 'N/A')}) - {user.get('role', 'Unknown')}")
        
        # Location analysis
        if "Location" in tables:
            print("\n📍 Location Analysis:")
            locations = get_table_data(conn, "Location", limit=100)
            for location in locations:
                print(f"  - {location.get('name', 'Unknown')} (ID: {location.get('id', 'Unknown')})")
                print(f"    Timezone: {location.get('timezone', 'N/A')}")
                print(f"    Address: {location.get('address', 'N/A')}")
        
        # Customer analysis
        if "Customer" in tables:
            print("\n👤 Customer Analysis:")
            customers = get_table_data(conn, "Customer", limit=100)
            lead_status_counts = {}
            for customer in customers:
                status = customer.get('leadStatus', 'Unknown')
                lead_status_counts[status] = lead_status_counts.get(status, 0) + 1
            
            print("  Lead status distribution:")
            for status, count in lead_status_counts.items():
                print(f"    {status}: {count} customers")
            
            print("  Sample customers:")
            for customer in customers[:5]:
                name = f"{customer.get('firstName', '')} {customer.get('lastName', '')}".strip()
                print(f"    - {name} ({customer.get('email', 'N/A')}) - {customer.get('leadStatus', 'Unknown')}")
        
        # Quote analysis
        if "Quote" in tables:
            print("\n💰 Quote Analysis:")
            quotes = get_table_data(conn, "Quote", limit=100)
            status_counts = {}
            total_value = 0
            for quote in quotes:
                status = quote.get('status', 'Unknown')
                status_counts[status] = status_counts.get(status, 0) + 1
                total_value += float(quote.get('totalAmount', 0) or 0)
            
            print("  Quote status distribution:")
            for status, count in status_counts.items():
                print(f"    {status}: {count} quotes")
            
            print(f"  Total quote value: ${total_value:,.2f}")
        
        # Journey analysis
        if "TruckJourney" in tables:
            print("\n🚛 Journey Analysis:")
            journeys = get_table_data(conn, "TruckJourney", limit=100)
            status_counts = {}
            for journey in journeys:
                status = journey.get('status', 'Unknown')
                status_counts[status] = status_counts.get(status, 0) + 1
            
            print("  Journey status distribution:")
            for status, count in status_counts.items():
                print(f"    {status}: {count} journeys")
        
        # Save detailed report
        print("\n💾 Saving detailed report...")
        report = {
            "timestamp": datetime.now().isoformat(),
            "database_url": DATABASE_URL.replace(DATABASE_URL.split('@')[0].split(':')[-1], '***') if '@' in DATABASE_URL else DATABASE_URL,
            "table_count": len(tables),
            "total_rows": total_rows,
            "table_info": table_info,
            "tables": {}
        }
        
        for table in tables:
            report["tables"][table] = {
                "schema": get_table_schema(conn, table),
                "count": get_table_count(conn, table),
                "sample_data": get_table_data(conn, table, limit=3)
            }
        
        with open("database_report.json", "w") as f:
            json.dump(report, f, indent=2, default=str)
        
        print("✅ Detailed report saved to database_report.json")
        
    except Exception as e:
        print(f"❌ Error during analysis: {e}")
    
    finally:
        conn.close()
        print("\n🔌 Database connection closed")

if __name__ == "__main__":
    main()
