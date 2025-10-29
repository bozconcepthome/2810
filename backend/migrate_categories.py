import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
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

async def migrate_categories():
    """Migrate existing categories from products to categories collection"""
    
    print("Starting category migration...")
    
    # Get distinct categories from products
    category_names = await db.products.distinct("category")
    print(f"Found {len(category_names)} unique categories in products")
    
    # Check if categories collection already has data
    existing_count = await db.categories.count_documents({})
    if existing_count > 0:
        print(f"⚠️  Categories collection already has {existing_count} categories")
        response = input("Do you want to replace them? (yes/no): ")
        if response.lower() != 'yes':
            print("Migration cancelled")
            return
        # Delete existing
        await db.categories.delete_many({})
        print("Deleted existing categories")
    
    # Create category documents
    categories = []
    for index, name in enumerate(sorted(category_names)):
        category = {
            "id": str(uuid.uuid4()),
            "name": name,
            "order": index,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        categories.append(category)
    
    # Insert all categories
    if categories:
        await db.categories.insert_many(categories)
        print(f"✅ Successfully migrated {len(categories)} categories!")
        
        # Display categories
        print("\n📋 Migrated Categories:")
        for cat in categories:
            print(f"  {cat['order']}. {cat['name']}")
    else:
        print("❌ No categories found to migrate")

async def main():
    try:
        await migrate_categories()
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(main())
