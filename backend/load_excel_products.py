import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import uuid

MONGO_URL = "mongodb://localhost:27017"

# İlk 10 ürünü test için yüklüyoruz
products_data = [
    {
        "product_name": "Paslanmaz Metal Duvar Rafı Kitaplık Banyo Düzenleyici Kıvrımlı Tel Kitaplık ve Mutfak Rafı",
        "description": "Evinizin girişini yeniden tanımlamaya hazır olun.",
        "price": 1310.0,
        "category": "Mutfak Rafı",
        "image_urls": ["https://cdn.dsmcdn.com/ty1770/prod/QC_PREP/20251011/12/44645bf3-3c66-3654-bd78-160691737a62/1_org_zoom.jpg"],
        "colors": "Turkuaz",
        "barcode": "111020251237",
        "dimensions": "83 cm yükseklik, 76 cm genişlik, 30 cm derinlik",
        "stock_amount": 100
    }
]

async def load_products():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.boz_concept_db
    
    print(f"📦 Loading {len(products_data)} products...")
    
    for product in products_data:
        product_doc = {
            "id": str(uuid.uuid4()),
            "product_name": product["product_name"],
            "description": product.get("description", ""),
            "price": float(product["price"]),
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
    
    print(f"✅ Successfully loaded {len(products_data)} products!")
    client.close()

asyncio.run(load_products())
