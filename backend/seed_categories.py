#!/usr/bin/env python3
"""
Seed categories collection from existing product categories
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def seed_categories():
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("🔄 Extracting unique categories from products...")
    
    # Get all unique categories from products
    pipeline = [
        {"$group": {"_id": "$category"}},
        {"$sort": {"_id": 1}}
    ]
    
    unique_categories = await db.products.aggregate(pipeline).to_list(100)
    category_names = [cat['_id'] for cat in unique_categories if cat['_id']]
    
    print(f"📦 Found {len(category_names)} unique categories")
    
    # Clear existing categories
    await db.categories.delete_many({})
    print("🗑️  Cleared existing categories")
    
    # Create category documents
    import uuid
    categories_to_insert = []
    for idx, cat_name in enumerate(category_names):
        category_doc = {
            "id": str(uuid.uuid4()),
            "name": cat_name,
            "slug": cat_name.lower().replace(" ", "-").replace("ı", "i").replace("ğ", "g").replace("ü", "u").replace("ş", "s").replace("ö", "o").replace("ç", "c"),
            "description": f"{cat_name} kategorisindeki ürünler",
            "order": idx + 1,
            "is_active": True,
            "product_count": await db.products.count_documents({"category": cat_name})
        }
        categories_to_insert.append(category_doc)
    
    # Insert categories
    if categories_to_insert:
        result = await db.categories.insert_many(categories_to_insert)
        print(f"✅ Successfully seeded {len(result.inserted_ids)} categories!")
        
        # Print categories
        print("\n📋 Categories created:")
        for cat in categories_to_insert:
            print(f"   - {cat['name']} ({cat['product_count']} ürün)")
    else:
        print("⚠️  No categories found to seed")
    
    # Close connection
    client.close()
    print("\n🎉 Category seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_categories())
