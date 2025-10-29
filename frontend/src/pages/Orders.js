import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

// Sipariş durumları ve açıklamaları
const ORDER_STATUSES = {
  'pending': {
    label: 'Hazırlanıyor',
    icon: Clock,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500',
    description: 'Siparişiniz hazırlanıyor',
    step: 1
  },
  'preparing': {
    label: 'Paketleniyor',
    icon: Package,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500',
    description: 'Ürünleriniz özenle paketleniyor',
    step: 2
  },
  'shipped': {
    label: 'Kargoya Verildi',
    icon: Truck,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500',
    description: 'Kargoya teslim edildi',
    step: 3
  },
  'in_transit': {
    label: 'Yolda',
    icon: MapPin,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500',
    description: 'Adresinize doğru yolda',
    step: 4
  },
  'delivered': {
    label: 'Teslim Edildi',
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500',
    description: '✨ Ürününüz teslim edildi! Evinize değer katsın, keyifle kullanın! 🏡',
    step: 5
  }
};

const Orders = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [products, setProducts] = useState({});

  useEffect(() => {
    if (!token) {
      navigate('/auth');
      return;
    }
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Siparişlere random durum ekle (demo için)
      const ordersWithStatus = response.data.map(order => ({
        ...order,
        status: order.status || getRandomStatus()
      }));
      
      setOrders(ordersWithStatus);

      // Ürün bilgilerini çek
      const productIds = [...new Set(ordersWithStatus.flatMap(o => o.items.map(i => i.product_id)))];
      const productPromises = productIds.map(id => 
        axios.get(`${API_URL}/products/${id}`).catch(() => null)
      );
      const productResponses = await Promise.all(productPromises);
      const productsMap = {};
      productResponses.forEach(res => {
        if (res && res.data) {
          productsMap[res.data.id] = res.data;
        }
      });
      setProducts(productsMap);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRandomStatus = () => {
    const statuses = ['pending', 'preparing', 'shipped', 'in_transit', 'delivered'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#C9A962] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-black" data-testid="orders-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A962]/10 rounded-full mb-6">
            <Package className="w-4 h-4 text-[#C9A962]" />
            <span className="text-sm font-semibold text-[#C9A962] uppercase tracking-wide">Siparişlerim</span>
          </div>
          <h1
            className="text-5xl sm:text-6xl font-bold text-white mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Sipariş Takibi
          </h1>
          <p className="text-gray-400 text-lg">Siparişlerinizi buradan takip edebilirsiniz</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-[#1C1C1C] rounded-3xl border border-gray-800" data-testid="no-orders-message">
            <Package className="w-20 h-20 text-gray-700 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-white mb-3">Henüz sipariş vermediniz</h3>
            <p className="text-gray-400 mb-8">Alışverişe başlayarak ilk siparişinizi oluşturun!</p>
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#C9A962] to-[#E6C888] hover:from-[#A78D4E] hover:to-[#C9A962] text-black font-semibold rounded-full transition-all duration-300 hover:scale-105"
            >
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="space-y-6" data-testid="orders-list">
            {orders.map((order) => {
              const statusInfo = ORDER_STATUSES[order.status] || ORDER_STATUSES['pending'];
              const StatusIcon = statusInfo.icon;
              const isExpanded = expandedOrder === order.id;

              return (
                <div
                  key={order.id}
                  data-testid={`order-${order.id}`}
                  className="bg-[#1C1C1C] rounded-3xl overflow-hidden border border-gray-800 hover:border-[#C9A962]/50 transition-all duration-300"
                >
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-800">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl ${statusInfo.bgColor}`}>
                          <StatusIcon className={`w-8 h-8 ${statusInfo.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-white">
                              Sipariş #{order.id.substring(0, 8)}
                            </h3>
                            <span className={`px-4 py-1 ${statusInfo.bgColor} ${statusInfo.color} rounded-full text-sm font-semibold border ${statusInfo.borderColor}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">
                            {new Date(order.created_at).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-400 mb-1">Toplam Tutar</p>
                          <p className="text-2xl font-bold text-[#C9A962]">{order.total.toFixed(2)} ₺</p>
                        </div>
                        <button
                          onClick={() => toggleOrderDetails(order.id)}
                          className="p-2 hover:bg-gray-800 rounded-full transition"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-6 h-6 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-6 h-6 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Progress Timeline */}
                  <div className="p-6 bg-black/20">
                    <div className="relative">
                      {/* Progress Bar */}
                      <div className="absolute top-6 left-0 right-0 h-1 bg-gray-800">
                        <div 
                          className="h-full bg-gradient-to-r from-[#C9A962] to-[#E6C888] transition-all duration-500"
                          style={{ width: `${(statusInfo.step / 5) * 100}%` }}
                        />
                      </div>

                      {/* Steps */}
                      <div className="relative flex justify-between">
                        {Object.entries(ORDER_STATUSES).map(([key, status]) => {
                          const StepIcon = status.icon;
                          const isActive = status.step <= statusInfo.step;
                          const isCurrent = status.step === statusInfo.step;

                          return (
                            <div key={key} className="flex flex-col items-center">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                isActive 
                                  ? `${status.bgColor} ${status.borderColor}` 
                                  : 'bg-gray-900 border-gray-800'
                              } ${isCurrent ? 'scale-110 shadow-lg' : ''}`}>
                                <StepIcon className={`w-6 h-6 ${isActive ? status.color : 'text-gray-700'}`} />
                              </div>
                              <p className={`mt-3 text-xs font-medium text-center max-w-[80px] ${
                                isActive ? 'text-white' : 'text-gray-600'
                              }`}>
                                {status.label}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Current Status Description */}
                    <div className="mt-8 p-4 bg-[#1C1C1C] rounded-xl border border-gray-800">
                      <div className="flex items-center gap-3">
                        <MapPin className={`w-5 h-5 ${statusInfo.color}`} />
                        <div>
                          <p className="text-white font-semibold">{statusInfo.description}</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {order.status === 'delivered' 
                              ? 'Güzel günlerde kullanın! ✨' 
                              : 'Siparişiniz güncellendiğinde sizi bilgilendireceğiz'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Details (Expanded) */}
                  {isExpanded && (
                    <div className="p-6 border-t border-gray-800 space-y-6">
                      {/* Shipping Address */}
                      <div className="bg-black/20 rounded-xl p-4">
                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#C9A962]" />
                          Teslimat Adresi
                        </h4>
                        <p className="text-gray-400 text-sm">{order.shipping_address}</p>
                      </div>

                      {/* Products */}
                      <div>
                        <h4 className="text-white font-semibold mb-4">Sipariş İçeriği ({order.items.length} ürün)</h4>
                        <div className="space-y-3">
                          {order.items.map((item, idx) => {
                            const product = products[item.product_id];
                            return (
                              <div key={idx} className="flex gap-4 bg-black/20 rounded-xl p-4">
                                {product && product.image_urls && product.image_urls[0] ? (
                                  <img
                                    src={product.image_urls[0]}
                                    alt={product?.product_name}
                                    className="w-20 h-20 object-cover rounded-lg"
                                  />
                                ) : (
                                  <div className="w-20 h-20 bg-gray-800 rounded-lg flex items-center justify-center">
                                    <Package className="w-8 h-8 text-gray-600" />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <h5 className="text-white font-semibold mb-1">
                                    {product?.product_name || 'Ürün'}
                                  </h5>
                                  <p className="text-sm text-gray-400 mb-2">
                                    Adet: {item.quantity}
                                  </p>
                                  {product && (
                                    <p className="text-[#C9A962] font-bold">
                                      {(product.discounted_price || product.price) * item.quantity} ₺
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
