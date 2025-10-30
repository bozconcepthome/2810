import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, Grid, Package, Crown, TrendingUp, Flame, Star, ShoppingCart, Search, SlidersHorizontal, X, Sparkles } from 'lucide-react';
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
  const [categoryData, setCategoryData] = useState([]);
  const [preorderProducts, setPreorderProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || null);
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState(selectedCategory ? 'products' : 'categories'); // 'categories' or 'products'
  
  const { user, token } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    trackPageView('Products Page');
    fetchData();
    fetchPreorderProducts();
  }, []);

  const fetchPreorderProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/preorder-products`);
      setPreorderProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch preorder products:', error);
    }
  };

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
      const cats = categoriesRes.data.categories;
      setCategories(cats);

      // Create category data with preview products
      const categoryDataWithProducts = cats.map(cat => {
        const categoryProducts = productsRes.data.filter(p => p.category === cat);
        return {
          name: cat,
          productCount: categoryProducts.length,
          previewImage: categoryProducts[0]?.image_urls?.[0] || null,
          products: categoryProducts
        };
      }).filter(cat => cat.productCount > 0); // Only show categories with products

      setCategoryData(categoryDataWithProducts);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Ürünler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!selectedCategory) return;
    
    let filtered = allProducts.filter(p => p.category === selectedCategory);

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
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

  const handleCategoryClick = (categoryName) => {
    trackCategoryClick(categoryName);
    setSelectedCategory(categoryName);
    setViewMode('products');
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setViewMode('categories');
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div className="min-h-screen pt-20 pb-20 bg-black" data-testid="products-page">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-black via-gray-900 to-black py-16 border-b border-gray-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(201,169,98,0.05),transparent_50%)]" />
        <div className="max-w-[1800px] mx-auto px-8 lg:px-20 relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-[#C9A962] via-[#E6C888] to-[#C9A962] bg-clip-text text-transparent animate-gradient">
              {viewMode === 'categories' ? 'Kategoriler' : selectedCategory}
            </h1>
            <p className="text-gray-400 text-lg">
              {viewMode === 'categories' 
                ? 'İstediğiniz kategoriyi seçin ve ürünleri keşfedin' 
                : `${filteredProducts.length} adet muhteşem ürün`}
            </p>
          </div>

          {/* Pre-order Banner (only in categories view) */}
          {viewMode === 'categories' && preorderProducts.length > 0 && (
            <div className="mb-10">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/30 border border-purple-400 rounded-full mb-3">
                  <Sparkles className="text-purple-300" size={16} />
                  <span className="text-purple-300 text-sm font-bold uppercase tracking-wide">Yakında</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Yeni Ürünler - Ön Sipariş
                </h2>
                <p className="text-purple-200 text-lg">
                  Özel tasarım koleksiyonumuz için ön sipariş verin, ilk siz sahip olun
                </p>
              </div>

              {/* Preorder Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {preorderProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="relative group"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 rounded-2xl opacity-50 group-hover:opacity-75 blur-xl transition-all duration-300" />
                    
                    {/* Card */}
                    <div className="relative bg-gradient-to-br from-[#1C1C1C] to-black border-2 border-purple-500/50 rounded-2xl overflow-hidden group-hover:border-purple-400 transition-all duration-300">
                      {/* Coming Soon Badge */}
                      <div className="absolute top-3 left-3 z-10 px-3 py-1.5 bg-purple-600 rounded-full border border-purple-400 shadow-lg">
                        <span className="text-white text-xs font-bold">YAKINDA</span>
                      </div>

                      {/* Discount Badge */}
                      {product.discount_percentage > 0 && (
                        <div className="absolute top-3 right-3 z-10 px-3 py-1.5 bg-green-600 rounded-full border border-green-400 shadow-lg">
                          <span className="text-white text-xs font-bold">-%{product.discount_percentage} İNDİRİM</span>
                        </div>
                      )}

                      {/* Image */}
                      <div className="h-64 overflow-hidden bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                        {product.image_urls && product.image_urls[0] ? (
                          <img 
                            src={product.image_urls[0]}
                            alt={product.product_name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-20 h-20 text-purple-500/30" />
                          </div>
                        )}
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3">
                        {/* Category */}
                        {product.category && (
                          <div className="inline-block px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-lg">
                            <span className="text-purple-300 text-xs font-semibold">{product.category}</span>
                          </div>
                        )}

                        {/* Product Name */}
                        <h3 className="text-white font-bold text-lg line-clamp-2 min-h-[56px]">
                          {product.product_name}
                        </h3>

                        {/* Description */}
                        {product.description && (
                          <p className="text-gray-400 text-sm line-clamp-2">
                            {product.description}
                          </p>
                        )}

                        {/* Price */}
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-purple-400">
                            ~{product.estimated_price} ₺
                          </span>
                          {product.discount_percentage > 0 && (
                            <span className="px-2 py-1 bg-green-500/20 border border-green-500 rounded text-green-400 text-xs font-bold">
                              -%{product.discount_percentage}
                            </span>
                          )}
                        </div>

                        {/* Release Date */}
                        {product.estimated_release_date && (
                          <p className="text-purple-300 text-sm">
                            📅 Tahmini Çıkış: {new Date(product.estimated_release_date).toLocaleDateString('tr-TR')}
                          </p>
                        )}

                        {/* Preorder Button */}
                        <button
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-2"
                        >
                          <Sparkles size={18} />
                          Ön Sipariş Ver
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Info Box */}
              <div className="max-w-3xl mx-auto bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
                <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-purple-300 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-400 text-lg">✓</span>
                    Erken rezervasyon indirimi
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400 text-lg">✓</span>
                    Öncelikli teslimat
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400 text-lg">✓</span>
                    Sınırlı sayıda üretim
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Back Button (when in products view) */}
          {viewMode === 'products' && (
            <div className="flex justify-center mb-8">
              <button
                onClick={handleBackToCategories}
                className="px-6 py-3 bg-[#1C1C1C] border border-gray-700 rounded-xl text-white hover:border-[#C9A962] transition-all duration-300 flex items-center gap-2 group"
              >
                <ChevronRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
                <span>Kategorilere Dön</span>
              </button>
            </div>
          )}

          {/* Search Bar (only in products view) */}
          {viewMode === 'products' && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-[#C9A962] transition-colors" />
                <input
                  type="text"
                  placeholder="Ürün ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-[#1C1C1C]/80 backdrop-blur-sm border-2 border-gray-800 rounded-2xl text-white text-lg placeholder-gray-500 focus:outline-none focus:border-[#C9A962] transition-all duration-300 focus:shadow-xl focus:shadow-[#C9A962]/20"
                />
              </div>
            </div>
          )}

          {/* Sort and Filter Controls (only in products view) */}
          {viewMode === 'products' && (
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-5 py-3 bg-[#1C1C1C]/80 backdrop-blur-sm border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#C9A962] transition-colors cursor-pointer hover:border-[#C9A962]/50"
              >
                <option value="default">✨ Varsayılan Sıralama</option>
                <option value="price-asc">💰 Fiyat: Düşük → Yüksek</option>
                <option value="price-desc">💎 Fiyat: Yüksek → Düşük</option>
                <option value="name-asc">🔤 İsim: A → Z</option>
                <option value="name-desc">🔤 İsim: Z → A</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-5 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                  showFilters
                    ? 'bg-gradient-to-r from-[#C9A962] to-[#E6C888] text-black'
                    : 'bg-[#1C1C1C]/80 backdrop-blur-sm text-white border border-gray-700 hover:border-[#C9A962]'
                }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filtrele
              </button>
            </div>
          )}

          {/* Advanced Filters Panel */}
          {viewMode === 'products' && showFilters && (
            <div className="mt-8 p-8 bg-[#1C1C1C]/80 backdrop-blur-sm border border-gray-700 rounded-2xl max-w-2xl mx-auto animate-slideDown">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-xl flex items-center gap-2">
                  💎 Fiyat Aralığı
                </h3>
                <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex items-center gap-6 justify-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="w-32 px-4 py-3 bg-black border border-gray-600 rounded-xl text-white text-center focus:outline-none focus:border-[#C9A962] transition-colors"
                />
                <span className="text-gray-400 text-xl">→</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-32 px-4 py-3 bg-black border border-gray-600 rounded-xl text-white text-center focus:outline-none focus:border-[#C9A962] transition-colors"
                />
                <span className="text-[#C9A962] font-semibold text-lg">₺</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-8 lg:px-20 mt-16">
        {viewMode === 'categories' ? (
          /* CATEGORIES GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {categoryData.map((category, index) => (
              <div
                key={category.name}
                onClick={() => handleCategoryClick(category.name)}
                className="group relative cursor-pointer"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#C9A962] via-[#E6C888] to-[#C9A962] rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 group-hover:animate-pulse" />
                
                {/* Category Card */}
                <div className="relative bg-gradient-to-br from-[#1C1C1C] to-black rounded-3xl overflow-hidden border border-gray-800 group-hover:border-[#C9A962] transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-3 shadow-2xl group-hover:shadow-[#C9A962]/30 h-[400px]">
                  {/* Category Image */}
                  <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
                    {category.previewImage ? (
                      <img
                        src={category.previewImage}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-125 group-hover:rotate-2 transition-all duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-20 h-20 text-gray-700" />
                      </div>
                    )}
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                    
                    {/* Product Count Badge */}
                    <div className="absolute top-4 right-4 px-4 py-2 bg-[#C9A962]/90 backdrop-blur-sm rounded-full border border-[#E6C888]">
                      <span className="text-black font-bold">{category.productCount} Ürün</span>
                    </div>

                    {/* View Products Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-black/80 backdrop-blur-sm px-8 py-4 rounded-full border border-[#C9A962] text-[#C9A962] font-bold text-lg flex items-center gap-2">
                        Ürünleri Gör
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Category Info */}
                  <div className="p-6 flex flex-col justify-center items-center h-[136px]">
                    <h3 className="text-white font-bold text-2xl text-center group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#C9A962] group-hover:to-[#E6C888] group-hover:bg-clip-text transition-all duration-300">
                      {category.name}
                    </h3>
                    <p className="text-gray-400 text-sm mt-2">Kategoriye git</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* PRODUCTS GRID */
          filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
              {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                data-testid={`product-card-${product.id}`}
                className="group relative"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#C9A962] via-[#E6C888] to-[#C9A962] rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 group-hover:animate-pulse" />
                
                {/* Main Card */}
                <div className="relative bg-gradient-to-br from-[#1C1C1C] to-black rounded-3xl overflow-hidden border border-gray-800 group-hover:border-[#C9A962] transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-3 shadow-2xl group-hover:shadow-[#C9A962]/30">
                  {/* Product Image */}
                  <Link to={`/products/${product.id}`} className="block">
                    <div className="relative h-80 overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
                      {product.image_urls && product.image_urls.length > 0 ? (
                        <img
                          src={product.image_urls[0]}
                          alt={product.product_name}
                          className="w-full h-full object-cover group-hover:scale-125 group-hover:rotate-2 transition-all duration-700"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-20 h-20 text-gray-700" />
                        </div>
                      )}
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                      
                      {/* BOZ PLUS Badge */}
                      {product.boz_plus_price && (
                        <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/90 backdrop-blur-sm rounded-full border border-purple-400 shadow-lg shadow-purple-500/50 animate-pulse">
                          <Crown className="w-4 h-4 text-purple-200 fill-purple-200" />
                          <span className="text-xs font-bold text-white">PLUS</span>
                        </div>
                      )}

                      {/* Quick View Hint */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-black/80 backdrop-blur-sm px-6 py-3 rounded-full border border-[#C9A962] text-[#C9A962] font-semibold">
                          Detayları Gör
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-6 space-y-4">
                    {/* Brand Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="px-3 py-1 bg-[#C9A962]/10 border border-[#C9A962]/30 rounded-lg">
                        <span className="text-[#C9A962] font-medium text-sm">{product.category}</span>
                      </div>
                      <span className="text-xs text-gray-500 italic">by Boz Concept</span>
                    </div>

                    {/* Product Name */}
                    <Link to={`/products/${product.id}`}>
                      <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#C9A962] group-hover:to-[#E6C888] group-hover:bg-clip-text transition-all duration-300 leading-tight min-h-[56px]">
                        {product.product_name}
                      </h3>
                    </Link>

                    {/* Pricing */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        {product.discounted_price ? (
                          <>
                            <span className="text-2xl font-bold bg-gradient-to-r from-[#C9A962] to-[#E6C888] bg-clip-text text-transparent">
                              {product.discounted_price} ₺
                            </span>
                            <span className="text-base text-gray-500 line-through">{product.price} ₺</span>
                          </>
                        ) : (
                          <span className="text-2xl font-bold bg-gradient-to-r from-[#C9A962] to-[#E6C888] bg-clip-text text-transparent">
                            {product.price} ₺
                          </span>
                        )}
                      </div>

                      {/* BOZ PLUS Price */}
                      {product.boz_plus_price && (
                        <div className="bg-gradient-to-r from-purple-900/30 to-purple-800/30 border border-purple-500/50 rounded-xl px-3 py-2 backdrop-blur-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Crown className="w-4 h-4 text-purple-400" />
                              <span className="text-xs text-purple-300 font-medium">BOZ PLUS</span>
                            </div>
                            <span className="text-base font-bold text-purple-400">{product.boz_plus_price} ₺</span>
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
                      className="w-full bg-gradient-to-r from-[#C9A962] via-[#E6C888] to-[#C9A962] hover:from-[#E6C888] hover:via-[#C9A962] hover:to-[#E6C888] text-black font-bold py-4 rounded-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#C9A962]/60 active:scale-95 flex items-center justify-center gap-2 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <ShoppingCart className="w-5 h-5 group-hover:scale-125 transition-transform duration-300" />
                      <span className="text-base tracking-wide">
                        {addingToCart[product.id] ? 'Ekleniyor...' : 'Sepete Ekle'}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32">
            <div className="inline-block p-8 bg-[#1C1C1C] rounded-3xl border border-gray-800">
              <Package className="w-24 h-24 text-gray-600 mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-gray-300 mb-3">Ürün Bulunamadı</h3>
              <p className="text-gray-500 text-lg">Arama kriterlerinize uygun ürün bulunamadı</p>
            </div>
          </div>
        )
        )}
      </div>
    </div>
  );
};

export default Products;
