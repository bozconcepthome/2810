import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Crown, Package } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Cart = () => {
  const { user } = useAuth();
  const { cart, loading, updateCartItem, removeFromCart, getCartTotal } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleUpdateQuantity = async (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) {
      await removeFromCart(productId);
    } else {
      await updateCartItem(productId, newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#C9A962] border-t-transparent" />
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Sepetiniz Boş</h2>
            <p className="text-gray-400 mb-8">
              Alışverişe başlamak için ürünlerimize göz atın
            </p>
            <Link to="/products">
              <Button className="bg-gradient-to-r from-[#C9A962] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#C9A962] text-black font-bold px-8 py-6 text-lg">
                Ürünleri Keşfet
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const total = getCartTotal();
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Kargo hesaplaması
  const MINIMUM_ORDER = 500;
  const SHIPPING_COST = 100;
  const isBozPlus = user?.is_boz_plus || false;
  
  const calculateShipping = () => {
    if (isBozPlus) return 0;
    if (total >= MINIMUM_ORDER) return 0;
    return SHIPPING_COST;
  };
  
  const shippingCost = calculateShipping();
  const finalTotal = total + shippingCost;
  const isMinimumMet = total >= MINIMUM_ORDER;

  return (
    <div className="min-h-screen pt-24 pb-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingBag className="w-8 h-8 text-[#C9A962]" />
            <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              Sepetim
            </h1>
          </div>
          <p className="text-gray-400">
            {itemCount} ürün • Toplam: <span className="text-[#C9A962] font-bold">{total.toFixed(2)} ₺</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.product_id}
                className="bg-gradient-to-br from-[#1C1C1C] to-[#0A0A0A] border border-gray-800 rounded-2xl p-6 hover:border-[#C9A962]/50 transition-all duration-300"
              >
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="relative flex-shrink-0">
                    <div className="w-32 h-32 rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-600" />
                        </div>
                      )}
                    </div>
                    {item.boz_plus_price && user?.is_boz_plus && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] rounded-full p-1.5">
                        <Crown className="w-4 h-4 text-white fill-white" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.product_id}`}
                      className="text-lg font-semibold text-white hover:text-[#C9A962] transition-colors line-clamp-2 mb-2 block"
                    >
                      {item.product_name}
                    </Link>

                    {/* Price Display */}
                    <div className="space-y-2 mb-4">
                      {user?.is_boz_plus && item.boz_plus_price ? (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Crown className="w-4 h-4 text-purple-400" />
                            <span className="text-2xl font-bold bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent">
                              {item.boz_plus_price} ₺
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 line-through">
                            {item.discounted_price || item.price} ₺
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-white">
                            {item.discounted_price || item.price} ₺
                          </span>
                          {item.discounted_price && (
                            <span className="text-sm text-gray-500 line-through">
                              {item.price} ₺
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleUpdateQuantity(item.product_id, item.quantity, -1)}
                          className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-[#C9A962] text-white transition-colors flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-lg font-semibold text-white w-12 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product_id, item.quantity, 1)}
                          className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-[#C9A962] text-white transition-colors flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Subtotal & Remove */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Ara Toplam</p>
                          <p className="text-xl font-bold text-[#C9A962]">
                            {item.subtotal.toFixed(2)} ₺
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="p-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-gradient-to-br from-[#1C1C1C] to-[#0A0A0A] border-2 border-[#C9A962]/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(201,169,98,0.1)]">
                <h3 className="text-2xl font-bold text-white mb-6">Sipariş Özeti</h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-400">
                    <span>Ara Toplam ({itemCount} ürün)</span>
                    <span className="text-white font-semibold">{total.toFixed(2)} ₺</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Kargo</span>
                    {isBozPlus ? (
                      <div className="flex items-center gap-1">
                        <Crown className="w-3 h-3 text-purple-400" />
                        <span className="text-purple-400 font-semibold">Bedava</span>
                      </div>
                    ) : shippingCost === 0 ? (
                      <span className="text-green-400 font-semibold">Bedava</span>
                    ) : (
                      <span className="text-white font-semibold">{shippingCost.toFixed(2)} ₺</span>
                    )}
                  </div>
                  
                  {/* 500 TL altı uyarısı */}
                  {!isMinimumMet && !isBozPlus && (
                    <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg space-y-2">
                      <p className="text-xs text-orange-400">
                        💰 {(MINIMUM_ORDER - total).toFixed(2)} ₺ daha alışveriş yapın, kargo bedava olsun!
                      </p>
                      <Link
                        to="/products"
                        className="block w-full text-center py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-bold rounded-lg transition-all"
                      >
                        Alışverişe Devam Et →
                      </Link>
                    </div>
                  )}
                  
                  {/* BOZ PLUS teşvik mesajı */}
                  {!isBozPlus && (
                    <div className="p-3 bg-gradient-to-r from-purple-900/20 to-violet-900/20 border border-purple-500/30 rounded-lg">
                      <div className="flex items-start gap-2 mb-2">
                        <Crown className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-purple-300 font-bold mb-1">
                            BOZ PLUS ile Kazanın! 👑
                          </p>
                          <ul className="text-xs text-purple-400/90 space-y-1 mb-2">
                            <li className="flex items-start gap-1">
                              <span className="text-purple-300 mt-0.5">•</span>
                              <span>Her siparişte <strong className="text-purple-300">kargo bedava</strong></span>
                            </li>
                            <li className="flex items-start gap-1">
                              <span className="text-purple-300 mt-0.5">•</span>
                              <span>Tüm ürünlerde <strong className="text-purple-300">özel indirimli fiyatlar</strong></span>
                            </li>
                            <li className="flex items-start gap-1">
                              <span className="text-purple-300 mt-0.5">•</span>
                              <span>Bu siparişte <strong className="text-purple-300">{shippingCost > 0 ? `${shippingCost.toFixed(0)} ₺` : '100 ₺+'}</strong> tasarruf!</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <Link
                        to="/boz-plus"
                        className="block w-full text-center py-2 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#8B5CF6] text-white text-xs font-bold rounded-lg transition-all"
                      >
                        Hemen BOZ PLUS Ol ve Kazanmaya Başla! →
                      </Link>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-800 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-white">Toplam</span>
                      <span className="text-3xl font-bold bg-gradient-to-r from-[#C9A962] to-[#D4AF37] bg-clip-text text-transparent">
                        {finalTotal.toFixed(2)} ₺
                      </span>
                    </div>
                  </div>
                </div>

                {isBozPlus && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/20 to-violet-900/20 border border-purple-500/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-semibold text-purple-300">BOZ PLUS - Kargo Bedava! 🎉</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-gradient-to-r from-[#C9A962] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#C9A962] text-black font-bold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Siparişi Tamamla
                  <ArrowRight className="w-5 h-5" />
                </Button>

                <Link
                  to="/products"
                  className="block text-center text-gray-400 hover:text-white transition-colors mt-4"
                >
                  Alışverişe Devam Et
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
