#!/usr/bin/env python3
"""
Update products with best_seller flag for top products
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import random
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def update_best_sellers():
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("🔄 Updating best seller products...")
    
    # Get all products
    all_products = await db.products.find({}, {"id": 1, "product_name": 1, "category": 1}).to_list(1000)
    
    if len(all_products) < 4:
        print("⚠️  Not enough products to mark as best sellers")
        client.close()
        return
    
    # Randomly select 4 products to be best sellers
    best_seller_products = random.sample(all_products, 4)
    
    # Clear existing best_seller flags
    await db.products.update_many({}, {"$set": {"best_seller": False, "sales_count": 0}})
    print("✅ Cleared existing best seller flags")
    
    # Update selected products as best sellers with random sales count
    for idx, product in enumerate(best_seller_products):
        sales_count = random.randint(50, 200)
        await db.products.update_one(
            {"id": product["id"]},
            {"$set": {
                "best_seller": True,
                "sales_count": sales_count,
                "best_seller_rank": idx + 1
            }}
        )
        print(f"   ✅ {product['product_name'][:50]}... - {sales_count} satış")
    
    print(f"\n🎉 {len(best_seller_products)} ürün en çok satan olarak işaretlendi!")
    
    # Close connection
    client.close()

if __name__ == "__main__":
    asyncio.run(update_best_sellers())
