import asyncio
import json
from motor.motor_asyncio import AsyncIOMotorClient
import os
import uuid

async def load_products():
    """Load products from products_data.json with clean names"""
    
    # MongoDB bağlantısı
    mongo_url = os.environ.get('MONGO_URL')
    client = AsyncIOMotorClient(mongo_url)
    db = client["boz_concept"]
    
    # JSON dosyasını oku
    with open('/app/backend/products_data.json', 'r', encoding='utf-8') as f:
        products_data = json.load(f)
    
    print(f"📦 {len(products_data)} ürün bulundu")
    
    # Mevcut ürünleri temizle
    deleted_count = await db.products.delete_many({})
    print(f"🗑️  {deleted_count.deleted_count} eski ürün silindi")
    
    # Her ürünü işle ve yükle
    inserted_count = 0
    for product_data in products_data:
        # Temiz ürün ismi oluştur - description'dan ilk anlamlı kısmı al
        description = product_data.get('description', '')
        
        # Description'daki ilk 3-5 kelimeyi al (daha temiz isim için)
        words = description.split()
        if len(words) > 0:
            # İlk 5 kelimeyi veya Mutfak/Banyo/Düzenleyici gibi kelimelere kadar al
            clean_name_words = []
            skip_words = {'mutfak', 'banyo', 'düzenleyici', 'organize', 'organizer', 'raf', 'rafı'}
            
            for word in words:
                if word.lower() not in skip_words and len(clean_name_words) < 8:
                    clean_name_words.append(word)
                elif len(clean_name_words) >= 3:  # En az 3 kelime aldıktan sonra dur
                    break
            
            clean_name = ' '.join(clean_name_words) if clean_name_words else description.split()[0:5]
            if isinstance(clean_name, list):
                clean_name = ' '.join(clean_name)
        else:
            clean_name = product_data.get('product_name', 'Ürün')
        
        # Ürün belgesi oluştur
        product_doc = {
            'id': str(uuid.uuid4()),
            'product_name': clean_name.strip(),
            'description': product_data.get('description', ''),
            'price': float(product_data.get('price', 0)),
            'discounted_price': None,
            'category': product_data.get('category', 'Diğer'),
            'image_urls': product_data.get('image_urls', []),
            'colors': product_data.get('colors', ''),
            'barcode': product_data.get('barcode', ''),
            'dimensions': product_data.get('dimensions'),
            'stock_amount': int(product_data.get('stock_amount', 0)),
            'best_seller': False,
            'sales_count': 0,
            'order': 0
        }
        
        await db.products.insert_one(product_doc)
        inserted_count += 1
        
        if inserted_count <= 5:  # İlk 5 ürünü göster
            print(f"\n✅ Ürün {inserted_count}:")
            print(f"   Eski isim: {product_data.get('product_name')}")
            print(f"   Yeni isim: {clean_name.strip()}")
    
    print(f"\n✅ Toplam {inserted_count} ürün yüklendi!")
    
    # Kontrol
    total = await db.products.count_documents({})
    print(f"📊 Veritabanında toplam {total} ürün var")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(load_products())
