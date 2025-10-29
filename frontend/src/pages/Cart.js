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
                    <span className="text-green-400 font-semibold">Ücretsiz</span>
                  </div>
                  <div className="border-t border-gray-800 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-white">Toplam</span>
                      <span className="text-3xl font-bold bg-gradient-to-r from-[#C9A962] to-[#D4AF37] bg-clip-text text-transparent">
                        {total.toFixed(2)} ₺
                      </span>
                    </div>
                  </div>
                </div>

                {user?.is_boz_plus && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/20 to-violet-900/20 border border-purple-500/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-semibold text-purple-300">BOZ PLUS Avantajı</span>
                    </div>
                    <p className="text-xs text-purple-200">
                      Özel fiyatlardan faydalanıyorsunuz
                    </p>
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
