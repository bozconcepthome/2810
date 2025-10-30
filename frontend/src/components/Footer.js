import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail, Phone, Crown, Sparkles, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-b from-black via-gray-900 to-black text-white border-t border-gray-800" data-testid="main-footer">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(201,169,98,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(201,169,98,0.03)_1px,transparent_1px)] bg-[size:50px_50px] opacity-50" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Brand Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <img
              src="https://customer-assets.emergentagent.com/job_b295a86f-9e3f-46e9-b312-d8a568042b59/artifacts/sggtoyzw_assets_client_upload_media_8770e291c8248ccfb52eae7c92887d4e18d907a5_media_01jw37p102f5pajm4m2ckmt4gk.png"
              alt="Boz Concept Home"
              className="h-16 w-auto mx-auto drop-shadow-2xl"
            />
          </div>
          <h2 className="text-4xl font-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            <span className="bg-gradient-to-r from-[#C9A962] via-[#E6C888] to-[#D4AF37] bg-clip-text text-transparent">
              Boz Concept Home
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-6">
            Modern ve minimalist tasarımlarıyla evinize zarafet katan kaliteli mobilyalar sunar.
          </p>
          <div className="flex items-center justify-center gap-2 text-[#C9A962]">
            <Sparkles size={16} />
            <span className="text-sm font-semibold uppercase tracking-widest">Lüks & Minimalist</span>
            <Sparkles size={16} />
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-[#C9A962]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Hakkımızda
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Boz Concept Home, modern ve minimalist tasarım anlayışımızla yaşam alanlarınızı estetik ve fonksiyonel hale getiriyoruz.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-gray-400">Kalite ve zarafet bir arada</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-[#C9A962]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Hızlı Linkler
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/products" className="text-gray-400 hover:text-[#C9A962] transition flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-[#C9A962] rounded-full group-hover:w-2 transition-all" />
                  Ürünler
                </Link>
              </li>
              <li>
                <Link to="/" className="text-gray-400 hover:text-[#C9A962] transition flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-[#C9A962] rounded-full group-hover:w-2 transition-all" />
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link to="/boz-plus" className="text-gray-400 hover:text-[#C9A962] transition flex items-center gap-2 group">
                  <Crown className="w-4 h-4 text-purple-500" />
                  BOZ PLUS
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-gray-400 hover:text-[#C9A962] transition flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-[#C9A962] rounded-full group-hover:w-2 transition-all" />
                  Giriş / Kayıt
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-[#C9A962]" style={{ fontFamily: 'Playfair Display, serif' }}>
              İletişim
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-gray-400">
                <Mail className="w-5 h-5 text-[#C9A962] mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Email</p>
                  <a href="mailto:info@bozconcepthome.com" className="hover:text-[#C9A962] transition">
                    info@bozconcepthome.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <Phone className="w-5 h-5 text-[#C9A962] mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Telefon</p>
                  <a href="tel:+905551234567" className="hover:text-[#C9A962] transition">
                    +90 555 123 45 67
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* Social & Newsletter */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-[#C9A962]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Sosyal Medya
            </h3>
            <div className="flex gap-3 mb-6">
              <a 
                href="#" 
                className="p-3 bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-700 hover:border-[#C9A962] rounded-xl transition-all duration-300 hover:scale-110 group"
              >
                <Instagram className="w-5 h-5 text-gray-400 group-hover:text-[#C9A962] transition-colors" />
              </a>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-br from-[#C9A962]/10 to-[#E6C888]/10 border border-[#C9A962]/30 rounded-xl">
              <p className="text-sm text-[#C9A962] font-semibold mb-2">✨ Premium Üyelik</p>
              <p className="text-xs text-gray-400 mb-3">BOZ PLUS ile özel fiyatlar</p>
              <Link 
                to="/boz-plus"
                className="block w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg text-center transition-colors"
              >
                Keşfet
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              &copy; 2025 <span className="font-bold text-[#C9A962]">Boz Concept Home</span>. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <Link to="/" className="hover:text-[#C9A962] transition">Gizlilik Politikası</Link>
              <span>•</span>
              <Link to="/" className="hover:text-[#C9A962] transition">Kullanım Koşulları</Link>
              <span>•</span>
              <Link to="/" className="hover:text-[#C9A962] transition">İade & Değişim</Link>
            </div>
          </div>
          
          {/* Powered by line */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-600">
              Designed with <Heart className="inline w-3 h-3 text-red-500" /> by <span className="font-bold text-[#C9A962]">Boz Concept Home</span> Team
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
