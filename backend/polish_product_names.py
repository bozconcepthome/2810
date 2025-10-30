import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

async def polish_names():
    """Polish product names - remove trailing commas, fix short names"""
    
    mongo_url = os.environ.get('MONGO_URL')
    client = AsyncIOMotorClient(mongo_url)
    db = client["boz_concept"]
    
    # Tüm ürünleri al
    products = await db.products.find().to_list(length=1000)
    
    print(f"📦 {len(products)} ürün işleniyor...\n")
    
    updated_count = 0
    
    for product in products:
        old_name = product.get('product_name', '')
        new_name = old_name
        
        # Sondaki virgül, nokta, boşlukları temizle
        new_name = new_name.rstrip(' ,.')
        
        # Çok kısa isimleri description'dan tamamla
        if len(new_name) < 25:
            description = product.get('description', '')
            if description:
                words = description.split()
                # İlk 5-6 kelimeyi al
                stop_words = ['mutfak', 'banyo', 'düzenleyici', 'organizer']
                name_words = []
                
                for word in words:
                    if len(name_words) >= 6:
                        break
                    if word.lower() not in stop_words or len(name_words) < 3:
                        name_words.append(word)
                
                new_name = ' '.join(name_words).rstrip(' ,.')
        
        # Eğer değişiklik varsa güncelle
        if new_name != old_name:
            await db.products.update_one(
                {'id': product['id']},
                {'$set': {'product_name': new_name}}
            )
            updated_count += 1
            
            if updated_count <= 10:
                print(f"✅ Düzeltme {updated_count}:")
                print(f"   Eski: {old_name}")
                print(f"   Yeni: {new_name}\n")
    
    print(f"\n🎉 Toplam {updated_count} ürün ismi düzeltildi!")
    
    # Final kontrol
    print("\n📋 Güncel durum - İlk 15 ürün:")
    updated_products = await db.products.find().limit(15).to_list(length=15)
    for i, p in enumerate(updated_products, 1):
        name = p.get('product_name', '')
        print(f"{i:2}. ({len(name):2} kar) {name}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(polish_names())
