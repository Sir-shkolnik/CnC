#!/usr/bin/env python3
"""
Comprehensive Database Tree and Schema Analysis
Analyzes and visualizes the complete database structure, relationships, and data distribution
"""

import psycopg2
import json
from datetime import datetime
from typing import Dict, List, Any, Tuple
import sys
import os

# Database configuration
DB_CONFIG = {
    "host": "postgres",
    "port": "5432",
    "database": "c_and_c_crm",
    "user": "c_and_c_user",
    "password": "c_and_c_password"
}

class DatabaseTreeAnalyzer:
    def __init__(self):
        self.conn = None
        self.lgm_client_id = None
    
    def connect(self):
        """Establish database connection"""
        try:
            self.conn = psycopg2.connect(**DB_CONFIG)
            print("✅ Database connection established")
            return True
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            return False
    
    def disconnect(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            print("🔌 Database connection closed")
    
    def get_lgm_client_id(self):
        """Get LGM client ID"""
        if self.lgm_client_id:
            return self.lgm_client_id
        
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT id FROM "Client" 
            WHERE name LIKE '%LGM%' OR name LIKE '%Let''s Get Moving%'
            LIMIT 1
        """)
        result = cursor.fetchone()
        cursor.close()
        
        if result:
            self.lgm_client_id = result[0]
            return self.lgm_client_id
        return None
    
    def analyze_database_tree(self):
        """Analyze complete database tree structure"""
        print("🌳 COMPREHENSIVE DATABASE TREE ANALYSIS")
        print("=" * 60)
        
        # 1. Database Overview
        self.analyze_database_overview()
        
        # 2. Table Structure Analysis
        self.analyze_table_structures()
        
        # 3. Relationship Analysis
        self.analyze_relationships()
        
        # 4. Data Distribution Analysis
        self.analyze_data_distribution()
        
        # 5. LGM Data Analysis
        self.analyze_lgm_data()
        
        # 6. Index and Performance Analysis
        self.analyze_indexes_and_performance()
        
        # 7. Generate Tree Visualization
        self.generate_tree_visualization()
    
    def analyze_database_overview(self):
        """Analyze database overview"""
        print("\n📊 DATABASE OVERVIEW")
        print("-" * 40)
        
        cursor = self.conn.cursor()
        
        # Database size
        cursor.execute("SELECT pg_size_pretty(pg_database_size(current_database()))")
        db_size = cursor.fetchone()[0]
        
        # Table count
        cursor.execute("""
            SELECT COUNT(*) FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)
        table_count = cursor.fetchone()[0]
        
        # Total row count
        cursor.execute("""
            SELECT SUM(reltuples)::bigint AS total_rows
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public' AND c.relkind = 'r'
        """)
        total_rows = cursor.fetchone()[0] or 0
        
        cursor.close()
        
        print(f"Database Size: {db_size}")
        print(f"Total Tables: {table_count}")
        print(f"Total Rows: {total_rows:,}")
    
    def analyze_table_structures(self):
        """Analyze table structures"""
        print("\n🏗️  TABLE STRUCTURES")
        print("-" * 40)
        
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT 
                table_name,
                COUNT(*) as column_count,
                SUM(CASE WHEN is_nullable = 'NO' THEN 1 ELSE 0 END) as not_null_columns
            FROM information_schema.columns 
            WHERE table_schema = 'public'
            GROUP BY table_name
            ORDER BY table_name
        """)
        tables = cursor.fetchall()
        cursor.close()
        
        for table_name, column_count, not_null_columns in tables:
            print(f"{table_name:25} | {column_count:2} columns | {not_null_columns:2} NOT NULL")
    
    def analyze_relationships(self):
        """Analyze table relationships"""
        print("\n🔗 RELATIONSHIP ANALYSIS")
        print("-" * 40)
        
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT 
                tc.table_name as source_table,
                kcu.column_name as source_column,
                ccu.table_name as target_table,
                ccu.column_name as target_column
            FROM information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
                AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' 
                AND tc.table_schema = 'public'
            ORDER BY tc.table_name, kcu.column_name
        """)
        relationships = cursor.fetchall()
        cursor.close()
        
        # Group by source table
        rel_by_table = {}
        for rel in relationships:
            source_table = rel[0]
            if source_table not in rel_by_table:
                rel_by_table[source_table] = []
            rel_by_table[source_table].append(rel)
        
        for source_table, rels in rel_by_table.items():
            print(f"\n{source_table}:")
            for rel in rels:
                print(f"  └─ {rel[1]} → {rel[2]}.{rel[3]}")
    
    def analyze_data_distribution(self):
        """Analyze data distribution across tables"""
        print("\n📈 DATA DISTRIBUTION")
        print("-" * 40)
        
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT 
                schemaname,
                tablename,
                n_tup_ins as inserts,
                n_tup_upd as updates,
                n_tup_del as deletes,
                n_live_tup as live_rows,
                n_dead_tup as dead_rows
            FROM pg_stat_user_tables 
            WHERE schemaname = 'public'
            ORDER BY n_live_tup DESC
        """)
        stats = cursor.fetchall()
        cursor.close()
        
        print(f"{'Table':<20} | {'Live Rows':<10} | {'Dead Rows':<10} | {'Inserts':<8} | {'Updates':<8} | {'Deletes':<8}")
        print("-" * 80)
        
        for stat in stats:
            table_name = stat[1]
            live_rows = stat[5] or 0
            dead_rows = stat[6] or 0
            inserts = stat[2] or 0
            updates = stat[3] or 0
            deletes = stat[4] or 0
            
            print(f"{table_name:<20} | {live_rows:<10} | {dead_rows:<10} | {inserts:<8} | {updates:<8} | {deletes:<8}")
    
    def analyze_lgm_data(self):
        """Analyze LGM-specific data"""
        print("\n🏢 LGM DATA ANALYSIS")
        print("-" * 40)
        
        lgm_client_id = self.get_lgm_client_id()
        if not lgm_client_id:
            print("No LGM client found")
            return
        
        cursor = self.conn.cursor()
        
        # LGM Client info
        cursor.execute("""
            SELECT name, industry, "isFranchise", "createdAt"
            FROM "Client" WHERE id = %s
        """, (lgm_client_id,))
        client = cursor.fetchone()
        
        if client:
            name, industry, is_franchise, created_at = client
            print(f"Client: {name}")
            print(f"Industry: {industry}")
            print(f"Franchise: {is_franchise}")
            print(f"Created: {created_at}")
        
        # LGM Locations summary
        cursor.execute("""
            SELECT 
                COUNT(*) as total_locations,
                COUNT(CASE WHEN "ownership_type" = 'CORPORATE' THEN 1 END) as corporate,
                COUNT(CASE WHEN "ownership_type" = 'FRANCHISE' THEN 1 END) as franchise,
                COUNT(CASE WHEN storage != 'NO' THEN 1 END) as with_storage,
                COUNT(CASE WHEN "cx_care" = true THEN 1 END) as with_cx_care
            FROM "Location" WHERE "clientId" = %s
        """, (lgm_client_id,))
        location_stats = cursor.fetchone()
        
        if location_stats:
            total, corporate, franchise, with_storage, with_cx_care = location_stats
            print(f"\nLocations: {total} total")
            print(f"  Corporate: {corporate}")
            print(f"  Franchise: {franchise}")
            print(f"  With Storage: {with_storage}")
            print(f"  With CX Care: {with_cx_care}")
        
        # LGM Users summary
        cursor.execute("""
            SELECT 
                COUNT(*) as total_users,
                COUNT(CASE WHEN role = 'MANAGER' THEN 1 END) as managers,
                COUNT(CASE WHEN role = 'ADMIN' THEN 1 END) as admins,
                COUNT(CASE WHEN role = 'DRIVER' THEN 1 END) as drivers,
                COUNT(CASE WHEN role = 'MOVER' THEN 1 END) as movers,
                COUNT(CASE WHEN role = 'DISPATCHER' THEN 1 END) as dispatchers,
                COUNT(CASE WHEN role = 'AUDITOR' THEN 1 END) as auditors
            FROM "User" WHERE "clientId" = %s
        """, (lgm_client_id,))
        user_stats = cursor.fetchone()
        
        if user_stats:
            total, managers, admins, drivers, movers, dispatchers, auditors = user_stats
            print(f"\nUsers: {total} total")
            print(f"  Managers: {managers}")
            print(f"  Admins: {admins}")
            print(f"  Drivers: {drivers}")
            print(f"  Movers: {movers}")
            print(f"  Dispatchers: {dispatchers}")
            print(f"  Auditors: {auditors}")
        
        cursor.close()
    
    def analyze_indexes_and_performance(self):
        """Analyze indexes and performance"""
        print("\n⚡ INDEX & PERFORMANCE ANALYSIS")
        print("-" * 40)
        
        cursor = self.conn.cursor()
        
        # Index analysis
        cursor.execute("""
            SELECT 
                t.relname as table_name,
                i.relname as index_name,
                array_to_string(array_agg(a.attname), ', ') as column_names,
                pg_size_pretty(pg_relation_size(i.oid)) as index_size
            FROM pg_class t
            JOIN pg_index ix ON t.oid = ix.indrelid
            JOIN pg_class i ON ix.indexrelid = i.oid
            JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
            WHERE t.relkind = 'r' 
                AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
                AND i.relname NOT LIKE 'pg_%'
            GROUP BY t.relname, i.relname, i.oid
            ORDER BY t.relname, i.relname
        """)
        indexes = cursor.fetchall()
        
        print("Indexes:")
        for index in indexes:
            table_name, index_name, columns, size = index
            print(f"  {table_name}.{index_name} ({columns}) - {size}")
        
        # Table sizes
        cursor.execute("""
            SELECT 
                schemaname,
                tablename,
                pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
                pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
                pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        """)
        table_sizes = cursor.fetchall()
        
        print(f"\nTable Sizes:")
        for size_info in table_sizes:
            schema, table, total, table_size, index_size = size_info
            print(f"  {table}: {total} (table: {table_size}, indexes: {index_size})")
        
        cursor.close()
    
    def generate_tree_visualization(self):
        """Generate tree visualization of database structure"""
        print("\n🌳 DATABASE TREE VISUALIZATION")
        print("-" * 40)
        
        cursor = self.conn.cursor()
        
        # Get all tables with their relationships
        cursor.execute("""
            SELECT DISTINCT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)
        tables = [row[0] for row in cursor.fetchall()]
        
        # Get foreign key relationships
        cursor.execute("""
            SELECT 
                tc.table_name as source_table,
                ccu.table_name as target_table
            FROM information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
                AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' 
                AND tc.table_schema = 'public'
        """)
        relationships = cursor.fetchall()
        
        # Build relationship graph
        graph = {}
        for table in tables:
            graph[table] = []
        
        for rel in relationships:
            source, target = rel[0], rel[1]
            if source in graph:
                graph[source].append(target)
        
        # Find root tables (no incoming relationships)
        all_targets = set()
        for targets in graph.values():
            all_targets.update(targets)
        
        root_tables = [table for table in tables if table not in all_targets]
        
        # Print tree structure
        def print_tree(table, level=0, visited=None):
            if visited is None:
                visited = set()
            
            if table in visited:
                return
            
            visited.add(table)
            indent = "  " * level
            print(f"{indent}├─ {table}")
            
            for child in graph.get(table, []):
                if child not in visited:
                    print_tree(child, level + 1, visited)
        
        print("Database Structure Tree:")
        for root in root_tables:
            print_tree(root)
        
        cursor.close()
    
    def generate_comprehensive_report(self):
        """Generate comprehensive database report"""
        print("\n📋 GENERATING COMPREHENSIVE REPORT")
        print("-" * 40)
        
        report_data = {
            "timestamp": datetime.now().isoformat(),
            "database_info": {},
            "table_structures": {},
            "relationships": {},
            "data_distribution": {},
            "lgm_data": {},
            "performance_metrics": {}
        }
        
        # Collect all data
        cursor = self.conn.cursor()
        
        # Database info
        cursor.execute("SELECT current_database(), version()")
        db_info = cursor.fetchone()
        report_data["database_info"] = {
            "name": db_info[0],
            "version": db_info[1].split()[1] if db_info[1] else "Unknown"
        }
        
        # Table structures
        cursor.execute("""
            SELECT 
                table_name,
                COUNT(*) as column_count
            FROM information_schema.columns 
            WHERE table_schema = 'public'
            GROUP BY table_name
        """)
        table_structures = cursor.fetchall()
        report_data["table_structures"] = {
            table: {"column_count": count} 
            for table, count in table_structures
        }
        
        # Data distribution
        cursor.execute("""
            SELECT 
                tablename,
                n_live_tup as row_count
            FROM pg_stat_user_tables 
            WHERE schemaname = 'public'
        """)
        data_distribution = cursor.fetchall()
        report_data["data_distribution"] = {
            table: {"row_count": count or 0} 
            for table, count in data_distribution
        }
        
        cursor.close()
        
        # Save report
        report_file = f"database_tree_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(report_data, f, indent=2, default=str)
        
        print(f"📄 Comprehensive report saved to: {report_file}")
    
    def run_analysis(self):
        """Run complete database analysis"""
        if not self.connect():
            return False
        
        try:
            self.analyze_database_tree()
            self.generate_comprehensive_report()
            return True
        finally:
            self.disconnect()

def main():
    """Main function"""
    analyzer = DatabaseTreeAnalyzer()
    success = analyzer.run_analysis()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main() 