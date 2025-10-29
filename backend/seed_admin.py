import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from dotenv import load_dotenv
import os
from pathlib import Path
import uuid
from datetime import datetime, timezone

# Load environment
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_admin():
    """Create default admin user"""
    
    # Admin credentials
    admin_email = "admin@bozconcept.com"
    admin_password = "admin123"
    admin_name = "Admin"
    
    # Check if admin already exists
    existing_admin = await db.admins.find_one({"email": admin_email})
    if existing_admin:
        print(f"✅ Admin user already exists: {admin_email}")
        return
    
    # Create admin
    admin = {
        "id": str(uuid.uuid4()),
        "email": admin_email,
        "full_name": admin_name,
        "hashed_password": pwd_context.hash(admin_password),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.admins.insert_one(admin)
    
    print("=" * 60)
    print("✅ Admin user created successfully!")
    print("=" * 60)
    print(f"Email: {admin_email}")
    print(f"Password: {admin_password}")
    print("=" * 60)
    print("⚠️  IMPORTANT: Change the admin password after first login!")
    print("=" * 60)

async def main():
    try:
        await seed_admin()
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(main())
