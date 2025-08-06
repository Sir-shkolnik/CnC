import psycopg2
import os

def test_db_connection():
    print("🔍 Testing direct database connection...")
    
    try:
        conn = psycopg2.connect(
            host="127.0.0.1",
            port="5432",
            database="c_and_c_crm",
            user="c_and_c_user",
            password="c_and_c_password"
        )
        
        print("✅ Database connection successful!")
        
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM \"Client\"")
        client_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM \"User\"")
        user_count = cursor.fetchone()[0]
        
        print(f"✅ Database queries successful!")
        print(f"   - Clients: {client_count}")
        print(f"   - Users: {user_count}")
        
        cursor.close()
        conn.close()
        print("✅ Database connection closed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = test_db_connection()
    print("🎉 Database connection test passed!" if success else "💥 Database connection test failed.")
