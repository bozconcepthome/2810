import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, CreditCard, Package, CheckCircle, AlertCircle, Crown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';
import axios from 'axios';
import { turkeyData } from '../data/turkeyData';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Checkout = () => {
  const { user, token } = useAuth();
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.full_name || '',
    phone: '',
    il: '',
    ilce: '',
    mahalle: '',
    address: '',
    notes: ''
  });

  const [ilceList, setIlceList] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user || !cart || cart.length === 0) {
      navigate('/cart');
    }
  }, [user, cart, navigate]);

  useEffect(() => {
    if (shippingInfo.il) {
      setIlceList(turkeyData[shippingInfo.il] || []);
      setShippingInfo(prev => ({ ...prev, ilce: '', mahalle: '' }));
    }
  }, [shippingInfo.il]);

  const validateShipping = () => {
    const newErrors = {};
    if (!shippingInfo.fullName.trim()) newErrors.fullName = 'Ad Soyad zorunludur';
    if (!shippingInfo.phone.trim()) newErrors.phone = 'Telefon zorunludur';
    if (!shippingInfo.il) newErrors.il = 'İl seçimi zorunludur';
    if (!shippingInfo.ilce) newErrors.ilce = 'İlçe seçimi zorunludur';
    if (!shippingInfo.mahalle.trim()) newErrors.mahalle = 'Mahalle zorunludur';
    if (!shippingInfo.address.trim()) newErrors.address = 'Açık adres zorunludur';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (validateShipping()) {
        setStep(2);
      } else {
        toast.error('Lütfen tüm zorunlu alanları doldurun');
      }
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateShipping()) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        shipping_address: `${shippingInfo.fullName}, ${shippingInfo.phone}, ${shippingInfo.mahalle}, ${shippingInfo.ilce}, ${shippingInfo.il}, ${shippingInfo.address}${shippingInfo.notes ? `, Not: ${shippingInfo.notes}` : ''}`,
        payment_method: 'Kredi Kartı',
        shipping_cost: shippingCost,
        final_total: finalTotal
      };

      await axios.post(`${API_URL}/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await clearCart();
      toast.success('Siparişiniz başarıyla oluşturuldu!');
      navigate('/orders');
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Sipariş oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.length === 0) {
    return null;
  }

  const total = getCartTotal();
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Kargo hesaplaması
  const MINIMUM_ORDER = 500; // 500 TL ve üzeri bedava kargo
  const SHIPPING_COST = 100; // Kargo ücreti (500 TL altı için)
  const isBozPlus = user?.is_boz_plus || false;
  
  const calculateShipping = () => {
    if (isBozPlus) return 0; // BOZ PLUS üyeleri için her zaman bedava
    if (total >= MINIMUM_ORDER) return 0; // 500 TL ve üzeri bedava
    return SHIPPING_COST; // 500 TL altı için 100 TL
  };
  
  const shippingCost = calculateShipping();
  const finalTotal = total + shippingCost;
  const isMinimumMet = total >= MINIMUM_ORDER;

  return (
    <div className="min-h-screen pt-24 pb-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Ödeme
          </h1>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#C9A962]' : 'text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#C9A962]' : 'bg-gray-800'}`}>
                {step > 1 ? <CheckCircle className="w-5 h-5 text-black" /> : <span className="text-sm font-bold">1</span>}
              </div>
              <span className="text-sm font-semibold">Teslimat</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-800" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#C9A962]' : 'text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#C9A962]' : 'bg-gray-800'}`}>
                <span className="text-sm font-bold text-black">2</span>
              </div>
              <span className="text-sm font-semibold">Ödeme</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {step === 1 && (
              <div className="bg-gradient-to-br from-[#1C1C1C] to-[#0A0A0A] border border-gray-800 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-6 h-6 text-[#C9A962]" />
                  <h2 className="text-2xl font-bold text-white">Teslimat Bilgileri</h2>
                </div>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Ad Soyad <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.fullName}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                        className={`w-full px-4 py-3 bg-gray-900 border ${errors.fullName ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:border-[#C9A962]`}
                        placeholder="Adınız ve soyadınız"
                      />
                      {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Telefon <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                        className={`w-full px-4 py-3 bg-gray-900 border ${errors.phone ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:border-[#C9A962]`}
                        placeholder="05XX XXX XX XX"
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        İl <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={shippingInfo.il}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, il: e.target.value })}
                        className={`w-full px-4 py-3 bg-gray-900 border ${errors.il ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:border-[#C9A962]`}
                      >
                        <option value="">İl Seçin</option>
                        {Object.keys(turkeyData).map(il => (
                          <option key={il} value={il}>{il}</option>
                        ))}
                      </select>
                      {errors.il && <p className="text-red-500 text-sm mt-1">{errors.il}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        İlçe <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={shippingInfo.ilce}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, ilce: e.target.value })}
                        disabled={!shippingInfo.il}
                        className={`w-full px-4 py-3 bg-gray-900 border ${errors.ilce ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:border-[#C9A962] disabled:opacity-50`}
                      >
                        <option value="">İlçe Seçin</option>
                        {ilceList.map(ilce => (
                          <option key={ilce} value={ilce}>{ilce}</option>
                        ))}
                      </select>
                      {errors.ilce && <p className="text-red-500 text-sm mt-1">{errors.ilce}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Mahalle <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.mahalle}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, mahalle: e.target.value })}
                        className={`w-full px-4 py-3 bg-gray-900 border ${errors.mahalle ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:border-[#C9A962]`}
                        placeholder="Mahalle adını yazın"
                      />
                      {errors.mahalle && <p className="text-red-500 text-sm mt-1">{errors.mahalle}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Açık Adres <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                      rows={3}
                      className={`w-full px-4 py-3 bg-gray-900 border ${errors.address ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:border-[#C9A962] resize-none`}
                      placeholder="Sokak, cadde, bina no, daire no vb."
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Sipariş Notu (Opsiyonel)
                    </label>
                    <textarea
                      value={shippingInfo.notes}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, notes: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#C9A962] resize-none"
                      placeholder="Teslimat hakkında özel notlarınız..."
                    />
                  </div>

                  <Button
                    onClick={handleNextStep}
                    className="w-full bg-gradient-to-r from-[#C9A962] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#C9A962] text-black font-bold py-4 text-lg rounded-xl"
                  >
                    Ödeme Adımına Geç
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-[#1C1C1C] to-[#0A0A0A] border border-gray-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Teslimat Adresi</h3>
                    <button
                      onClick={() => setStep(1)}
                      className="text-[#C9A962] hover:text-[#D4AF37] text-sm font-semibold"
                    >
                      Düzenle
                    </button>
                  </div>
                  <div className="text-gray-300 space-y-1">
                    <p className="font-semibold">{shippingInfo.fullName}</p>
                    <p>{shippingInfo.phone}</p>
                    <p>{shippingInfo.mahalle}, {shippingInfo.ilce}, {shippingInfo.il}</p>
                    <p>{shippingInfo.address}</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1C1C1C] to-[#0A0A0A] border border-gray-800 rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="w-6 h-6 text-[#C9A962]" />
                    <h2 className="text-2xl font-bold text-white">Ödeme Yöntemi</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="p-6 bg-gray-900 border-2 border-[#C9A962] rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <CreditCard className="w-6 h-6 text-[#C9A962]" />
                        <h3 className="text-lg font-bold text-white">Kredi Kartı</h3>
                      </div>
                      <p className="text-gray-400 text-sm">
                        Güvenli ödeme ile kredi kartınızla ödeyin.
                      </p>
                      <div className="mt-4 flex items-center gap-2">
                        <div className="px-3 py-1 bg-gray-800 rounded text-xs text-gray-300">Visa</div>
                        <div className="px-3 py-1 bg-gray-800 rounded text-xs text-gray-300">Mastercard</div>
                        <div className="px-3 py-1 bg-gray-800 rounded text-xs text-gray-300">Troy</div>
                      </div>
                    </div>

                    <Button
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-[#C9A962] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#C9A962] text-black font-bold py-4 text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'İşleniyor...' : 'Siparişi Onayla'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-gradient-to-br from-[#1C1C1C] to-[#0A0A0A] border-2 border-[#C9A962]/30 rounded-2xl p-6 shadow-[0_0_50px_rgba(201,169,98,0.1)]">
                <h3 className="text-xl font-bold text-white mb-4">Sipariş Özeti</h3>

                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.product_id} className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0">
                        {item.image_url && (
                          <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white line-clamp-1">{item.product_name}</p>
                        <p className="text-xs text-gray-400">Adet: {item.quantity}</p>
                        <p className="text-sm font-semibold text-[#C9A962]">{item.subtotal.toFixed(2)} ₺</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t border-gray-800 pt-4">
                  <div className="flex justify-between text-gray-400">
                    <span>Ara Toplam</span>
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
                          <p className="text-xs text-purple-300 font-semibold mb-1">
                            BOZ PLUS üyeleri her siparişte kargo ödemez!
                          </p>
                          <p className="text-xs text-purple-400/80">
                            {shippingCost > 0 
                              ? `Bu siparişte ${shippingCost.toFixed(2)} ₺ kargo tasarrufu yapın!`
                              : 'Her siparişinizde kargo bedava olsun!'
                            }
                          </p>
                        </div>
                      </div>
                      <Link
                        to="/boz-plus"
                        className="block w-full text-center py-2 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#8B5CF6] text-white text-xs font-bold rounded-lg transition-all"
                      >
                        BOZ PLUS'a Katıl →
                      </Link>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-800 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-white">Toplam</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-[#C9A962] to-[#D4AF37] bg-clip-text text-transparent">
                        {finalTotal.toFixed(2)} ₺
                      </span>
                    </div>
                  </div>
                </div>

                {isBozPlus && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-purple-900/20 to-violet-900/20 border border-purple-500/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-semibold text-purple-300">BOZ PLUS - Kargo Bedava! 🎉</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
