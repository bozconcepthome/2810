import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb://localhost:27017"

# Excel'den çekilen TÜM tam ürün isimleri (57 ürün + varyasyonlar = 76)
full_names = {
    "KIVRIMLIKİTAPLIK Turkuaz": "KIVRIMLIKİTAPLIK Turkuaz boz concept home Mutfak Rafı KIVRIMLIRAFTURKUAZ Paslanmaz Metal Duvar Rafı Kitaplık Banyo Düzenleyici Kıvrımlı Tel Kitaplık ve Mutfak Rafı",
    "UYANYANSEHPA Siyah": "UYANYANSEHPA Siyah 50 x 35 boz concept home Yan Sehpa UYANYANSEHPASİYAH Yan Sehpa Dekoratif Metal Ayaklı Siyah Ahşap Tablalı Koltuk Yanı Çok Amaçlı Mutfak Düzenleyici",
    "UYANVESTİYER Siyah": "UYANVESTİYER Siyah 30 x 80 boz concept home Dresuar UYANVESTİYER Dresuar Metal Ayaklı Çam Ahşap Raflı Dekoratif Çok Amaçlı 2 Raflı Düzenleyici Mutfak Düzenleyici",
    "KIVRIMLIKİTAPLIK Gümüş": "KIVRIMLIKİTAPLIK Gümüş boz concept home Mutfak Rafı kıvrımlırafgümüş Paslanmaz Metal Duvar Rafı Kitaplık Banyo Düzenleyici Kıvrımlı Tel Kitaplık ve Mutfak Rafı",
    "KIVRIMLIKİTAPLIK Siyah": "KIVRIMLIKİTAPLIK Siyah boz concept home Mutfak Rafı kıvrımlıraf Paslanmaz Metal Duvar Rafı Kitaplık Banyo Düzenleyici Kıvrımlı Tel Kitaplık ve Mutfak Rafı",
    "YANSEHPA00COLOR VİYANA": "YANSEHPA00COLOR Boz Yeşil 42 x 36 boz concept home Yan Sehpa YEŞİLYANSEHPA VİYANA Tel Metal Tasarımlı Modern Paslanmaz Yan Sehpa, Dekoratif Metal Sehpa",
    "YANSEHPA00COLOR Milano": "YANSEHPA00COLOR Boz Kremit 42 x 36 boz concept home Yan Sehpa KREMİTYANSEHPA Milano Tel Metal Tasarımlı Modern Paslanmaz Yan Sehpa, Dekoratif Metal Sehpa",
    "YANSEHPA00COLOR FLORANSA": "YANSEHPA00COLOR Boz Mor 42 x 36 boz concept home Yan Sehpa MORYANSEHPA FLORANSA Tel Metal Tasarımlı Modern Paslanmaz Yan Sehpa, Dekoratif Metal Sehpa",
    "YANSEHPA00COLOR TOKYO": "YANSEHPA00COLOR Boz Lacivert 42 x 36 boz concept home Yan Sehpa LACİVERTYANSEHPA TOKYO Tel Metal Tasarımlı Modern Paslanmaz Yan Sehpa, Dekoratif Metal Sehpa",
    "YANSEHPA00COLOR SANTORİNİ": "YANSEHPA00COLOR Boz Turkuaz 42 x 36 boz concept home Yan Sehpa TURKUAZYANSEHPA SANTORİNİ Tel Metal Tasarımlı Modern Paslanmaz Yan Sehpa, Dekoratif Metal Sehpa",
    "METALRAFLIGİTAR": "METALRAFLIGİTAR Siyah boz concept home Kitaplık GİTARMETALRAFLI Metal Raflı Modern Gitar Kitaplık Salon Düzenleyici Çalışma Odası Dekoratif Mutfak Raf Ünite",
    "TELKİRLİSEPET95LT": "TELKİRLİSEPET95LT Siyah boz concept home Banyo Düzenleyici TELKİRLİSEPET95LT Banyo Düzenleyici Tel Kirli Sepet Ahşap Kapaklı Metal Gövde Kumaşlı Çamaşır Sepeti Banyo Aksesuar",
    "KEDİYUVALIK": "KEDİYUVALIK Siyah 41 x 55 boz concept home Zigon KEDİYUVALIKSEHPA İkili Minderli Kedi Yuvalığı Metal Zigon Sehpa Seti",
    "KADEHLİK": "KADEHLİK Siyah boz concept home Mutfak Rafı KADEHLİK+ Paslanmaz Metal Bardak ve Kadeh Askılığı – Delmeden Montajlı, Mutfak ve Bar Düzenleyici",
    "GÜMÜŞYANSEHPA PARİS": "GÜMÜŞYANSEHPA Gümüş 37 x 42 boz concept home Yan Sehpa GÜMÜŞYANSEHPA PARİS Gümüş Tel Metal Tasarımlı Modern Paslanmaz Yan Sehpa, Dekoratif Metal Sehpa",
    "TELYANSEHPA BERLİN": "TELYANSEHPA Siyah 70 x 40 boz concept home Yan Sehpa TELYANSEHPA BERLİN Siyah Tel Metal Tasarımlı Modern Paslanmaz Yan Sehpa, Dekoratif Metal Sehpa",
    "5KATLIKATLANIRBANYO": "5KATLIKATLANIRBANYO Siyah boz concept home Banyo Düzenleyici 5KATLIKATLANIRBANYO 5 Katlı Paslanmaz Katlanılan Tekerlekli Banyo Düzenleyici Mutfak Rafı Düzenleyici Organizer Sepet",
    "3KATLIORGANİZERSEPET": "3KATLIORGANİZERSEPET Siyah boz concept home Banyo Düzenleyici 3KATLIORGANİZERSEPET Siyah 3 Katlı Metal Tezga üst Banyo Düzenleyici kozmatik sepeti havluluk",
    "KİLLERRAY": "KİLLERRAY Krom 35 x 26 boz concept home Dolap İçi Düzenleyici killerray Teleskopik Raylı Dolap İçi Düzenleyici Sepet – İki Katlı Krom Metal Mutfak ve Banyo Organizeri",
    "KAHVEFINCANLIK2021": "KAHVEFINCANLIK2021 Siyah boz concept home Mutfak Rafı fıncanlık20202 Siyah 6lı Kahve Fincan Askılığı Kupa Askısı Mutfak Düzenleyicisi",
    "2KATLITEZGAHÜSTÜÜÇGEN": "2KATLITEZGAHÜSTÜÜÇGEN Siyah boz concept home Banyo Düzenleyici 2KATLITEZGAHÜSTÜÜÇGENsiyah 2 Katlı Siyah Otel TipiPaslanmaz Banyo Düzenleyici Mutfak Çok Kullanımlı Organizer Mutfak Rafı",
    "FİLAMENBAHARAT": "FİLAMENBAHARAT Siyah boz concept home Mutfak Rafı FİLAMENBAHARATsyh Duvara Asılabilen Siyah Metal Baharatlık Raf Mutfak Organizer Düzenleyici Sepet",
    "RFM-21B2C": "RFM-21B2C Siyah boz concept home Mutfak Rafı RFM-siyah Siyah 2 Katlı Tezgah Üstü Raf Ahşap Tabanlı Metal Mutfak Düzenleyici ve Saklama Mutfak Rafı",
    "2KATLITEZGAHÜSTÜRAFÇAM": "2KATLITEZGAHÜSTÜAFÇAM boz concept home Baharatlık 2KATLISİYAHÜÇGENRAF 2 Katlı Tezgah Ahşap Tabanlı Metal Mutfak Rafı Düzenleyici Saklama Depolama",
    "ÖRGÜLÜSEPET": "ÖRGÜLÜSEPET boz concept home Baharatlık 6KANCALIASIRSEPET Yapışkanlı Kancalı Asılabilir Baharatlık Metal Fincanlık Mutfak Rafı Saklama Düzenleme",
    "ASIR6KANCALI": "ASIR6KANCALI Siyah boz concept home Banyo Düzenleyici 6KANCALIASIRSİYAH Metal Kancalı Banyo Sepeti Banyo Düzenleyici Organizer Duşluk Şampuanlık Banyo Köşesi",
    "KANGURUHAVLUPAN": "KANGURUHAVLUPAN Siyah boz concept home Banyo Düzenleyici KANGURUSİYAH Havlupan Düzenleyici Banyo Düzenleyici Havluluk Kurutma Sepeti Tuvalet Kağıdı Makyaj Kozmatik",
    "GENİŞLETEBİLİRRAF": "GENİŞLETEBİLİRRAF Siyah 34 x 25 boz concept home Dolap İçi Düzenleyici GENİŞLETEBİLİRRAFSİYAH Genişletilebilir Raf Ayarlanabilir Dolap İçi Düzenleyici Mutfak Düzenleyici Banyo Düzenleyici",
    "2LİHAVLUPANJUMBO": "2LİHAVLUPANJUMBO Siyah boz concept home Banyo Düzenleyici 2LİHAVLUPANJUMBOSİYAH 2 ADET SİYAH KANCALI HAVLU KURUTMALI HAVLUPAN BANYO DÜZENLEYİCİ KOZMETİK DÜZENLEYİCİ SEPET",
    "2Lİ2024BANYO": "2Lİ2024BANYO siyah boz concept home Banyo Düzenleyici SİYAH2024BANYODÜZENLEYİCİ PASLANMAZ Yapışkanlı 2 li set Banyo Rafı Duş Şampuanlık Duvar Düzenleyici Organizer Banyo Seti",
    "KALORİFERDÜZENLEYİCİ Beyaz": "KALORİFERDÜZENLEYİCİ Beyaz boz concept home Mutfak Rafı KALORİFERBEYAZ Paslanmaz Mutfak Rafı Kalorifer Düzenleyici Havluluk Düzenleyici Raf",
    "KALORİFERDÜZENLEYİCİ Siyah": "KALORİFERDÜZENLEYİCİ Siyah boz concept home Mutfak Rafı KALORİFERSİYAH Paslanmaz Mutfak Rafı Kalorifer Düzenleyici Havluluk Düzenleyici Raf",
    "TYBKALORİFERDÜZENLEYİCİ170414352": "TYBKALORİFERDÜZENLEYİCİ170017662669017 Gümüş boz concept home Mutfak Rafı KALORİFERGÜMÜŞ Paslanmaz Mutfak Rafı Kalorifer Düzenleyici Havluluk Düzenleyici Raf",
    "ÇEMBERLİHAVLUPAN Gümüş": "ÇEMBERLİHAVLUPAN Gümüş boz concept home Banyo Düzenleyici HAZNELİGÜMÜŞHAVLUPAN Hazneli Banyo Aksesuar Makyaj Kozmetik Sabunluk Havlupan Banyo Düzenleyici Banyo Rafı",
    "ÇEMBERLİHAVLUPAN Beyaz": "ÇEMBERLİHAVLUPAN Beyaz boz concept home Banyo Düzenleyici HAZNELİBEYAZHAVLUPAN Hazneli Banyo Aksesuar Makyaj Kozmetik Sabunluk Havlupan Banyo Düzenleyici Banyo Rafı",
    "ÇEMBERLİHAVLUPAN Siyah": "ÇEMBERLİHAVLUPAN Siyah boz concept home Banyo Düzenleyici HAZNELİSİYAHHAVLUPAN Hazneli Banyo Aksesuar Makyaj Kozmetik Sabunluk Havlupan Banyo Düzenleyici Banyo Rafı",
    "BOZHAVLUPAN Beyaz": "BOZHAVLUPAN Beyaz boz concept home Banyo Düzenleyici BEYAZHAVLUPAN Kancalı Banyo Havlupan Askısı Fönlük Havluluk Banyo Aksesuarı Düzenleyici Banyo Rafı",
    "BOZHAVLUPAN Gümüş": "BOZHAVLUPAN Gümüş boz concept home Banyo Düzenleyici GÜMÜŞHAVLUPAN Kancalı Banyo Havlupan Askısı Fönlük Havluluk Banyo Aksesuarı Düzenleyici Banyo Rafı",
    "BOZHAVLUPAN Siyah": "BOZHAVLUPAN Siyah boz concept home Banyo Düzenleyici SİYAHHAVLUPAN Kancalı Banyo Havlupan Askısı Fönlük Havluluk Banyo Aksesuarı Düzenleyici Banyo Rafı",
    "2LİKANCALIBANYOSEPETİ": "2LİKANCALIBANYOSEPETİ Siyah boz concept home Banyo Düzenleyici 2LİKANCALIBANYOSEPETİ 2Lİ Set Banyo Düzenleyici Şampuanlık Mat Siyah YAPIŞKANLI 4 ASKILI Duş Rafı Paslanmaz Organizer",
    "BOZTUVALET20222": "BOZTUVALET20222 7009 boz concept home Banyo Askısı BOZTELRULOKAĞIT Yapışkanlı Metal Mutfak Rulo Kağıt Tutucu Mutfak Düzenleyici Banyo Düzenleyici Havluluk",
    "ZİKZAK+RULOKAĞITSET Gümüş": "ZİKZAK+RULOKAĞITSET GÜMÜŞ 20 x 20 boz concept home Peçetelik ZİKZAKLIRULOGÜMÜŞ Mutfak Rafı Lüks Baharatlık Kağıt Havluluk Fincanlık Sepet Raf Dekoratif Düzenleyici Sepet Peçetelik",
    "ZİKZAK+RULOKAĞITSET Siyah": "ZİKZAK+RULOKAĞITSET SİYAH 20 x 20 boz concept home Peçetelik ZİKZAKLIRULSİYAH Mutfak Rafı Lüks Baharatlık Kağıt Havluluk Fincanlık Sepet Raf Dekoratif Düzenleyici Sepet Peçetelik",
    "ELİT1ASKILIK": "ELİT1ASKILIK Siyah boz concept home Askılık ELİT1 Metal 1 Raflı Metal Ayaklı Portmanto Ve Raflı Konfeksiyon Askılığı Metal Ayaklı Elbise Askılığı",
    "LAVANTASPREY": "LAVANTASPREY LAVANTA boz concept home Banyo Düzenleyici LAVANTASPREY Lavanta Uyku Ve Yastık Spreyi Gardırop Spreyi Rahatlatıcı Uyku Ve Dinlenme Spreyi 50ml",
    "GOLDZİKZAKLI": "GOLDZİKZAKLI1 Gold boz concept home Mutfak Rafı GOLDZİKZAKLI002 Metal Mutfak Rafı Baharatlık Kahve Fincanlığı Mutfak Seti",
    "OVALBANYOSEPETİ40002": "OVALBANYOSEPETİ40002 Siyah boz concept home Askı OVALBANYO SEPETİİ40002 Paslanmaz Banyo Otel Tipi Şampuanlık Banyo Şampuanlık Rafı Aksesuarı Banyo Düzenleyici",
    "METALSTANDSEFHAF01": "METALSTANDSEFHAF01 Şefhaf boz concept home Sabunluk 01ŞEFHAFSTAND Metal Standlı Sıvı Sabunluk Ve bulaşık deterjanlık Plastik 400 ml Banyo Seti",
    "YUVARLAKHAVLULUK00": "YUVARLAKHAVLULUK00 7009 boz concept home Banyo Askısı yuvarlakhavluluk000 Yuvarlak Yapışkanlı Yuvarlak Havluluk Banyo Askısı Banyo Aksesuarı",
    "3KATLISAKSILIK": "3KATLISAKSILIK Siyah boz concept home Saksılık 3KATLISAKSILIK Üç Katlı Paslanmaz Ahşap Tabanlı Su Geçirmez Banyo Çiçeklik Salon Saksılık",
    "TYCJHMB85N170017662669017": "TYCJHMB85N170017662669017 NARDO GRİ boz concept home Banyo Düzenleyici NARDOGRİZİKZAKLI Metal Şampuanlık Banyo Rafı Banyo Düzenleyici Organizer",
    "EKONOMİKSET": "EKONOMİKSET Siyah boz concept home Mutfak Rafı SİYAHZİKZAKLI+SİYAHRULOKAĞITLIK Mutfak Rafı Lüks Baharatlık Kağıt Havlu Mutfak Sepet Raf Dekoratif Baharatlık Düzenleyici Sepet",
    "ÇEMBERLİSİYAHBANYO": "ÇEMBERLİSİYAHBANYO Siyah boz concept home Banyo Düzenleyici ÇEMBERLİSİYAHBANYO 5 Kancalı Süper Lüks Banyo Aksesuar Banyo Düzenleyici Banyo Rafı",
    "FÖNTUTACAĞI SİYAH": "FÖNTUTACAĞI SİYAH boz concept home Banyo Düzenleyici YAPIŞKANLIFÖNLÜK00020 Güçlü Yapışkanlı Fön Makinesi Askısı Saç Kurutma Makinesi Tutacağı Yapışkanlı",
    "LAMALIHAVLULUK": "LAMALIHAVLULUK Siyah boz concept home Banyo Düzenleyici LAMALIHAVLULUK Yapışkanlı Lüks Tasarım Lamalı Solo Havluluk Ev Banyo Düzenleyici",
    "LAMALITUVALETKAĞITLI": "LAMALITUVALETKAĞITLI siyah boz concept home Tuvalet Kağıtlığı LAMALITUVALETKAĞITLIĞI Paslanmaz Yapışkanlı Lüks Tasarım Lamalı Tuvalet Kağıtlığı Ev Banyo Düzenleyici",
    "YUVARLAKHAVLULUK": "YUVARLAKHAVLULUK Siyah boz concept home Banyo Düzenleyici YUVARLAKHAVLULUK310 SüperLüx Yapışkanlı Ev Havluluk Düzenleyici Banyo Aksesuar Seti",
    "6KANCALIMUTFAKGRİ Boz Gold": "6KANCALIMUTFAKGRİ Boz Gold boz concept home Mutfak Rafı 6LIMUTFAKRAFIGOLD Lüks 6 Kancalı Mutfak Rafı Metal Mutfak Düzenleyici Baharatlık Organizer",
    "6KANCALIMUTFAKGRİ Boz Gümüş": "6KANCALIMUTFAKGRİ Boz Gümüş boz concept home Mutfak Rafı 6LIMUTFAKRAFIGÜMÜŞ Lüks 6 Kancalı Mutfak Rafı Metal Mutfak Düzenleyici Baharatlık Organizer",
    "TYCARW446N169385653761693 Gümüş": "TYCARW446N169385653761693 Gümüş boz concept home Ütü Masası ve Aksesuarı ÜTÜSTAMDGÜMÜŞ Kapı Arkası Ütü Ve Ütü Masası Askı Rafı",
    "TYCARW446N169385653761693 Siyah": "TYCARW446N169385653761693 Siyah boz concept home Ütü Masası ve Aksesuarı ÜTÜSTANDSİYAH Kapı Arkası Ütü Ve Ütü Masası Askı Rafı",
    "TYCARW446N169385653761693 Beyaz": "TYCARW446N169385653761693 Beyaz boz concept home Ütü Masası ve Aksesuarı ÜTÜSTANDBEYAZ Kapı Arkası Ütü Ve Ütü Masası Askı Rafı",
    "ZİKZAKLI": "ZİKZAKLI Gümüş boz concept home Mutfak Rafı GÜMÜŞ ZİKZAKLI Mutfak Rafı Lüks Modern Gümüş Metal Baharatlık Rafı Organizer Düzenleyici",
    "BANYOYAPIŞTIRICI": "BANYOYAPIŞTIRICI 6999 boz concept home Banyo Askısı BANYOSTİCKER Banyo Askısı Sticker Yapıştırıcı",
    "BanyoHavluluk": "BanyoHavluluk Siyah Tek Ebat boz concept home Banyo Düzenleyici SİYAH RLO KAĞITLIK Banyo Düzenleyici Çok Amaçlı Dekoratif Havluluk Düzenleyici",
    "GÜMÜŞFİNCANLIK": "GÜMÜŞFİNCANLIK Gümüş boz concept home Kupa GÜMÜŞ KAHVEFİNCANLIK Gümüş 6lı Kahve Fincan Askılığı Kupa Askısı Mutfak Düzenleyicisi",
    "GÜMÜŞHAVLULUK": "GÜMÜŞHAVLULUK boz concept home Baharatlık GÜMÜŞHAVLULUK02 Mutfak Rafı Lüks Baharatlık Kağıt Havlu Mutfak Düzenleyici Baharatlık",
    "SİYAHKAĞITHAVLULUK": "SİYAHKAĞITHAVLULUK boz concept home Baharatlık SİYAHHAVLULUK02 Yapışkanlı Mutfak Rafı Lüks Baharatlık Kağıt Havlu Mutfak Düzenleyici Baharatlık",
    "GOLDKAHVEFİNCANI": "GOLDKAHVEFİNCANI gri boz concept home Dolap İçi Düzenleyici GOLD KAHVEFİNCANLIK Gold 6lı Kahve Fincan Askılığı Kupa Askısı Mutfak Düzenleyicisi",
    "SYHMTFKRAFI": "SYHMTFKRAFI Siyah boz concept home Mutfak Rafı SİYAH ZİKZAKLI Metal Mutfak Rafı Siyah Bardaklık Mutfak Düzenleyici",
    "TYC00682539302": "TYC00682539302 Gümüş boz concept home Banyo Düzenleyici 2Katlıgumusbanyo Tezgah Üstü Raf 2 Katlı Banyo Düzenleyici Mutfak Düzenleyici Baharatlık",
    "BSTK": "BSTK siyah ConceptHome Tuvalet Kağıtlığı ÇELİK TUVALET KAĞITLIĞI0270 Paslanmaz Çelik Banyo Siyah Rulo Kağıt Havlu Tutucu Raf Su Geçirmez Banyo Tuvalet Kağıdı",
    "MMKTS": "MMKTS Renkli 24 x 12 boz concept home Sepet MEYVE SEPETİ Metal Mutfak Meyve Sepeti Dekoratif Kadeh Görünümlü Tel",
    "MDJDW": "MDJDW Gold boz concept home Dolap İçi Düzenleyici HÜNKAR HOME Metal Dolap Içi Raf Düzenleyici Tezgah Üstü Baharat Rafı Siyah",
    "2Katmanlıgold": "2Katmanlıgold Gold Tek Ebat boz concept home Banyo Düzenleyici 2KatlıOrganizer Tezgah Üstü 2 Katlı Gold Mutfak Düzenleyici Baharatlık Banyo Düzenleyici Tezgah Üstü",
    "MDJDA": "MDJDA Siyah boz concept home Dolap İçi Düzenleyici METAL Dolap Içi Raf Düzenleyici Tezgah Üstü Baharat Rafı Siyah",
}

async def update_all_names():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.test_database
    
    print("🔄 Tüm ürün isimlerini güncelliyorum...")
    
    products = await db.products.find({}).to_list(length=None)
    updated = 0
    
    for product in products:
        current_name = product.get('product_name', '')
        
        # Tam eşleşme ara
        if current_name in full_names:
            new_name = full_names[current_name]
            await db.products.update_one(
                {'id': product['id']},
                {'$set': {'product_name': new_name}}
            )
            updated += 1
            print(f"✅ {updated}/76 - {current_name[:40]}...")
    
    print(f"\n🎉 TOPLAM {updated} ÜRÜN İSMİ GÜNCELLENDİ!")
    client.close()

asyncio.run(update_all_names())
