import psycopg2
import json
from datetime import datetime
import os

# Database configuration
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "postgres"),
    "port": os.getenv("DB_PORT", "5432"),
    "database": os.getenv("DB_NAME", "c_and_c_crm"),
    "user": os.getenv("DB_USER", "c_and_c_user"),
    "password": os.getenv("DB_PASSWORD", "c_and_c_password")
}

# LGM Client ID
LGM_CLIENT_ID = "clm_f55e13de_a5c4_4990_ad02_34bb07187daa"

# Complete LGM Locations Data
LGM_LOCATIONS_COMPLETE = {
    # FRANCHISE LOCATIONS
    "ABBOTSFORD": {
        "contact": "Anees Aps",
        "direct_line": "780-920-1935",
        "ownership_type": "FRANCHISE",
        "trucks": "1+",
        "trucks_shared_with": "",
        "storage": "NO",
        "storage_pricing": "",
        "cx_care": True
    },
    "AJAX": {
        "contact": "ANDREW",
        "direct_line": "(647) 904-8166",
        "ownership_type": "FRANCHISE",
        "trucks": "3+",
        "trucks_shared_with": "",
        "storage": "NO",
        "storage_pricing": "",
        "cx_care": True
    },
    "AURORA": {
        "contact": "PARSA",
        "direct_line": "506-461-2035",
        "ownership_type": "FRANCHISE",
        "trucks": "2+",
        "trucks_shared_with": "BARRIE, MARKHAM",
        "storage": "LOCKER",
        "storage_pricing": "10×20 - $550, 10×15 - $390, 10×12 - $300, 10×10 - $250, 8×10 - $190",
        "cx_care": False
    },
    "BARRIE": {
        "contact": "PARSA",
        "direct_line": "506-461-2035",
        "ownership_type": "FRANCHISE",
        "trucks": "2+",
        "trucks_shared_with": "AURORA, MARKHAM",
        "storage": "LOCKER",
        "storage_pricing": "10×20 - $550, 10×15 - $390, 10×12 - $300, 10×10 - $250, 8×10 - $190",
        "cx_care": False
    },
    "BRAMPTON": {
        "contact": "AERISH / AKSHIT",
        "direct_line": "416-570-0828",
        "ownership_type": "FRANCHISE",
        "trucks": "3+",
        "trucks_shared_with": "MILTON, OAKVILLE",
        "storage": "LOCKER",
        "storage_pricing": "10x10x8 - $299, 10x20x8 - $499, No oversized items",
        "cx_care": True
    },
    "BRANTFORD": {
        "contact": "HARSH",
        "direct_line": "647-891-4106",
        "ownership_type": "FRANCHISE",
        "trucks": "1+",
        "trucks_shared_with": "",
        "storage": "LOCKER",
        "storage_pricing": "BASED ON AVAILABILITY (REACH OUT TO FRANCHISE)",
        "cx_care": False
    },
    "BURLINGTON": {
        "contact": "SIMRANJIT",
        "direct_line": "647-512-2697, 647-460-0923",
        "ownership_type": "FRANCHISE",
        "trucks": "R+",
        "trucks_shared_with": "ST CATHERINES, WINDSOR",
        "storage": "NO",
        "storage_pricing": "",
        "cx_care": True
    },
    "CALGARY": {
        "contact": "JASDEEP",
        "direct_line": "514-632-0313",
        "ownership_type": "FRANCHISE",
        "trucks": "3+",
        "trucks_shared_with": "",
        "storage": "LOCKER",
        "storage_pricing": "8x10 - $199, 8x20 - $269, 8x40 - $399, No oversized items",
        "cx_care": False
    },
    "COQUITLAM": {
        "contact": "TODD",
        "direct_line": "604-317-7615",
        "ownership_type": "FRANCHISE",
        "trucks": "1+",
        "trucks_shared_with": "",
        "storage": "NO",
        "storage_pricing": "",
        "cx_care": True
    },
    "FREDERICTON": {
        "contact": "KAMBIZ",
        "direct_line": "506-259-8515",
        "ownership_type": "FRANCHISE",
        "trucks": "1+",
        "trucks_shared_with": "",
        "storage": "NO",
        "storage_pricing": "",
        "cx_care": True
    },
    "HALIFAX": {
        "contact": "MAHMOUD",
        "direct_line": "506-461-4870",
        "ownership_type": "FRANCHISE",
        "trucks": "2+",
        "trucks_shared_with": "",
        "storage": "NO",
        "storage_pricing": "",
        "cx_care": False
    },
    "KELOWNA": {
        "contact": "TODD",
        "direct_line": "604-317-7615",
        "ownership_type": "FRANCHISE",
        "trucks": "1+",
        "trucks_shared_with": "",
        "storage": "POD",
        "storage_pricing": "ONLY 3 PODS WHICH ARE 5x10x10 - $275 -- ask before you book if the pods are available",
        "cx_care": True
    },
    "KINGSTON": {
        "contact": "ANIRUDH",
        "direct_line": "613-893-7008",
        "ownership_type": "FRANCHISE",
        "trucks": "4",
        "trucks_shared_with": "",
        "storage": "POD",
        "storage_pricing": "5x12x10- $100, 10x12x10- $175, No oversized items",
        "cx_care": True
    },
    "LETHBRIDGE": {
        "contact": "PROMISE",
        "direct_line": "403-667-0507",
        "ownership_type": "FRANCHISE",
        "trucks": "1+",
        "trucks_shared_with": "",
        "storage": "LOCKER",
        "storage_pricing": "13 ft X 9 ft X 10 ft - $199, 11 ft X 9 ft X 10 ft- $175, 11 ft X 8 ft X 10 ft - $150",
        "cx_care": True
    },
    "LONDON": {
        "contact": "KYLE",
        "direct_line": "226-219-7039",
        "ownership_type": "FRANCHISE",
        "trucks": "1+",
        "trucks_shared_with": "",
        "storage": "NO",
        "storage_pricing": "",
        "cx_care": True
    },
    "MARKHAM": {
        "contact": "PARSA",
        "direct_line": "506-461-2035",
        "ownership_type": "FRANCHISE",
        "trucks": "2+",
        "trucks_shared_with": "AURORA, BARRIE",
        "storage": "LOCKER",
        "storage_pricing": "10×20 - $550, 10×15 - $390, 10×12 - $300, 10×10 - $250, 8×10 - $190",
        "cx_care": False
    },
    "MILTON": {
        "contact": "AERISH / AKSHIT",
        "direct_line": "416-570-0828",
        "ownership_type": "FRANCHISE",
        "trucks": "3+",
        "trucks_shared_with": "BRAMPTON, OAKVILLE",
        "storage": "LOCKER",
        "storage_pricing": "10x10x8 - $299, 10x20x8 - $499, No oversized items",
        "cx_care": True
    },
    "MONCTON": {
        "contact": "",
        "direct_line": "",
        "ownership_type": "FRANCHISE",
        "trucks": "1",
        "trucks_shared_with": "",
        "storage": "NO",
        "storage_pricing": "",
        "cx_care": False
    },
    "OAKVILLE": {
        "contact": "AERISH / AKSHIT",
        "direct_line": "416-578-6021",
        "ownership_type": "FRANCHISE",
        "trucks": "3+",
        "trucks_shared_with": "BRAMPTON, MILTON",
        "storage": "LOCKER",
        "storage_pricing": "10x10x8 - 299, 10x20x8 - $499, No oversized items",
        "cx_care": True
    },
    "OSHAWA": {
        "contact": "",
        "direct_line": "",
        "ownership_type": "FRANCHISE",
        "trucks": "",
        "trucks_shared_with": "",
        "storage": "NO",
        "storage_pricing": "",
        "cx_care": True
    },
    "OTTAWA": {
        "contact": "HANZE/JAY",
        "direct_line": "266-808-4305, 613-276-5806",
        "ownership_type": "FRANCHISE",
        "trucks": "4",
        "trucks_shared_with": "",
        "storage": "LOCKER",
        "storage_pricing": "5x5x8 - $99, 10x10x8 - $299",
        "cx_care": False
    },
    "PETERBOROUGH": {
        "contact": "ANDREW",
        "direct_line": "(647) 904-8166",
        "ownership_type": "FRANCHISE",
        "trucks": "2+",
        "trucks_shared_with": "",
        "storage": "NO",
        "storage_pricing": "",
        "cx_care": True
    },
    "REGINA": {
        "contact": "RALPH / ISABELLA",
        "direct_line": "306-206-2448",
        "ownership_type": "FRANCHISE",
        "trucks": "1",
        "trucks_shared_with": "SASKATOON",
        "storage": "NO",
        "storage_pricing": "",
        "cx_care": True
    },
    "RICHMOND": {
        "contact": "RASOUL",
        "direct_line": "604-368-1061",
        "ownership_type": "FRANCHISE",
        "trucks": "1+",
        "trucks_shared_with": "",
        "storage": "NO",
        "storage_pricing": "",
        "cx_care": True
    },
    "SAINT JOHN": {
        "contact": "CAMELLIA",
        "direct_line": "506-688-2168",
        "ownership_type": "FRANCHISE",
        "trucks": "3 RENTALS TILL AUGUST 2ND",
        "trucks_shared_with": "",
        "storage": "NO",
        "storage_pricing": "",
        "cx_care": True
    },
    "SASKATOON": {
        "contact": "RALPH / ISABELLA",
        "direct_line": "306-206-2448",
        "ownership_type": "FRANCHISE",
        "trucks": "2+",
        "trucks_shared_with": "REGINA",
        "storage": "NO",
        "storage_pricing": "",
        "cx_care": True
    },
    "SCARBOROUGH": {
        "contact": "KELVIN / ASWIN",
        "direct_line": "647-979-9910, 647-686-8542",
        "ownership_type": "FRANCHISE",
        "trucks": "1+",
        "trucks_shared_with": "",
        "storage": "NO",
        "storage_pricing": "",
        "cx_care": True
    },
    "ST CATHERINES": {
        "contact": "SIMRANJIT",
        "direct_line": "647-512-2697",
        "ownership_type": "FRANCHISE",
        "trucks": "R+",
        "trucks_shared_with": "BURLINGTON, WINDSOR",
        "storage": "NO",
        "storage_pricing": "",
        "cx_care": True
    },
    "SURREY": {
        "contact": "DANIL",
        "direct_line": "416-817-7767",
        "ownership_type": "FRANCHISE",
        "trucks": "3",
        "trucks_shared_with": "",
        "storage": "NO",
        "storage_pricing": "",
        "cx_care": True
    },
    "VAUGHAN": {
        "contact": "FAHIM",
        "direct_line": "647-773-3640",
        "ownership_type": "FRANCHISE",
        "trucks": "3 R+",
        "trucks_shared_with": "",
        "storage": "NO",
        "storage_pricing": "",
        "cx_care": True
    },
    "VICTORIA": {
        "contact": "SUCCESS",
        "direct_line": "778-995-3069",
        "ownership_type": "FRANCHISE",
        "trucks": "2",
        "trucks_shared_with": "",
        "storage": "NO",
        "storage_pricing": "",
        "cx_care": True
    },
    "WATERLOO": {
        "contact": "SADUR",
        "direct_line": "289-763-9495",
        "ownership_type": "FRANCHISE",
        "trucks": "3+",
        "trucks_shared_with": "",
        "storage": "POD",
        "storage_pricing": "5x5x12 - $175, 10x5x12- $300, No oversized items",
        "cx_care": False
    },
    "WINDSOR": {
        "contact": "SIMRANJIT",
        "direct_line": "647-512-2697",
        "ownership_type": "FRANCHISE",
        "trucks": "R+",
        "trucks_shared_with": "BURLINGTON, ST CATHERINES",
        "storage": "NO",
        "storage_pricing": "",
        "cx_care": True
    },
    "WINNIPEG": {
        "contact": "Wayne",
        "direct_line": "2043914706",
        "ownership_type": "FRANCHISE",
        "trucks": "5+",
        "trucks_shared_with": "",
        "storage": "LOCKER",
        "storage_pricing": "LG LOCKER 12'x12'x15 - $250, MD LOCKER 10'x9'x15 - $200, BIG CRATE 8'x5 1/2'x7 - $150, SM CRATE 5 1/2' x 5 1/2' x 4 - $100",
        "cx_care": True
    },
    "WOODSTOCK": {
        "contact": "N/A",
        "direct_line": "N/A",
        "ownership_type": "FRANCHISE",
        "trucks": "1+",
        "trucks_shared_with": "",
        "storage": "NO",
        "storage_pricing": "",
        "cx_care": True
    },
    
    # CORPORATE LOCATIONS
    "BURNABY": {
        "contact": "SHAHBAZ",
        "direct_line": "",
        "ownership_type": "CORPORATE",
        "trucks": "5",
        "trucks_shared_with": "",
        "storage": "POD",
        "storage_pricing": "7x6x7 - $99, oversized items - $50",
        "cx_care": True
    },
    "DOWNTOWN TORONTO": {
        "contact": "ARSHDEEP",
        "direct_line": "",
        "ownership_type": "CORPORATE",
        "trucks": "6",
        "trucks_shared_with": "",
        "storage": "POD",
        "storage_pricing": "5x10x12 - $350, No oversized items",
        "cx_care": True
    },
    "EDMONTON": {
        "contact": "DANYLO",
        "direct_line": "",
        "ownership_type": "CORPORATE",
        "trucks": "4",
        "trucks_shared_with": "",
        "storage": "LOCKER",
        "storage_pricing": "5x7x5 - $125, oversized items - $50",
        "cx_care": True
    },
    "HAMILTON": {
        "contact": "HAKAM",
        "direct_line": "",
        "ownership_type": "CORPORATE",
        "trucks": "5",
        "trucks_shared_with": "",
        "storage": "POD",
        "storage_pricing": "7x6x7 - $99, oversized items - $50",
        "cx_care": True
    },
    "MISSISSAUGA": {
        "contact": "ARSHDEEP",
        "direct_line": "",
        "ownership_type": "CORPORATE",
        "trucks": "3",
        "trucks_shared_with": "",
        "storage": "POD",
        "storage_pricing": "7x6x7 - $99, oversized items - $50",
        "cx_care": True
    },
    "MONTREAL": {
        "contact": "BHANU",
        "direct_line": "",
        "ownership_type": "CORPORATE",
        "trucks": "4",
        "trucks_shared_with": "",
        "storage": "LOCKER",
        "storage_pricing": "10x10x8 - $225, 10x20x8 - $399",
        "cx_care": True
    },
    "NORTH YORK (TORONTO)": {
        "contact": "ANKIT / ARSHDEEP",
        "direct_line": "",
        "ownership_type": "CORPORATE",
        "trucks": "7",
        "trucks_shared_with": "",
        "storage": "POD",
        "storage_pricing": "7x6x7 - $99, oversized items - $50",
        "cx_care": True
    },
    "VANCOUVER": {
        "contact": "RASOUL",
        "direct_line": "",
        "ownership_type": "CORPORATE",
        "trucks": "11",
        "trucks_shared_with": "",
        "storage": "POD",
        "storage_pricing": "7x6x7 - $99, oversized items - $50",
        "cx_care": True
    }
}

def get_db_connection():
    """Get database connection"""
    return psycopg2.connect(**DB_CONFIG)

def add_location_columns(conn):
    """Add new columns to Location table"""
    cursor = conn.cursor()
    
    try:
        # Add new columns for detailed location information
        columns_to_add = [
            "contact TEXT",
            "direct_line TEXT", 
            "ownership_type TEXT",
            "trucks TEXT",
            "trucks_shared_with TEXT",
            "storage TEXT",
            "storage_pricing TEXT",
            "cx_care BOOLEAN DEFAULT false"
        ]
        
        for column_def in columns_to_add:
            column_name = column_def.split()[0]
            try:
                cursor.execute(f'ALTER TABLE "Location" ADD COLUMN {column_def}')
                print(f"  ✅ Added column: {column_name}")
            except psycopg2.errors.DuplicateColumn:
                print(f"  ⚠️ Column {column_name} already exists")
        
        conn.commit()
        print("✅ Location table schema updated")
        
    except Exception as e:
        print(f"❌ Error updating schema: {e}")
        conn.rollback()
    finally:
        cursor.close()

def remove_duplicate_montreal(conn):
    """Remove duplicate MONTREAL entry"""
    cursor = conn.cursor()
    
    try:
        # Find duplicate MONTREAL entries
        cursor.execute('SELECT id, name, "createdAt" FROM "Location" WHERE name = %s ORDER BY "createdAt"', ('MONTREAL',))
        montreal_entries = cursor.fetchall()
        
        if len(montreal_entries) > 1:
            # Keep the first one, delete the rest
            for entry in montreal_entries[1:]:
                cursor.execute('DELETE FROM "Location" WHERE id = %s', (entry[0],))
                print(f"  🗑️ Removed duplicate MONTREAL entry: {entry[0]}")
            
            conn.commit()
            print("✅ Duplicate MONTREAL entries removed")
        else:
            print("✅ No duplicate MONTREAL entries found")
            
    except Exception as e:
        print(f"❌ Error removing duplicates: {e}")
        conn.rollback()
    finally:
        cursor.close()

def update_location_data(conn, location_name, location_data):
    """Update location with complete data"""
    cursor = conn.cursor()
    
    try:
        # Update location with all the detailed information
        cursor.execute("""
            UPDATE "Location" 
            SET 
                contact = %s,
                direct_line = %s,
                ownership_type = %s,
                trucks = %s,
                trucks_shared_with = %s,
                storage = %s,
                storage_pricing = %s,
                cx_care = %s,
                "updatedAt" = NOW()
            WHERE name = %s AND "clientId" = %s
        """, (
            location_data['contact'],
            location_data['direct_line'],
            location_data['ownership_type'],
            location_data['trucks'],
            location_data['trucks_shared_with'],
            location_data['storage'],
            location_data['storage_pricing'],
            location_data['cx_care'],
            location_name,
            LGM_CLIENT_ID
        ))
        
        if cursor.rowcount > 0:
            print(f"  ✅ {location_name} ({location_data['ownership_type']})")
            print(f"     Contact: {location_data['contact']}")
            print(f"     Trucks: {location_data['trucks']}")
            print(f"     Storage: {location_data['storage']}")
            print(f"     CX Care: {'✅' if location_data['cx_care'] else '❌'}")
            return True
        else:
            print(f"  ❌ {location_name} - Not found in database")
            return False
            
    except Exception as e:
        print(f"  ❌ Error updating {location_name}: {e}")
        return False
    finally:
        cursor.close()

def main():
    """Main function to update LGM locations with complete data"""
    print("🚀 LGM Locations Complete Data Update")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)

    try:
        # Connect to database
        print("🔌 Connecting to database...")
        conn = get_db_connection()
        print("✅ Database connection successful")

        # Step 1: Add new columns to Location table
        print("\n📋 Step 1: Updating Location table schema...")
        add_location_columns(conn)

        # Step 2: Remove duplicate MONTREAL entry
        print("\n🗑️ Step 2: Removing duplicate entries...")
        remove_duplicate_montreal(conn)

        # Step 3: Update all locations with complete data
        print("\n📊 Step 3: Updating location data...")
        print("-" * 50)

        total_locations = len(LGM_LOCATIONS_COMPLETE)
        updated_locations = 0

        for location_name, location_data in LGM_LOCATIONS_COMPLETE.items():
            success = update_location_data(conn, location_name, location_data)
            if success:
                updated_locations += 1

        # Commit all changes
        conn.commit()
        conn.close()

        print("\n" + "=" * 80)
        print("📊 UPDATE SUMMARY")
        print("=" * 80)
        print(f"Total locations in data: {total_locations}")
        print(f"Successfully updated: {updated_locations}")
        print(f"Failed updates: {total_locations - updated_locations}")

        # Print statistics
        corporate_count = sum(1 for data in LGM_LOCATIONS_COMPLETE.values() if data['ownership_type'] == 'CORPORATE')
        franchise_count = sum(1 for data in LGM_LOCATIONS_COMPLETE.values() if data['ownership_type'] == 'FRANCHISE')
        
        storage_types = {}
        cx_care_count = sum(1 for data in LGM_LOCATIONS_COMPLETE.values() if data['cx_care'])
        
        for data in LGM_LOCATIONS_COMPLETE.values():
            storage_type = data['storage']
            storage_types[storage_type] = storage_types.get(storage_type, 0) + 1

        print(f"\n📈 LOCATION BREAKDOWN:")
        print(f"Corporate locations: {corporate_count}")
        print(f"Franchise locations: {franchise_count}")
        print(f"CX Care enabled: {cx_care_count}/{total_locations} ({cx_care_count/total_locations*100:.1f}%)")
        
        print(f"\n📦 STORAGE TYPES:")
        for storage_type, count in storage_types.items():
            print(f"  {storage_type}: {count} locations")

        print(f"\n✅ Complete LGM location data updated successfully!")
        print("📋 All locations now have detailed contact, storage, and pricing information")

    except Exception as e:
        print(f"❌ Error: {e}")
        print("Make sure the database is running and accessible")

if __name__ == "__main__":
    main() 