import asyncio
import os
import json
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import uuid

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")

async def seed_all_products():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.test_database  # Use correct database name from .env
    
    # Load products from JSON
    json_path = os.path.join(os.path.dirname(__file__), 'products_data.json')
    with open(json_path, 'r', encoding='utf-8') as f:
        products_data = json.load(f)
    
    print("🗑️  Clearing existing products...")
    await db.products.delete_many({})
    
    print(f"📦 Loading {len(products_data)} products from Excel...")
    
    for product in products_data:
        product_doc = {
            "id": str(uuid.uuid4()),
            "product_name": product["product_name"],
            "description": product.get("description", ""),
            "price": product["price"],
            "category": product["category"],
            "image_urls": product.get("image_urls", []),
            "colors": product.get("colors"),
            "barcode": product.get("barcode"),
            "dimensions": product.get("dimensions"),
            "stock_status": "Stokta",
            "stock_amount": product.get("stock_amount", 100),
            "discounted_price": None,
            "boz_plus_price": None,
            "materials": None,
            "category_order": None,
            "best_seller": False,
            "sales_count": 0,
            "best_seller_rank": None
        }
        
        await db.products.insert_one(product_doc)
    
    # Get unique categories and seed them
    categories = list(set([p["category"] for p in products_data]))
    print(f"📂 Found {len(categories)} unique categories")
    
    await db.categories.delete_many({})
    
    for idx, category_name in enumerate(sorted(categories)):
        category_doc = {
            "id": str(uuid.uuid4()),
            "name": category_name,
            "order": idx,
            "is_active": True
        }
        await db.categories.insert_one(category_doc)
    
    print(f"✅ Successfully loaded {len(products_data)} products and {len(categories)} categories!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_all_products())
