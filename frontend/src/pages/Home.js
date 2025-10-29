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
      
      // Fetch products for each category
      for (const cat of cats.slice(0, 6)) {
        const productsRes = await axios.get(`${API_URL}/products?category=${encodeURIComponent(cat)}`);
        setCategoryProducts(prev => ({
          ...prev,
          [cat]: productsRes.data.slice(0, 4)
        }));
      }
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
        duration: 3000,
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
        duration: 3000,
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
            <span className="text-sm uppercase tracking-widest text-[#C9A962] font-medium">Lüks & Minimalist</span>
          </div>
          <h1
            data-testid="hero-title"
            className="text-4xl sm:text-6xl lg:text-7xl font-bold text-center mb-6 tracking-tight opacity-0 animate-fade-in-up stagger-1 leading-tight"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Yaşam Alanlarınızda<br />Estetiği Yeniden Tanımlayın
          </h1>
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

      {/* Categories Pinterest Style */}
      <section className="py-24 bg-black" data-testid="categories-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A962]/10 rounded-full mb-4">
              <span className="text-sm font-semibold text-[#C9A962] uppercase tracking-wide">Kategoriler</span>
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

          {/* Pinterest-style Category Cards */}
          <div className="space-y-20">
            {categories.slice(0, 6).map((category, catIndex) => {
              const products = categoryProducts[category] || [];
              if (products.length === 0) return null;

              return (
                <div key={category} className={`opacity-0 animate-fade-in-up stagger-${catIndex + 1}`}>
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 
                        className="text-3xl sm:text-4xl font-bold text-white mb-2"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                      >
                        {category}
                      </h3>
                      <div className="h-1 w-20 bg-gradient-to-r from-[#C9A962] to-[#E6C888] rounded-full"></div>
                    </div>
                    <Link 
                      to={`/products?category=${encodeURIComponent(category)}`}
                      className="group flex items-center gap-2 text-[#C9A962] hover:text-[#A78D4E] font-medium transition-all"
                    >
                      Tümünü Gör
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Pinterest Masonry Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {products.map((product, idx) => (
                      <Link
                        key={product.id}
                        to={`/products/${product.id}`}
                        data-testid={`category-product-${product.id}`}
                        className={`group relative overflow-hidden rounded-2xl bg-[#1C1C1C] border border-gray-800 hover:border-[#C9A962] shadow-md hover:shadow-2xl transition-all duration-500 opacity-0 animate-scale-in stagger-${idx + 1} ${
                          idx % 3 === 0 ? 'row-span-2' : 'row-span-1'
                        }`}
                        style={{
                          animationDelay: `${0.1 * idx}s`
                        }}
                      >
                        {/* Product Image */}
                        <div className={`relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 ${
                          idx % 3 === 0 ? 'h-96' : 'h-64'
                        }`}>
                          {product.image_urls && product.image_urls[0] && (
                            <img
                              src={product.image_urls[0]}
                              alt={product.product_name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          )}
                          
                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                              <p className="text-xs uppercase tracking-wide mb-1 text-[#E6C888]">
                                {product.category}
                              </p>
                              <h4 className="font-semibold text-base mb-2 line-clamp-2">
                                {product.product_name}
                              </h4>
                              <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-[#E6C888]">
                                  {product.discounted_price || product.price} ₺
                                </span>
                                <span className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                                  {product.stock_status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Product Info (Visible on mobile) */}
                        <div className="p-4 md:hidden">
                          <p className="text-xs text-gray-400 uppercase mb-1">{product.category}</p>
                          <h4 className="font-semibold text-sm text-white mb-2 line-clamp-2">
                            {product.product_name}
                          </h4>
                          <span className="text-lg font-bold text-[#C9A962]">
                            {product.discounted_price || product.price} ₺
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-16">
            <Link to="/products">
              <Button
                data-testid="view-all-categories-button"
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
      <section className="py-24 bg-[#0A0A0A] text-white border-t border-gray-900" data-testid="brand-story-section">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
