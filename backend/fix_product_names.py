import asyncio
import json
from motor.motor_asyncio import AsyncIOMotorClient
import os

async def fix_product_names():
    """Fix product names by extracting clean names from descriptions"""
    
    # MongoDB bağlantısı
    mongo_url = os.environ.get('MONGO_URL')
    client = AsyncIOMotorClient(mongo_url)
    db = client["boz_concept"]
    
    # JSON dosyasını oku
    with open('/app/backend/products_data.json', 'r', encoding='utf-8') as f:
        products_data = json.load(f)
    
    print(f"📦 {len(products_data)} ürün verisi bulundu")
    
    # Tüm ürünleri al
    all_products = await db.products.find().to_list(length=1000)
    print(f"💾 Veritabanında {len(all_products)} ürün var")
    
    updated_count = 0
    
    # Her ürün için temiz isim çıkar
    for i, product_data in enumerate(products_data, 1):
        description = product_data.get('description', '')
        barcode = product_data.get('barcode', '')
        
        if not description:
            continue
            
        # Description'dan daha akıllı isim çıkarma
        # İlk 3-6 kelimeyi al, ancak belirli kelimelerde dur
        words = description.split()
        
        # Durmamız gereken kelimeler
        stop_words = [
            'mutfak', 'banyo', 'düzenleyici', 'organizer', 
            'organize', 'dekoratif', 'çok', 'amaçlı',
            'kullanım', 'için', 've', 'ile'
        ]
        
        clean_name_words = []
        for word in words:
            word_lower = word.lower()
            
            # Stop word'e rastladıysak dur
            if word_lower in stop_words:
                if len(clean_name_words) >= 3:  # En az 3 kelime varsa dur
                    break
            else:
                clean_name_words.append(word)
                
            # Maksimum 8 kelime
            if len(clean_name_words) >= 8:
                break
        
        clean_name = ' '.join(clean_name_words).strip()
        
        # Eğer çok kısa kaldıysa, ilk 5 kelimeyi al
        if len(clean_name_words) < 2:
            clean_name = ' '.join(words[:5]).strip()
        
        # Veritabanında bu barkoda sahip ürünü bul ve güncelle
        if barcode:
            result = await db.products.update_one(
                {'barcode': barcode},
                {'$set': {'product_name': clean_name}}
            )
            
            if result.modified_count > 0:
                updated_count += 1
                if updated_count <= 10:  # İlk 10 güncellemeyi göster
                    print(f"\n✅ Güncellendi ({updated_count}):")
                    print(f"   Barkod: {barcode}")
                    print(f"   Yeni isim: {clean_name}")
    
    print(f"\n\n🎉 Toplam {updated_count} ürün ismi güncellendi!")
    
    # Kontrol için birkaç ürün göster
    print("\n📋 Güncel ürün örnekleri:")
    sample_products = await db.products.find().limit(5).to_list(length=5)
    for i, p in enumerate(sample_products, 1):
        print(f"\n{i}. {p.get('product_name')}")
        print(f"   Açıklama: {p.get('description', '')[:60]}...")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(fix_product_names())
