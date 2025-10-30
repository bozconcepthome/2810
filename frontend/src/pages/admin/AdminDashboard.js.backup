import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { Users, Package, ShoppingCart, DollarSign, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getAuthHeader } = useAdminAuth();

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/stats`, {
        headers: getAuthHeader()
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats ? [
    {
      label: 'Toplam Satış',
      value: `₺${stats.total_sales.toFixed(2)}`,
      icon: DollarSign,
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      label: 'Toplam Sipariş',
      value: stats.total_orders,
      icon: ShoppingCart,
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      label: 'Toplam Ürün',
      value: stats.total_products,
      icon: Package,
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      label: 'Toplam Kullanıcı',
      value: stats.total_users,
      icon: Users,
      gradient: 'from-orange-500 to-red-600'
    },
  ] : [];

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Hazırlanıyor', color: 'bg-yellow-500/20 text-yellow-400' },
      preparing: { label: 'Paketleniyor', color: 'bg-blue-500/20 text-blue-400' },
      shipped: { label: 'Kargoya Verildi', color: 'bg-purple-500/20 text-purple-400' },
      in_transit: { label: 'Yolda', color: 'bg-orange-500/20 text-orange-400' },
      delivered: { label: 'Teslim Edildi', color: 'bg-green-500/20 text-green-400' }
    };
    return statusConfig[status] || statusConfig.pending;
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
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-[#1C1C1C] border border-gray-800 rounded-2xl p-6
                hover:border-[#C9A962]/50 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-r ${stat.gradient} rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Order Status Breakdown */}
      {stats?.order_status_breakdown && (
        <div className="bg-[#1C1C1C] border border-gray-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Sipariş Durumları</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(stats.order_status_breakdown).map(([status, count]) => {
              const badge = getStatusBadge(status);
              return (
                <div key={status} className="text-center">
                  <div className={`${badge.color} rounded-lg py-3 px-4`}>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs mt-1">{badge.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {stats?.recent_orders && stats.recent_orders.length > 0 && (
        <div className="bg-[#1C1C1C] border border-gray-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Son Siparişler</h3>
          <div className="space-y-4">
            {stats.recent_orders.map((order) => {
              const badge = getStatusBadge(order.status);
              return (
                <div
                  key={order.id}
                  className="bg-[#0A0A0A] border border-gray-800 rounded-lg p-4
                    hover:border-[#C9A962]/50 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <p className="text-white font-medium">
                          {order.user?.full_name || 'Kullanıcı'}
                        </p>
                        <span className={`px-3 py-1 rounded-full text-xs ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{order.user?.email}</p>
                      <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                        <Clock size={14} />
                        <span>{new Date(order.created_at).toLocaleDateString('tr-TR')}</span>
                        <span>{new Date(order.created_at).toLocaleTimeString('tr-TR')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#C9A962]">
                        ₺{order.total.toFixed(2)}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        {order.items?.length || 0} ürün
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
