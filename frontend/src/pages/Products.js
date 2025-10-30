import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, Grid, Package, Crown, TrendingUp, Flame, Star, ShoppingCart, Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';
import { trackPageView, trackCategoryClick, trackProductClick } from '../utils/analytics';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'Tümü');
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);
  
  const { user, token } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    trackPageView('Products Page');
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allProducts, searchQuery, selectedCategory, sortBy, priceRange]);

  const fetchData = async () => {
    try {
      // Fetch all products
      const productsRes = await axios.get(`${API_URL}/products`);
      setAllProducts(productsRes.data);

      // Fetch categories
      const categoriesRes = await axios.get(`${API_URL}/categories`);
      setCategories(['Tümü', ...categoriesRes.data.categories]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Ürünler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allProducts];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'Tümü') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Price filter
    filtered = filtered.filter(product => {
      const price = product.discounted_price || product.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => (a.discounted_price || a.price) - (b.discounted_price || b.price));
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => (b.discounted_price || b.price) - (a.discounted_price || a.price));
    } else if (sortBy === 'name-asc') {
      filtered.sort((a, b) => a.product_name.localeCompare(b.product_name, 'tr'));
    } else if (sortBy === 'name-desc') {
      filtered.sort((a, b) => b.product_name.localeCompare(a.product_name, 'tr'));
    }

    setFilteredProducts(filtered);
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

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#C9A962] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-20 bg-black" data-testid="products-page" style={{ zoom: '0.9' }}>
      {/* Top Bar with Search and Filters */}
      <div className="sticky top-16 z-30 bg-black/95 backdrop-blur-sm border-b border-gray-800 py-4">
        <div className="max-w-[1800px] mx-auto px-8 lg:px-20">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Ürün ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#1C1C1C] border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A962] transition-colors"
              />
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              {/* Category Dropdown */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 lg:flex-none px-4 py-3 bg-[#1C1C1C] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-[#C9A962] transition-colors cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 lg:flex-none px-4 py-3 bg-[#1C1C1C] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-[#C9A962] transition-colors cursor-pointer"
              >
                <option value="default">Sıralama</option>
                <option value="price-asc">Fiyat: Düşük → Yüksek</option>
                <option value="price-desc">Fiyat: Yüksek → Düşük</option>
                <option value="name-asc">İsim: A → Z</option>
                <option value="name-desc">İsim: Z → A</option>
              </select>

              {/* Advanced Filters Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 bg-[#1C1C1C] border border-gray-800 rounded-xl text-white hover:border-[#C9A962] transition-colors"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-6 p-6 bg-[#1C1C1C] border border-gray-800 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Fiyat Aralığı</h3>
                <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-6">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="w-24 px-3 py-2 bg-black border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#C9A962]"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-24 px-3 py-2 bg-black border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#C9A962]"
                />
                <span className="text-gray-400 text-sm">₺</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-8 sm:px-10 lg:px-20 mt-16">
        {/* Results Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {selectedCategory === 'Tümü' ? 'Tüm Ürünler' : selectedCategory}
            </h2>
            <p className="text-gray-400">
              {filteredProducts.length} ürün bulundu
            </p>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-16 mb-16">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                data-testid={`product-card-${product.id}`}
                className="group bg-black rounded-2xl overflow-hidden border border-gray-800 hover:border-[#C9A962] transition-all duration-300 hover:shadow-2xl hover:shadow-[#C9A962]/30 hover:scale-105 hover:-translate-y-2"
                style={{ margin: '0' }}
              >
                {/* Product Image */}
                <Link to={`/products/${product.id}`} className="block">
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
                    
                    {/* BOZ PLUS Badge */}
                    {product.boz_plus_price && (
                      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 bg-purple-600 rounded-full border border-purple-400">
                        <Crown className="w-3.5 h-3.5 text-purple-200 fill-purple-200" />
                        <span className="text-xs font-bold text-white">PLUS</span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-4">
                  <Link to={`/products/${product.id}`}>
                    <h3 className="text-white font-semibold text-base mb-2 line-clamp-2 group-hover:text-[#C9A962] transition-colors">
                      {product.product_name}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                    <Package className="w-4 h-4" />
                    <span>{product.category}</span>
                  </div>

                  {/* Pricing */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      {product.discounted_price ? (
                        <>
                          <span className="text-xl font-bold text-[#C9A962]">{product.discounted_price} ₺</span>
                          <span className="text-sm text-gray-500 line-through">{product.price} ₺</span>
                        </>
                      ) : (
                        <span className="text-xl font-bold text-[#C9A962]">{product.price} ₺</span>
                      )}
                    </div>

                    {/* BOZ PLUS Price */}
                    {product.boz_plus_price && (
                      <div className="mt-2 bg-purple-900/20 border border-purple-500 rounded-lg px-2 py-1">
                        <div className="flex items-center gap-2">
                          <Crown className="w-3.5 h-3.5 text-purple-400" />
                          <span className="text-sm font-bold text-purple-400">{product.boz_plus_price} ₺</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      handleAddToCart(e, product);
                    }}
                    disabled={addingToCart[product.id]}
                    className="w-full bg-gradient-to-r from-[#C9A962] to-[#E6C888] hover:from-[#A78D4E] hover:to-[#C9A962] text-black font-semibold py-2.5 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-[#C9A962]/50 active:scale-95 flex items-center justify-center gap-2 group"
                  >
                    <ShoppingCart className="w-4 h-4 group-hover:animate-bounce" />
                    <span className="group-hover:scale-105 transition-transform duration-200">
                      {addingToCart[product.id] ? 'Ekleniyor...' : 'Sepete Ekle'}
                    </span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Ürün Bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun ürün bulunamadı</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
