import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Orders = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20" data-testid="orders-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1
          className="text-4xl font-bold text-gray-900 mb-8"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Siparişlerim
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-20" data-testid="no-orders-message">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz sipariş vermediniz</h3>
            <p className="text-gray-600">Alışverişe başlayarak ilk siparişinizi oluşturun!</p>
          </div>
        ) : (
          <div className="space-y-6" data-testid="orders-list">
            {orders.map((order) => (
              <div
                key={order.id}
                data-testid={`order-${order.id}`}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Sipariş #{order.id.substring(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {order.status === 'pending' ? 'Hazırlanıyor' : order.status}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Teslimat Adresi:</strong> {order.shipping_address}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      <strong>Ürün Sayısı:</strong> {order.items.length}
                    </p>
                    <p className="text-xl font-bold text-amber-700">{order.total.toFixed(2)} ₺</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;