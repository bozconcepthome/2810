import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

products = [
    {"id": "1", "product_name": "Paslanmaz Metal Duvar Rafı Kitaplık Banyo Düzenleyici Kıvrımlı Tel Kitaplık ve Mutfak Rafı", "category": "Mutfak Rafı", "price": 1310.0, "discounted_price": 1310.0, "description": "Evinizin girişini yeniden tanımlamaya hazır olun. Boz Concept Home'un endüstriyel tasarım dresuarı, hem estetiği hem de fonksiyonelliği bir araya getirerek antre ve hollerinize modern bir kimlik kazandırıyor.", "dimensions": "83 cm (Yükseklik) x 76 cm (Genişlik) x 30 cm (Derinlik)", "materials": "Paslanmaz Metal, Suntalam", "colors": "Turkuaz", "stock_status": "Stokta", "stock_amount": 18999, "image_urls": ["https://cdn.dsmcdn.com/ty1770/prod/QC_PREP/20251011/12/44645bf3-3c66-3654-bd78-160691737a62/1_org_zoom.jpg", "https://cdn.dsmcdn.com/ty1772/prod/QC_PREP/20251011/12/a346ae47-da5d-3763-a75e-2805c1dd2319/1_org_zoom.jpg"]},
    {"id": "2", "product_name": "Yan Sehpa Dekoratif Metal Ayaklı Siyah Ahşap Tablalı Koltuk Yanı Çok Amaçlı Mutfak Düzenleyici", "category": "Yan Sehpa", "price": 910.0, "discounted_price": 910.0, "description": "Modern ve minimalist tasarımın en zarif halini evinize taşıyan yan sehpa.", "dimensions": "50 x 35", "materials": "Ahşap Tablalı, Metal Ayaklı", "colors": "Siyah", "stock_status": "Stokta", "stock_amount": 19997, "image_urls": ["https://cdn.dsmcdn.com/ty1768/prod/QC_PREP/20251010/14/710cb4dd-f24a-3ee9-a1aa-fe7b43edd1b2/1_org_zoom.jpg"]},
    {"id": "3", "product_name": "Dresuar Metal Ayaklı Çam Ahşap Raflı Dekoratif Çok Amaçlı 2 Raflı Düzenleyici Mutfak Düzenleyici", "category": "Dresuar", "price": 1810.0, "discounted_price": 1810.0, "description": "Sıcak ahşap dokusunun soğuk metalin gücüyle buluştuğu bu eşsiz konsol.", "dimensions": "30 x 80", "materials": "Çam Ahşap Raflı, Metal Ayaklı", "colors": "Siyah", "stock_status": "Stokta", "stock_amount": 19999, "image_urls": ["https://cdn.dsmcdn.com/ty1769/prod/QC_PREP/20251010/14/4c6a23ba-e643-3f6d-ab00-7d86d33834de/1_org_zoom.jpg"]},
    {"id": "4", "product_name": "Viyana Tel Metal Tasarımlı Modern Paslanmaz Yan Sehpa, Dekoratif Metal Sehpa", "category": "Yan Sehpa", "price": 1942.0, "discounted_price": 1942.0, "description": "Modern ve minimalist tasarımın en zarif halini evinize taşıyan Tel Metal Tasarımlı Modern Paslanmaz Yan Sehpa.", "dimensions": "42 x 36", "materials": "Tel Metal, Paslanmaz Çelik", "colors": "Boz Yeşil", "stock_status": "Stokta", "image_urls": ["https://cdn.dsmcdn.com/ty1754/prod/QC_ENRICHMENT/20250916/20/612a4463-82df-3e22-a3fb-32e7abd8ef1d/1_org_zoom.jpg"]},
    {"id": "5", "product_name": "Milano Tel Metal Tasarımlı Modern Paslanmaz Yan Sehpa, Dekoratif Metal Sehpa", "category": "Yan Sehpa", "price": 1942.0, "discounted_price": 1942.0, "description": "Metalin modern dokunuşunu paslanmaz çeliğin dayanıklılığı ile birleştiriyor.", "dimensions": "42 x 36", "materials": "Tel Metal, Paslanmaz Çelik", "colors": "Boz Kremit", "stock_status": "Stokta", "image_urls": ["https://cdn.dsmcdn.com/ty1753/prod/QC_ENRICHMENT/20250916/20/1ee5a58c-05f3-3e0b-af85-210874a967a5/1_org_zoom.jpg"]},
    {"id": "6", "product_name": "Floransa Tel Metal Tasarımlı Modern Paslanmaz Yan Sehpa, Dekoratif Metal Sehpa", "category": "Yan Sehpa", "price": 1942.0, "discounted_price": 1942.0, "description": "Siyah tel metal tasarımının yanı sıra mor, yeşil, kiremit renk seçenekleri.", "dimensions": "42 x 36", "materials": "Tel Metal, Paslanmaz Çelik", "colors": "Boz Mor", "stock_status": "Stokta", "image_urls": ["https://cdn.dsmcdn.com/ty1754/prod/QC_ENRICHMENT/20250916/20/dd8d3407-7a97-3f95-9e10-d63f51388e23/1_org_zoom.jpg"]},
    {"id": "7", "product_name": "Metal Raflı Modern Gitar Kitaplık Salon Düzenleyici Çalışma Odası Dekoratif Mutfak Raf Ünite", "category": "Kitaplık", "price": 5999.0, "discounted_price": 5999.0, "description": "Benzersiz gitar şeklinde modern kitaplık.", "materials": "Metal", "colors": "Siyah", "stock_status": "Stokta", "stock_amount": 10, "image_urls": ["https://cdn.dsmcdn.com/ty1754/prod/QC_PREP/20250915/00/0ac6cccf-a037-3cf2-a73d-1f1870506df7/1_org_zoom.jpg"]},
    {"id": "8", "product_name": "Banyo Düzenleyici Tel Kirli Sepet Ahşap Kapaklı Metal Gövde Kumaşlı Çamaşır Sepeti", "category": "Banyo Düzenleyici", "price": 1990.0, "discounted_price": 1990.0, "description": "Dayanıklı metal gövde, doğal ahşap kapak ile şık çamaşır sepeti.", "materials": "Metal Gövde, Ahşap Kapak, Kumaş", "colors": "Siyah", "stock_status": "Stokta", "stock_amount": 1995, "image_urls": ["https://cdn.dsmcdn.com/ty1748/prod/QC_PREP/20250910/02/d01665b5-bf8a-38ad-9e9f-8275a1a5fc40/1_org_zoom.jpg"]},
    {"id": "9", "product_name": "İkili Minderli Kedi Yuvalığı Metal Zigon Sehpa Seti", "category": "Zigon Sehpa", "price": 3199.0, "discounted_price": 3199.0, "description": "Sevimli kedi yuvalığı fonksiyonlu zigon sehpa seti.", "dimensions": "41 x 55", "materials": "Metal, Minderli", "colors": "Siyah", "stock_status": "Stokta", "stock_amount": 19998, "image_urls": ["https://cdn.dsmcdn.com/ty1740/prod/QC_PREP/20250902/01/84954fcc-eddf-373b-8d31-d58c871c8e08/1_org_zoom.jpg"]},
    {"id": "10", "product_name": "Paris Gümüş Tel Metal Tasarımlı Modern Paslanmaz Yan Sehpa", "category": "Yan Sehpa", "price": 2118.0, "discounted_price": 2118.0, "description": "Zarif gümüş tel metal tasarım.", "dimensions": "37 x 42", "materials": "Tel Metal, Paslanmaz Çelik", "colors": "Gümüş", "stock_status": "Stokta", "stock_amount": 18608, "image_urls": ["https://cdn.dsmcdn.com/ty1752/prod/QC_ENRICHMENT/20250914/16/f487b934-6a3f-3085-9d13-95e6ab09bd70/1_org_zoom.jpg"]},
    {"id": "11", "product_name": "Berlin Siyah Tel Metal Tasarımlı Modern Paslanmaz Yan Sehpa", "category": "Yan Sehpa", "price": 1690.0, "discounted_price": 1690.0, "description": "Siyah tel metal modern tasarım.", "dimensions": "70 x 40", "materials": "Tel Metal, Paslanmaz Çelik", "colors": "Siyah", "stock_status": "Stokta", "stock_amount": 1882, "image_urls": ["https://cdn.dsmcdn.com/ty1738/prod/QC_ENRICHMENT/20250827/12/ca5ce1f3-f543-377a-ae8a-18afafbabd39/1_org_zoom.jpg"]},
    {"id": "12", "product_name": "5 Katlı Paslanmaz Katlanılan Tekerlekli Banyo Düzenleyici Mutfak Rafı", "category": "Banyo Düzenleyici", "price": 2990.0, "discounted_price": 2990.0, "description": "Pratik tekerlekli 5 katlı düzenleyici.", "materials": "Paslanmaz", "colors": "Siyah", "stock_status": "Stokta", "stock_amount": 18993, "image_urls": ["https://cdn.dsmcdn.com/ty1724/prod/QC_ENRICHMENT/20250810/18/4857a57a-7666-3bc5-9a43-90af9cf5203d/1_org_zoom.jpg"]}
]

async def seed_database():
    # Clear existing products
    await db.products.delete_many({})
    
    # Insert products
    if products:
        await db.products.insert_many(products)
    
    print(f"Seeded {len(products)} products successfully!")
    
    # Create indexes
    await db.products.create_index("category")
    await db.products.create_index("product_name")
    await db.users.create_index("email", unique=True)
    
    print("Database indexes created!")

if __name__ == "__main__":
    asyncio.run(seed_database())
    print("Database seeding complete!")