import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ChevronLeft, ChevronRight, Crown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { trackPageView, trackAddToCart } from '../utils/analytics';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

// Motivasyonel mesajlar
const happyMessages = [
  "🎉 Harika seçim! Eviniz daha da güzel olacak!",
  "✨ Mükemmel bir tercih! Tarzınız çok güzel!",
  "🌟 Bu ürün sizin için biçilmiş kaftan!",
  "💫 Evinize değer katıyorsunuz! Tebrikler!",
  "🎊 Süper! Bu ürün evinizi muhteşem yapacak!",
  "🏆 Fevkalade zevkiniz var! Harika seçim!",
  "🎁 Ne güzel bir tercih! Mutluluğunuz yakın!",
  "💝 Tarzınız mükemmel! Eviniz daha şık olacak!",
  "🌈 Hayalinizdeki ev bir adım daha yakın!",
  "⭐ Eviniz sizin sanat eseriniz olacak!",
];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/${id}`);
      setProduct(response.data);
      trackPageView('Product Detail', { product_id: id, product_name: response.data.product_name });
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Ürün bulunamadı');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!token) {
      toast.error('Sepete eklemek için giriş yapmalısınız');
      navigate('/auth');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/cart/add`,
        {
          product_id: product.id,
          quantity: quantity,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Track add to cart event
      trackAddToCart(product, quantity);
      
      // Havai fişek patlatma animasyonu
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Sol taraftan
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#C9A962', '#E6C888', '#A78D4E', '#D4AF37', '#FFD700']
        });
        
        // Sağ taraftan
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#C9A962', '#E6C888', '#A78D4E', '#D4AF37', '#FFD700']
        });
      }, 250);

      // Random motivasyonel mesaj
      const randomMessage = happyMessages[Math.floor(Math.random() * happyMessages.length)];
      toast.success(randomMessage, {
        duration: 4000,
        style: {
          background: 'linear-gradient(135deg, #C9A962 0%, #E6C888 100%)',
          color: '#0A0A0A',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px 20px',
          border: '2px solid #D4AF37',
        }
      });
      
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Sepete eklenirken hata oluştu');
    }
  };

  const nextImage = () => {
    if (product && product.image_urls) {
      setCurrentImageIndex((prev) => (prev + 1) % product.image_urls.length);
    }
  };

  const prevImage = () => {
    if (product && product.image_urls) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? product.image_urls.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A962]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-black">
        <p className="text-gray-400 text-lg">Ürün bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-black" data-testid="product-detail-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-[#1C1C1C] rounded-2xl overflow-hidden border border-gray-800">
              {product.image_urls && product.image_urls.length > 0 ? (
                <>
                  <img
                    src={product.image_urls[currentImageIndex]}
                    alt={product.product_name}
                    className="w-full h-full object-cover"
                    data-testid="product-main-image"
                  />
                  {product.image_urls.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        data-testid="prev-image-button"
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/80 hover:bg-black text-white p-3 rounded-full shadow-lg transition"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        data-testid="next-image-button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/80 hover:bg-black text-white p-3 rounded-full shadow-lg transition"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  Görsel yok
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.image_urls && product.image_urls.length > 1 && (
              <div className="grid grid-cols-4 gap-2" data-testid="thumbnail-images">
                {product.image_urls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    data-testid={`thumbnail-${index}`}
                    className={`aspect-square bg-[#1C1C1C] rounded-lg overflow-hidden border-2 transition ${
                      currentImageIndex === index
                        ? 'border-[#C9A962]'
                        : 'border-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <span className="text-sm text-[#C9A962] uppercase tracking-wide font-semibold">
                {product.category}
              </span>
              <h1
                className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-4"
                style={{ fontFamily: 'Playfair Display, serif' }}
                data-testid="product-name"
              >
                {product.product_name}
              </h1>
              <div className="flex flex-col gap-4">
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-bold text-[#C9A962]" data-testid="product-price">
                    {product.discounted_price || product.price} ₺
                  </span>
                  <span className="text-lg text-green-500 font-medium px-3 py-1 bg-green-500/10 rounded-full">
                    {product.stock_status}
                  </span>
                </div>
                
                {/* BOZ PLUS Price - Everyone can see */}
                {product.boz_plus_price && (
                  <div className="bg-gradient-to-r from-purple-900/20 via-violet-900/20 to-purple-900/20 border-2 border-purple-500 rounded-xl p-4 shadow-[0_0_25px_rgba(255,215,0,0.3)] animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Crown className="w-8 h-8 text-[#FFD700] fill-[#FFD700] animate-bounce" />
                        <div>
                          <p className="text-sm bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent font-bold">
                            {user?.is_boz_plus ? '👑 BOZ PLUS Özel Fiyatınız' : '🔥 BOZ PLUS Üye Fiyatı'}
                          </p>
                          <p className="text-3xl font-extrabold bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent">
                            {product.boz_plus_price} ₺
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[#FFD700] font-bold">Tasarruf</p>
                        <p className="text-xl font-bold text-[#00FF00] animate-pulse">
                          {((product.discounted_price || product.price) - product.boz_plus_price).toFixed(2)} ₺
                        </p>
                      </div>
                    </div>
                    {!user?.is_boz_plus && (
                      <div className="mt-3 pt-3 border-t border-purple-500/30">
                        <p className="text-sm text-white">
                          💡 Bu fiyattan alışveriş yapmak için <a href="/boz-plus" className="bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent hover:underline font-extrabold">BOZ PLUS</a> üyesi olun
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="bg-[#1C1C1C] rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-3">Ürün Açıklaması</h3>
                <p className="text-gray-300 leading-relaxed text-base" data-testid="product-description">
                  {product.description}
                </p>
              </div>
            )}

            {/* Specifications */}
            <div className="bg-[#1C1C1C] rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Ürün Özellikleri</h3>
              <div className="space-y-3">
                {product.dimensions && (
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400 font-medium">Ölçüler:</span>
                    <span className="font-medium text-white">{product.dimensions}</span>
                  </div>
                )}
                {product.materials && (
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400 font-medium">Malzeme:</span>
                    <span className="font-medium text-white">{product.materials}</span>
                  </div>
                )}
                {product.colors && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-400 font-medium">Renk:</span>
                    <span className="font-medium text-white">{product.colors}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4 bg-[#1C1C1C] rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-4">
                <label className="text-white font-semibold text-base">Adet:</label>
                <div className="flex items-center border-2 border-gray-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    data-testid="decrease-quantity-button"
                    className="px-5 py-3 bg-black hover:bg-gray-900 text-white transition font-medium"
                  >
                    -
                  </button>
                  <span className="px-8 py-3 bg-[#1C1C1C] text-white font-bold text-lg" data-testid="quantity-display">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    data-testid="increase-quantity-button"
                    className="px-5 py-3 bg-black hover:bg-gray-900 text-white transition font-medium"
                  >
                    +
                  </button>
                </div>
              </div>

              <Button
                onClick={addToCart}
                data-testid="add-to-cart-button"
                size="lg"
                className="w-full bg-gradient-to-r from-[#C9A962] to-[#E6C888] hover:from-[#A78D4E] hover:to-[#C9A962] text-black font-bold py-6 text-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Sepete Ekle
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;