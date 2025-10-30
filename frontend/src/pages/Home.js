import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowRight, Sparkles, ShoppingCart } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';
import { trackPageView, trackProductClick } from '../utils/analytics';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  const { user, token } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [addingToCart, setAddingToCart] = useState({});

  useEffect(() => {
    trackPageView('Home Page');
    fetchCategories();
    fetchFeaturedProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      const cats = response.data.categories;
      setCategories(cats);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setFeaturedProducts(response.data.slice(0, 12));
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const motivationalMessages = [
    "Harika seçim! 🌟",
    "Tarzınız mükemmel! ✨",
    "Eviniz muhteşem olacak! 🏠",
    "Güzel zevkler! 🎨",
    "Şıklık tercihiniz süper! 💎",
    "İyi bir seçim yaptınız! 👌",
    "Eviniz için en iyisini seçtiniz! 🌈",
    "Mükemmel bir ürün! ⭐",
    "Harika bir tercih! 🎉",
    "Stil sahibisiniz! 👑"
  ];

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { 
      startVelocity: 30, 
      spread: 360, 
      ticks: 60, 
      zIndex: 9999,
      colors: ['#C9A962', '#E6C888', '#A78D4E', '#D4AF37', '#FFD700']
    };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti(Object.assign({}, defaults, { 
        particleCount, 
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
      }));
      confetti(Object.assign({}, defaults, { 
        particleCount, 
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
      }));
    }, 250);
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      toast.info('Sepete eklemek için giriş yapmalısınız', {
        duration: 1500,
        style: {
          background: '#1C1C1C',
          color: '#fff',
          border: '1px solid #C9A962'
        }
      });
      navigate('/auth');
      return;
    }

    setAddingToCart(prev => ({ ...prev, [product.id]: true }));

    try {
      await addToCart(product.id, 1);
      
      // Trigger confetti
      triggerConfetti();

      // Random motivational message
      const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      
      toast.success(randomMessage, {
        duration: 1500,
        style: {
          background: 'linear-gradient(135deg, #C9A962 0%, #E6C888 100%)',
          color: '#000',
          fontWeight: 'bold',
          border: 'none'
        }
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Sepete eklenirken hata oluştu');
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-black" data-testid="home-page">
      {/* Hero Video Section */}
      <section className="relative h-screen overflow-hidden" data-testid="hero-section">
        {/* Boz Concept Home Title - Large and Prominent */}
        <div className="absolute top-0 left-0 right-0 z-20 py-8 text-center">
          <h1 
            className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-wide mb-2"
            style={{ 
              fontFamily: 'Playfair Display, serif',
              background: 'linear-gradient(135deg, #C9A962 0%, #E6C888 50%, #D4AF37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 30px rgba(201, 169, 98, 0.8)) drop-shadow(0 0 60px rgba(201, 169, 98, 0.4))',
              animation: 'gradient-x 3s ease infinite'
            }}
          >
            Boz Concept Home
          </h1>
          <p className="text-[#C9A962] text-lg sm:text-xl font-semibold tracking-widest" style={{
            textShadow: '0 0 10px rgba(0, 0, 0, 0.9)'
          }}>
            LÜKS & MİNİMALİST TASARIM
          </p>
        </div>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://customer-assets.emergentagent.com/job_b295a86f-9e3f-46e9-b312-d8a568042b59/artifacts/oji4tpag_3714085573074912081.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-4">
          <div className="flex items-center gap-2 mb-6 opacity-0 animate-fade-in-up">
            <Sparkles className="w-6 h-6 text-[#C9A962]" />
            <span className="text-sm uppercase tracking-widest text-[#C9A962] font-medium">Premium Kalite</span>
          </div>
          <h2
            data-testid="hero-title"
            className="text-4xl sm:text-6xl lg:text-7xl font-bold text-center mb-6 tracking-tight opacity-0 animate-fade-in-up stagger-1 leading-tight"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Yaşam Alanlarınızda<br />Estetiği Yeniden Tanımlayın
          </h2>
          <p className="text-base sm:text-lg text-center mb-10 max-w-2xl text-gray-300 opacity-0 animate-fade-in-up stagger-2">
            Modern ve minimalist tasarımlarımızla evinize şıklık ve fonksiyonellik katmayı keşfedin
          </p>
          <Link to="/products" className="opacity-0 animate-fade-in-up stagger-3">
            <Button
              data-testid="hero-cta-button"
              size="lg"
              className="bg-gradient-to-r from-[#C9A962] to-[#E6C888] hover:from-[#A78D4E] hover:to-[#C9A962] text-black font-semibold px-10 py-7 text-base rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-xl"
            >
              Koleksiyonları Keşfet
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-24 bg-black relative" data-testid="categories-section">
        {/* Background Brand Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <p className="text-9xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            BOZ CONCEPT
          </p>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C9A962]/20 to-[#E6C888]/20 border border-[#C9A962]/30 rounded-full mb-6">
              <span className="text-base font-bold bg-gradient-to-r from-[#C9A962] to-[#E6C888] bg-clip-text text-transparent uppercase tracking-wide">
                Boz Concept Home Kategoriler
              </span>
            </div>
            <h2
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Öne Çıkan Koleksiyonlar
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Her kategoride kusursuz tasarım ve fonksiyonellik bir arada
            </p>
          </div>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link
                key={category}
                to={`/products?category=${encodeURIComponent(category)}`}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1C1C1C] to-[#0A0A0A] border border-gray-800 hover:border-[#C9A962] p-8 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-[#C9A962]/40 hover:-translate-y-2"
                style={{
                  animationDelay: `${0.1 * index}s`
                }}
              >
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#C9A962] transition-colors">
                    {category}
                  </h3>
                  <ArrowRight className="w-5 h-5 mx-auto text-[#C9A962] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link to="/products">
              <Button
                data-testid="view-all-products-button"
                size="lg"
                className="bg-gradient-to-r from-[#C9A962] to-[#E6C888] hover:from-[#A78D4E] hover:to-[#C9A962] text-black font-semibold px-10 py-6 text-base rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Tüm Ürünleri Keşfet
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="relative py-24 bg-[#0A0A0A] text-white border-t border-gray-900 overflow-hidden" data-testid="brand-story-section">
        {/* Transparent Background Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <h2 
            className="text-[12rem] sm:text-[16rem] lg:text-[20rem] font-bold text-[#C9A962] whitespace-nowrap leading-none"
            style={{ 
              fontFamily: 'Playfair Display, serif',
              opacity: '0.08',
              transform: 'translateY(-10%)',
              WebkitTextStroke: '1px rgba(201, 169, 98, 0.15)'
            }}
          >
            Boz Concept Home
          </h2>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A962]/10 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-[#C9A962]" />
              <span className="text-sm font-semibold text-[#C9A962] uppercase tracking-wide">Hakkımızda</span>
            </div>
            <h2
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Boz Concept Home Felsefesi
            </h2>
            <div className="space-y-6 text-lg leading-relaxed text-gray-400">
              <p>
                Modern, endüstriyel ve minimalist tasarım anlayışımızla, yaşam alanlarınızı estetik ve fonksiyonel hale
                getiriyoruz. Kaliteden ödün vermeden, her detayı özenle tasarladığımız ürünlerimizle evinize şıklık
                katıyoruz.
              </p>
              <p>
                Sıcak ahşap dokuların soğuk metalin gücüyle buluştuğu eşsiz tasarımlarımızla, modern yaşamın
                konforu ve zevkini bir arada sunuyoruz.
              </p>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-[#C9A962] mb-2">69+</div>
                <div className="text-sm text-gray-500">Benzersiz Ürün</div>
              </div>
              <div className="h-16 w-px bg-gray-800"></div>
              <div>
                <div className="text-4xl font-bold text-[#C9A962] mb-2">17</div>
                <div className="text-sm text-gray-500">Farklı Kategori</div>
              </div>
              <div className="h-16 w-px bg-gray-800"></div>
              <div>
                <div className="text-4xl font-bold text-[#C9A962] mb-2">%100</div>
                <div className="text-sm text-gray-500">Kalite Garantisi</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
