import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Grid, Package, Crown, TrendingUp, Flame, Star, ShoppingCart } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';
import { trackPageView, trackCategoryClick, trackProductClick } from '../utils/analytics';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Products = () => {
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});
  const { user, token } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    trackPageView('Products Page');
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch best sellers
      const bestSellersRes = await axios.get(`${API_URL}/products/best-sellers/list`);
      setBestSellers(bestSellersRes.data);

      // Fetch categories
      const categoriesRes = await axios.get(`${API_URL}/categories`);
      const cats = categoriesRes.data.categories;
      setCategories(cats);

      // Fetch products for each category
      const productsMap = {};
      for (const cat of cats) {
        const productsRes = await axios.get(`${API_URL}/products?category=${encodeURIComponent(cat)}`);
        productsMap[cat] = productsRes.data;
      }
      setCategoryProducts(productsMap);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category) => {
    trackCategoryClick(category);
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const handleProductClick = (product) => {
    trackProductClick(product);
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

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#C9A962] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-black" data-testid="products-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A962]/10 rounded-full mb-6">
            <Grid className="w-4 h-4 text-[#C9A962]" />
            <span className="text-sm font-semibold text-[#C9A962] uppercase tracking-wide">Koleksiyonlar</span>
          </div>
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Ürün Kategorileri
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Her kategori özenle seçilmiş, kaliteli ve şık ürünlerle doludur
          </p>
        </div>

        {/* Best Sellers Section */}
        {bestSellers.length > 0 && (
          <div className="mb-16 animate-fade-in-up" data-testid="best-sellers-section">
            {/* Section Header */}
            <div className="relative mb-10">
              <div className="flex items-center justify-center mb-8">
                <div className="relative inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-600/20 via-red-600/20 to-orange-600/20 rounded-full border-2 border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                  <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
                  <span className="text-xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-orange-400 bg-clip-text text-transparent uppercase tracking-wider">
                    En Çok Satan Ürünler
                  </span>
                  <TrendingUp className="w-6 h-6 text-orange-500 animate-pulse" />
                </div>
              </div>
              <p className="text-center text-gray-400 text-lg mb-8">
                Müşterilerimizin favorisi, en çok tercih edilen ürünlerimiz
              </p>
            </div>

            {/* Best Sellers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellers.map((product, idx) => (
                <div
                  key={product.id}
                  className="group relative bg-[#1C1C1C] rounded-2xl overflow-hidden border-2 border-orange-500/30 hover:border-orange-500 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(249,115,22,0.4)] opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${0.1 * idx}s`, animationFillMode: 'forwards' }}
                >
                  {/* Best Seller Badge */}
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-600 to-red-600 rounded-full shadow-lg">
                    <Star className="w-4 h-4 text-white fill-white" />
                    <span className="text-xs font-bold text-white">#{idx + 1} ÇOK SATAN</span>
                  </div>

                  {/* BOZ PLUS Badge (if applicable) */}
                  {product.boz_plus_price && (
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 bg-purple-600 rounded-full border border-purple-400">
                      <Crown className="w-3.5 h-3.5 text-purple-200 fill-purple-200" />
                      <span className="text-xs font-bold text-white">PLUS</span>
                    </div>
                  )}

                  {/* Product Image - clickable */}
                  <Link to={`/product/${product.id}`} onClick={() => handleProductClick(product)}>
                    <div className="relative h-72 overflow-hidden bg-gradient-to-br from-gray-900 to-black">
                      {product.image_urls && product.image_urls.length > 0 ? (
                        <img
                          src={product.image_urls[0]}
                          alt={product.product_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-16 h-16 text-gray-700" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-5">
                    <Link to={`/product/${product.id}`} onClick={() => handleProductClick(product)}>
                      <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-orange-400 transition-colors">
                        {product.product_name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                      <Package className="w-4 h-4" />
                      <span>{product.category}</span>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {product.discounted_price ? (
                          <>
                            <span className="text-2xl font-bold text-white">{product.discounted_price} ₺</span>
                            <span className="text-sm text-gray-500 line-through">{product.price} ₺</span>
                          </>
                        ) : (
                          <span className="text-2xl font-bold text-white">{product.price} ₺</span>
                        )}
                      </div>

                      {/* BOZ PLUS Price */}
                      {product.boz_plus_price && (
                        <div className="bg-gradient-to-r from-purple-900/20 via-violet-900/20 to-purple-900/20 border-2 border-purple-500 rounded-lg px-3 py-2 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Crown className="w-4 h-4 text-purple-400 fill-purple-400" />
                              <span className="text-base font-extrabold bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent">
                                {product.boz_plus_price} ₺
                              </span>
                            </div>
                            {!user?.is_boz_plus && (
                              <span className="text-xs bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent font-bold">✨ Üye Fiyatı</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Sales Count */}
                      <div className="flex items-center gap-1.5 text-orange-400 mb-3">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-semibold">{product.sales_count} kez satıldı</span>
                      </div>

                      {/* Add to Cart Button */}
                      <Button
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={addingToCart[product.id]}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#C9A962] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#C9A962] text-black font-bold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
                        data-testid={`add-to-cart-${product.id}`}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        {addingToCart[product.id] ? 'Ekleniyor...' : 'Sepete Ekle'}
                      </Button>
                      >
                        <ShoppingCart className="w-5 h-5" />
                        <span>Sepete Ekle</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="mt-16 mb-12 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-800"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-black px-6 py-2 text-gray-500 text-sm uppercase tracking-wider">Tüm Kategoriler</span>
              </div>
            </div>
          </div>
        )}

        {/* Categories Grid */}
        <div className="space-y-8">
          {categories.map((category, index) => {
            const products = categoryProducts[category] || [];
            const previewProducts = products.slice(0, 4);
            const isExpanded = expandedCategory === category;
            const displayProducts = isExpanded ? products : previewProducts;

            return (
              <div
                key={category}
                data-testid={`category-section-${index}`}
                className="bg-[#1C1C1C] rounded-3xl overflow-hidden border border-gray-800 hover:border-[#C9A962]/50 transition-all duration-300 opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${0.1 * index}s`, animationFillMode: 'forwards' }}
              >
                {/* Category Header */}
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-900 to-black">
                  {/* Category Preview Images Collage */}
                  <div className="absolute inset-0 grid grid-cols-4 gap-2 p-4 opacity-30">
                    {previewProducts.map((product, idx) => (
                      product.image_urls && product.image_urls[0] && (
                        <div key={idx} className="relative overflow-hidden rounded-lg">
                          <img
                            src={product.image_urls[0]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )
                    ))}
                  </div>
                  
                  {/* Category Info Overlay */}
                  <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full mb-4">
                      <Package className="w-4 h-4 text-[#C9A962]" />
                      <span className="text-xs text-gray-300 font-medium">{products.length} Ürün</span>
                    </div>
                    <h2
                      className="text-4xl sm:text-5xl font-bold text-white mb-3"
                      style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                      {category}
                    </h2>
                    <div className="h-1 w-24 bg-gradient-to-r from-[#C9A962] to-[#E6C888] rounded-full mb-4"></div>
                    <p className="text-gray-400 text-sm max-w-md">
                      Modern ve şık {category.toLowerCase()} tasarımları
                    </p>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    {displayProducts.map((product) => (
                      <Link
                        key={product.id}
                        to={`/products/${product.id}`}
                        onClick={() => handleProductClick(product)}
                        data-testid={`product-card-${product.id}`}
                        className="group bg-black rounded-2xl overflow-hidden border border-gray-800 hover:border-[#C9A962] transition-all duration-300 hover:scale-105"
                      >
                        {/* Product Image */}
                        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-900 to-black">
                          {product.image_urls && product.image_urls[0] ? (
                            <img
                              src={product.image_urls[0]}
                              alt={product.product_name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-12 h-12 text-gray-700" />
                            </div>
                          )}
                          
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <div className="flex items-center justify-between text-white">
                                <span className="text-sm font-semibold">Detaylar</span>
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-4">
                          <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2 group-hover:text-[#C9A962] transition">
                            {product.product_name}
                          </h3>
                          <div className="flex flex-col space-y-2">
                            {/* Regular Price */}
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-[#C9A962]">
                                {product.discounted_price || product.price} ₺
                              </span>
                              {product.stock_status === 'Stokta' && (
                                <span className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                                  Stokta
                                </span>
                              )}
                            </div>
                            
                            {/* BOZ PLUS Price - Everyone can see */}
                            {product.boz_plus_price && (
                              <div className="bg-gradient-to-r from-purple-900/20 via-violet-900/20 to-purple-900/20 border-2 border-purple-500 rounded-lg px-3 py-2 shadow-[0_0_15px_rgba(255,215,0,0.3)]">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <Crown className="w-4 h-4 text-[#FFD700] fill-[#FFD700]" />
                                    <span className="text-base font-extrabold bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent">
                                      {product.boz_plus_price} ₺
                                    </span>
                                  </div>
                                  {!user?.is_boz_plus && (
                                    <span className="text-xs bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent font-bold">🔥 Üye Fiyatı</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Show More/Less Button */}
                  {products.length > 4 && (
                    <div className="text-center">
                      <Button
                        onClick={() => toggleCategory(category)}
                        data-testid={`toggle-category-${category}`}
                        className="bg-gradient-to-r from-[#C9A962] to-[#E6C888] hover:from-[#A78D4E] hover:to-[#C9A962] text-black font-semibold px-8 py-6 rounded-full transition-all duration-300 hover:scale-105"
                      >
                        {isExpanded ? (
                          <>
                            Daha Az Göster
                            <ChevronRight className="ml-2 w-5 h-5 rotate-90" />
                          </>
                        ) : (
                          <>
                            {products.length - 4} Ürün Daha Göster
                            <ChevronRight className="ml-2 w-5 h-5" />
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-20 text-center bg-gradient-to-r from-[#C9A962]/10 to-[#E6C888]/10 rounded-3xl p-12 border border-[#C9A962]/20">
          <h3 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Aradığınızı Bulamadınız mı?
          </h3>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Tüm kategorilerde toplamda {Object.values(categoryProducts).flat().length} farklı ürün bulunmaktadır.
            Her gün yeni ürünler ekliyoruz!
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#C9A962] mb-1">{categories.length}</div>
              <div className="text-xs text-gray-500">Kategori</div>
            </div>
            <div className="h-12 w-px bg-gray-800"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#C9A962] mb-1">
                {Object.values(categoryProducts).flat().length}
              </div>
              <div className="text-xs text-gray-500">Ürün</div>
            </div>
            <div className="h-12 w-px bg-gray-800"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#C9A962] mb-1">%100</div>
              <div className="text-xs text-gray-500">Kalite</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
