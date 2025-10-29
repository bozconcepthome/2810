import React from 'react';
import { Info, Heart, Award, Users } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen pt-24 pb-20 bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A962]/10 rounded-full mb-6">
            <Info className="w-4 h-4 text-[#C9A962]" />
            <span className="text-sm font-semibold text-[#C9A962] uppercase tracking-wide">Hakkımızda</span>
          </div>
          <h1
            className="text-5xl sm:text-6xl font-bold text-white mb-6"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Boz Concept Home
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Evinizi daha güzel, daha düzenli ve daha yaşanabilir hale getirmek için buradayız
          </p>
        </div>

        {/* Story */}
        <div className="bg-gradient-to-br from-[#1C1C1C] to-[#0A0A0A] border border-gray-800 rounded-2xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Hikayemiz</h2>
          <div className="space-y-4 text-gray-300 leading-relaxed">
            <p>
              Boz Concept Home, modern yaşam alanlarını daha fonksiyonel ve estetik hale getirme tutkusuyla kuruldu. 
              Evlerimizin sadece yaşadığımız yerler değil, aynı zamanda kendimizi ifade ettiğimiz, 
              rahatlık bulduğumuz ve mutlu olduğumuz alanlar olduğuna inanıyoruz.
            </p>
            <p>
              Kaliteli, şık ve işlevsel ev dekorasyon ürünleri sunarak, her eve özel dokunuşlar katmayı hedefliyoruz. 
              Mutfaktan banyoya, oturma odasından yatak odasına kadar her alanı düşünerek tasarlanmış ürünlerimiz, 
              günlük yaşamınızı kolaylaştırmayı ve daha keyifli hale getirmeyi amaçlıyor.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-[#1C1C1C] to-[#0A0A0A] border border-gray-800 rounded-2xl p-6 hover:border-[#C9A962]/50 transition-all">
            <div className="w-12 h-12 bg-[#C9A962]/10 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-[#C9A962]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Müşteri Memnuniyeti</h3>
            <p className="text-gray-400 text-sm">
              Müşterilerimizin memnuniyeti bizim en büyük önceliğimiz. Her siparişte mükemmel hizmet sunmayı hedefliyoruz.
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#1C1C1C] to-[#0A0A0A] border border-gray-800 rounded-2xl p-6 hover:border-[#C9A962]/50 transition-all">
            <div className="w-12 h-12 bg-[#C9A962]/10 rounded-full flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-[#C9A962]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Kalite</h3>
            <p className="text-gray-400 text-sm">
              Sadece en kaliteli malzemelerden üretilmiş, dayanıklı ve estetik ürünler sunuyoruz.
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#1C1C1C] to-[#0A0A0A] border border-gray-800 rounded-2xl p-6 hover:border-[#C9A962]/50 transition-all">
            <div className="w-12 h-12 bg-[#C9A962]/10 rounded-full flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-[#C9A962]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Topluluk</h3>
            <p className="text-gray-400 text-sm">
              Müşterilerimiz bizim ailemizin bir parçası. BOZ PLUS ile özel ayrıcalıklar sunuyoruz.
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-gradient-to-br from-[#1C1C1C] to-[#0A0A0A] border-2 border-[#C9A962]/30 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Bize Ulaşın</h2>
          <p className="text-gray-400 mb-6">
            Sorularınız veya önerileriniz için bizimle iletişime geçmekten çekinmeyin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://instagram.com/bozconcepthome"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C9A962] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#C9A962] text-black font-bold rounded-lg transition-all"
            >
              Instagram'da Takip Edin
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
