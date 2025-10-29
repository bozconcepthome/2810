import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import uuid

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")

# 81 Products from Excel
products_data = [
    {
        "product_name": "KIVRIMLIKİTAPLIK Turkuaz Paslanmaz Metal Duvar Rafı Kitaplık Banyo Düzenleyici Kıvrımlı Tel Kitaplık ve Mutfak Rafı",
        "description": "Paslanmaz Metal Duvar Rafı Kitaplık Banyo Düzenleyici Kıvrımlı Tel Kitaplık ve Mutfak Rafı Evinizin girişini yeniden tanımlamaya hazır olun.; Boz Concept Home'un endüstriyel tasarım dresuarı, hem estetiği hem de fonksiyonelliği bir araya getirerek antre ve hollerinize modern bir kimlik kazandırıyor.; Sıcak ahşap dokusunun soğuk metalin gücüyle buluştuğu bu eşsiz konsol, minimalist ve loft tarzı dekorasyonun en gözde parçası olmaya aday.; Ürün, sadece bir vestiyer veya ayakkabılık değil, aynı zamanda evinizin her köşesinde kullanabileceğiniz çok amaçlı bir mobilyadır.; Çapraz metal detayları ile tasarıma dinamizm katarken, sağlam yapısıyla uzun yıllar kullanım vaat eder.; Üst rafı, doğal ahşap görünümlü yüksek kaliteli suntalam malzemeden üretilmiştir ve üzerine anahtarlarınızı, dekoratif objelerinizi, vazonuzu veya postalarınızı koymak için ideal bir yüzey sunar.; Alt kısmında yer alan ızgara tasarımlı metal raf ise ayakkabılarınızı veya kutularınızı düzenli bir şekilde saklamanız için geniş bir alan sağlar, bu ızgara yapısı aynı zamanda ayakkabıların hava almasına da olanak tanır.; 83 cm yüksekliği, 76 cm genişliği ve 30 cm derinliği ile en dar koridorlarda bile yer kaplamadan maksimum verim sunar.; Bu dresuar sadece antreler için değil, aynı zamanda salonunuzda bir konsol, mutfakta bir yardımcı raf veya yatak odanızda şık bir düzenleyici olarak da kullanılabilir.; Sağlam metal profiller, çizilmelere ve paslanmaya karşı dayanıklı statik fırın boya ile kaplanarak ürünün kalitesi ve dayanıklılığı artırılmıştır.; Ürün demonte olarak gönderilmekte olup, paket içerisindeki kurulum şeması ve montaj malzemeleri ile birkaç basit adımda kolayca kurulabilir.; Boz Concept Home kalitesiyle evinize hem düzen hem de endüstriyel bir şıklık katmak için bu çok amaçlı dresuarı tercih edin ve yaşam alanlarınızda fark yaratın.;",
        "price": 1310.0,
        "category": "Mutfak Rafı",
        "image_urls": [
            "https://cdn.dsmcdn.com/ty1770/prod/QC_PREP/20251011/12/44645bf3-3c66-3654-bd78-160691737a62/1_org_zoom.jpg",
            "https://cdn.dsmcdn.com/ty1772/prod/QC_PREP/20251011/12/a346ae47-da5d-3763-a75e-2805c1dd2319/1_org_zoom.jpg",
            "https://cdn.dsmcdn.com/ty1770/prod/QC_PREP/20251011/12/6a6804b5-ae2a-3d14-99d2-9ceb9352e864/1_org_zoom.jpg"
        ],
        "colors": "Turkuaz",
        "barcode": "111020251237",
        "dimensions": None,
        "stock_amount": 100
    },
    {
        "product_name": "UYANYANSEHPA Siyah Yan Sehpa Dekoratif Metal Ayaklı Siyah Ahşap Tablalı Koltuk Yanı Çok Amaçlı Mutfak Düzenleyici",
        "description": "Yan Sehpa Dekoratif Metal Ayaklı Siyah Ahşap Tablalı Koltuk Yanı Çok Amaçlı Mutfak Düzenleyici",
        "price": 910.0,
        "category": "Yan Sehpa",
        "image_urls": [
            "https://cdn.dsmcdn.com/ty1768/prod/QC_PREP/20251010/14/710cb4dd-f24a-3ee9-a1aa-fe7b43edd1b2/1_org_zoom.jpg",
            "https://cdn.dsmcdn.com/ty1768/prod/QC_PREP/20251010/14/644db45c-49f1-32e1-9702-3a773c655fd9/1_org_zoom.jpg",
            "https://cdn.dsmcdn.com/ty1767/prod/QC_PREP/20251010/14/963cddc5-079d-346c-be06-33b942145ce5/1_org_zoom.jpg",
            "https://cdn.dsmcdn.com/ty1768/prod/QC_PREP/20251010/14/cb735f98-3f3a-349f-8ccb-7b59c9721cde/1_org_zoom.jpg",
            "https://cdn.dsmcdn.com/ty1768/prod/QC_PREP/20251010/14/6b366b3a-c70f-3fea-b8ff-7aacfca421b7/1_org_zoom.jpg",
            "https://cdn.dsmcdn.com/ty1767/prod/QC_PREP/20251010/14/845ece5a-47b8-30e3-8c2f-9b603eb1dd33/1_org_zoom.jpg",
            "https://cdn.dsmcdn.com/ty1768/prod/QC_PREP/20251010/14/f007e296-4538-3a3a-8823-d82a653d6fbe/1_org_zoom.jpg"
        ],
        "colors": "Siyah",
        "barcode": "101020251428",
        "dimensions": "50 x 35",
        "stock_amount": 100
    },
    {
        "product_name": "UYANVESTİYER Siyah Dresuar Metal Ayaklı Çam Ahşap Raflı Dekoratif Çok Amaçlı 2 Raflı Düzenleyici Mutfak Düzenleyici",
        "description": "Dresuar Metal Ayaklı Çam Ahşap Raflı Dekoratif Çok Amaçlı 2 Raflı Düzenleyici Mutfak Düzenleyici Evinizin girişini yeniden tanımlamaya hazır olun.; Boz Concept Home'un endüstriyel tasarım dresuarı, hem estetiği hem de fonksiyonelliği bir araya getirerek antre ve hollerinize modern bir kimlik kazandırıyor.; Sıcak ahşap dokusunun soğuk metalin gücüyle buluştuğu bu eşsiz konsol, minimalist ve loft tarzı dekorasyonun en gözde parçası olmaya aday.; Ürün, sadece bir vestiyer veya ayakkabılık değil, aynı zamanda evinizin her köşesinde kullanabileceğiniz çok amaçlı bir mobilyadır.; Çapraz metal detayları ile tasarıma dinamizm katarken, sağlam yapısıyla uzun yıllar kullanım vaat eder.; Üst rafı, doğal ahşap görünümlü yüksek kaliteli suntalam malzemeden üretilmiştir ve üzerine anahtarlarınızı, dekoratif objelerinizi, vazonuzu veya postalarınızı koymak için ideal bir yüzey sunar.; Alt kısmında yer alan ızgara tasarımlı metal raf ise ayakkabılarınızı veya kutularınızı düzenli bir şekilde saklamanız için geniş bir alan sağlar, bu ızgara yapısı aynı zamanda ayakkabıların hava almasına da olanak tanır.; 83 cm yüksekliği, 76 cm genişliği ve 30 cm derinliği ile en dar koridorlarda bile yer kaplamadan maksimum verim sunar.; Bu dresuar sadece antreler için değil, aynı zamanda salonunuzda bir konsol, mutfakta bir yardımcı raf veya yatak odanızda şık bir düzenleyici olarak da kullanılabilir.; Sağlam metal profiller, çizilmelere ve paslanmaya karşı dayanıklı statik fırın boya ile kaplanarak ürünün kalitesi ve dayanıklılığı artırılmıştır.; Ürün demonte olarak gönderilmekte olup, paket içerisindeki kurulum şeması ve montaj malzemeleri ile birkaç basit adımda kolayca kurulabilir.; Boz Concept Home kalitesiyle evinize hem düzen hem de endüstriyel bir şıklık katmak için bu çok amaçlı dresuarı tercih edin ve yaşam alanlarınızda fark yaratın.",
        "price": 1810.0,
        "category": "Dresuar",
        "image_urls": [
            "https://cdn.dsmcdn.com/ty1769/prod/QC_PREP/20251010/14/4c6a23ba-e643-3f6d-ab00-7d86d33834de/1_org_zoom.jpg",
            "https://cdn.dsmcdn.com/ty1767/prod/QC_PREP/20251010/14/af4304f7-0fa0-3413-9f89-f047240156fa/1_org_zoom.jpg",
            "https://cdn.dsmcdn.com/ty1769/prod/QC_PREP/20251010/14/0bad5c83-8cef-3a5b-8a89-4b08bcc426ca/1_org_zoom.jpg",
            "https://cdn.dsmcd.com/ty1767/prod/QC_PREP/20251010/14/bb57fa35-55f4-37fc-bf90-883cc901aa3b/1_org_zoom.jpg",
            "https://cdn.dsmcdn.com/ty1769/prod/QC_PREP/20251010/14/3ba74191-fd3d-3fa3-ad0b-eeabebbff7d9/1_org_zoom.jpg",
            "https://cdn.dsmcdn.com/ty1768/prod/QC_PREP/20251010/14/36fd766a-23fb-3e2a-a1b2-0b13da81999e/1_org_zoom.jpg",
            "https://cdn.dsmcdn.com/ty1768/prod/QC_PREP/20251010/14/d150f18e-d41d-30ad-a516-89e891b6b967/1_org_zoom.jpg",
            "https://cdn.dsmcdn.com/ty1767/prod/QC_PREP/20251010/14/276b53f8-fe71-364b-80df-5cafd98e0a83/1_org_zoom.jpg"
        ],
        "colors": "Siyah",
        "barcode": "101020251410",
        "dimensions": "30 x 80",
        "stock_amount": 100
    }
]

# Due to message length limits, I'll create a function to load all 81 products
async def seed_all_products():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.boz_concept_db
    
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
