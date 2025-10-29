import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const { getAuthHeader } = useAdminAuth();

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/orders`, {
        headers: getAuthHeader()
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Siparişler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${API_URL}/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        { headers: getAuthHeader() }
      );
      
      toast.success('Sipariş durumu güncellendi');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Durum güncellenemedi');
    }
  };

  const toggleOrderExpand = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const statusOptions = [
    { value: 'pending', label: 'Hazırlanıyor', color: 'bg-yellow-500/20 text-yellow-400' },
    { value: 'preparing', label: 'Paketleniyor', color: 'bg-blue-500/20 text-blue-400' },
    { value: 'shipped', label: 'Kargoya Verildi', color: 'bg-purple-500/20 text-purple-400' },
    { value: 'in_transit', label: 'Yolda', color: 'bg-orange-500/20 text-orange-400' },
    { value: 'delivered', label: 'Teslim Edildi', color: 'bg-green-500/20 text-green-400' }
  ];

  const getStatusBadge = (status) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A962]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Siparişler</h1>
        <p className="text-gray-400 mt-1">Toplam {orders.length} sipariş</p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedOrders.has(order.id);
          const statusBadge = getStatusBadge(order.status);

          return (
            <div
              key={order.id}
              className="bg-[#1C1C1C] border border-gray-800 rounded-2xl overflow-hidden
                hover:border-[#C9A962]/50 transition-all duration-200"
            >
              {/* Order Header */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-bold text-white">
                        {order.user?.full_name || 'Kullanıcı'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{order.user?.email}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{new Date(order.created_at).toLocaleDateString('tr-TR')}</span>
                        <span>{new Date(order.created_at).toLocaleTimeString('tr-TR')}</span>
                      </div>
                      <span>•</span>
                      <span>{order.items?.length || 0} ürün</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right mr-4">
                      <p className="text-2xl font-bold text-[#C9A962]">
                        ₺{order.total.toFixed(2)}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleOrderExpand(order.id)}
                      className="p-2 hover:bg-[#0A0A0A] rounded-lg transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="text-white" size={24} />
                      ) : (
                        <ChevronDown className="text-white" size={24} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Status Selector */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Sipariş Durumu Güncelle
                  </label>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    className="px-4 py-2 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white
                      focus:outline-none focus:ring-2 focus:ring-[#C9A962] focus:border-transparent"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Order Details (Expandable) */}
              {isExpanded && (
                <div className="border-t border-gray-800 p-6 bg-[#0A0A0A]/50">
                  {/* Shipping Address */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Teslimat Adresi</h4>
                    <p className="text-white">{order.shipping_address}</p>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-4">Sipariş İçeriği</h4>
                    <div className="space-y-3">
                      {order.items?.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-4 bg-[#1C1C1C] p-4 rounded-lg"
                        >
                          {item.product && (
                            <>
                              <img
                                src={item.product.image_urls?.[0] || '/placeholder.png'}
                                alt={item.product.product_name}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <p className="text-white font-medium">
                                  {item.product.product_name}
                                </p>
                                <p className="text-gray-400 text-sm">
                                  {item.product.category}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-white font-semibold">
                                  {item.quantity} x ₺{item.product.price.toFixed(2)}
                                </p>
                                <p className="text-[#C9A962] font-bold">
                                  ₺{(item.quantity * item.product.price).toFixed(2)}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="bg-[#1C1C1C] border border-gray-800 rounded-2xl p-12 text-center">
            <p className="text-gray-400">Henüz sipariş bulunmuyor</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
