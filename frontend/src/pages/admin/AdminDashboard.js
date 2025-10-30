import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { 
  TrendingUp, Users, Package, ShoppingBag, DollarSign, 
  ShoppingCart, Crown, AlertTriangle, CheckCircle, Clock,
  ArrowUp, ArrowDown, Sparkles, BarChart3, PieChart
} from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [cartAnalytics, setCartAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getAuthHeader } = useAdminAuth();

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, cartRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/dashboard/stats`, { headers: getAuthHeader() }),
        axios.get(`${API_URL}/api/admin/cart-analytics`, { headers: getAuthHeader() })
      ]);
      
      setStats(statsRes.data);
      setCartAnalytics(cartRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Dashboard verileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-[#C9A962] border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 bg-[#C9A962] blur-xl opacity-30 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const { overview, recent_activity, users, inventory, cart_analytics, top_products } = stats;

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#C9A962] via-[#E6C888] to-[#D4AF37] bg-clip-text text-transparent animate-gradient mb-2">
            Dashboard
          </h1>
          <p className="text-gray-400 text-lg flex items-center gap-2">
            <Sparkles size={18} className="text-[#C9A962]" />
            Gerçek zamanlı istatistikler ve analitikler
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-xl">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-400 font-semibold">Canlı Veri</span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sales */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl opacity-20 group-hover:opacity-40 blur-xl transition-all duration-300" />
          <div className="relative bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 group-hover:border-green-500/50 rounded-2xl p-6 transition-all duration-300 group-hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <DollarSign className="text-green-500" size={28} />
              </div>
              <TrendingUp className="text-green-500" size={24} />
            </div>
            <p className="text-gray-400 text-sm font-semibold mb-1">Toplam Satış</p>
            <p className="text-3xl font-bold text-white mb-2">{overview.total_sales.toLocaleString('tr-TR')} ₺</p>
            <p className="text-green-400 text-sm flex items-center gap-1">
              <ArrowUp size={14} />
              {recent_activity.sales_last_7_days.toLocaleString('tr-TR')} ₺ (Son 7 gün)
            </p>
          </div>
        </div>

        {/* Total Users */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-20 group-hover:opacity-40 blur-xl transition-all duration-300" />
          <div className="relative bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 group-hover:border-blue-500/50 rounded-2xl p-6 transition-all duration-300 group-hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Users className="text-blue-500" size={28} />
              </div>
              <Crown className="text-purple-500" size={24} />
            </div>
            <p className="text-gray-400 text-sm font-semibold mb-1">Toplam Müşteri</p>
            <p className="text-3xl font-bold text-white mb-2">{overview.total_users}</p>
            <p className="text-purple-400 text-sm flex items-center gap-1">
              <Crown size={14} />
              {users.boz_plus_members} BOZ PLUS Üye
            </p>
          </div>
        </div>

        {/* Total Products */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl opacity-20 group-hover:opacity-40 blur-xl transition-all duration-300" />
          <div className="relative bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 group-hover:border-orange-500/50 rounded-2xl p-6 transition-all duration-300 group-hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <Package className="text-orange-500" size={28} />
              </div>
              <CheckCircle className="text-green-500" size={24} />
            </div>
            <p className="text-gray-400 text-sm font-semibold mb-1">Toplam Ürün</p>
            <p className="text-3xl font-bold text-white mb-2">{overview.total_products}</p>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-green-400">{inventory.in_stock} Stokta</span>
              <span className="text-red-400">{inventory.out_of_stock} Tükendi</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-20 group-hover:opacity-40 blur-xl transition-all duration-300" />
          <div className="relative bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 group-hover:border-purple-500/50 rounded-2xl p-6 transition-all duration-300 group-hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <ShoppingBag className="text-purple-500" size={28} />
              </div>
              <Clock className="text-yellow-500" size={24} />
            </div>
            <p className="text-gray-400 text-sm font-semibold mb-1">Toplam Sipariş</p>
            <p className="text-3xl font-bold text-white mb-2">{overview.total_orders}</p>
            <p className="text-yellow-400 text-sm">
              {recent_activity.orders_last_7_days} Yeni (Son 7 gün)
            </p>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Average Order Value */}
        <div className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-[#C9A962]/20 rounded-lg">
              <BarChart3 className="text-[#C9A962]" size={24} />
            </div>
            <h3 className="text-white font-semibold">Ortalama Sepet Değeri</h3>
          </div>
          <p className="text-4xl font-bold text-[#C9A962]">{overview.avg_order_value.toLocaleString('tr-TR')} ₺</p>
        </div>

        {/* Conversion Rate */}
        <div className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <TrendingUp className="text-blue-500" size={24} />
            </div>
            <h3 className="text-white font-semibold">Dönüşüm Oranı</h3>
          </div>
          <p className="text-4xl font-bold text-blue-500">{users.conversion_rate}%</p>
          <p className="text-gray-400 text-sm mt-2">{users.users_with_orders} / {overview.total_users} müşteri sipariş verdi</p>
        </div>

        {/* Active Carts */}
        <div className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <ShoppingCart className="text-yellow-500" size={24} />
            </div>
            <h3 className="text-white font-semibold">Aktif Sepetler</h3>
          </div>
          <p className="text-4xl font-bold text-yellow-500">{cart_analytics.users_with_items}</p>
          <p className="text-gray-400 text-sm mt-2">{cart_analytics.total_items_in_carts} ürün sepetlerde</p>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-[#C9A962] to-[#E6C888] rounded-xl">
            <TrendingUp size={28} className="text-black" />
          </div>
          En Çok Satan Ürünler
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {top_products && top_products.map((product, index) => (
            <div
              key={product.product_id}
              className="relative group"
            >
              {/* Rank Badge */}
              <div className="absolute -top-3 -left-3 z-10 w-10 h-10 bg-gradient-to-r from-[#C9A962] to-[#E6C888] rounded-full flex items-center justify-center shadow-lg shadow-[#C9A962]/50 border-2 border-black">
                <span className="text-black font-bold text-lg">#{index + 1}</span>
              </div>

              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#C9A962] to-[#E6C888] rounded-xl opacity-0 group-hover:opacity-100 blur transition-all duration-300" />
              
              <div className="relative bg-[#0A0A0A] border border-gray-700 rounded-xl overflow-hidden group-hover:border-[#C9A962] transition-all duration-300">
                {/* Product Image */}
                <div className="h-40 overflow-hidden bg-gradient-to-br from-gray-900 to-black">
                  {product.image_url ? (
                    <img 
                      src={product.image_url}
                      alt={product.product_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="text-gray-600" size={40} />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4 space-y-2">
                  <h3 className="text-white font-semibold text-sm line-clamp-2 min-h-[40px]">
                    {product.product_name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[#C9A962] font-bold">{product.price} ₺</span>
                    <span className="text-gray-400 text-xs">{product.total_sold} satış</span>
                  </div>
                  <div className="pt-2 border-t border-gray-700">
                    <p className="text-green-400 font-bold text-sm">
                      {product.revenue.toLocaleString('tr-TR')} ₺ gelir
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Added to Cart */}
        <div className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-xl">
              <ShoppingCart size={24} className="text-yellow-500" />
            </div>
            En Çok Sepete Eklenen
          </h2>
          
          <div className="space-y-3">
            {cartAnalytics && cartAnalytics.products.slice(0, 5).map((product, index) => (
              <div
                key={product.product_id}
                className="flex items-center gap-4 p-4 bg-black/50 border border-gray-700 rounded-xl hover:border-[#C9A962] transition-all duration-200"
              >
                {/* Rank */}
                <div className="w-8 h-8 bg-gradient-to-r from-[#C9A962] to-[#E6C888] rounded-full flex items-center justify-center">
                  <span className="text-black font-bold">{index + 1}</span>
                </div>

                {/* Product Image */}
                {product.image_url ? (
                  <img 
                    src={product.image_url}
                    alt={product.product_name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
                    <Package className="text-gray-600" size={24} />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{product.product_name}</p>
                  <p className="text-[#C9A962] text-sm">{product.price} ₺</p>
                </div>

                {/* Cart Count */}
                <div className="text-right">
                  <p className="text-yellow-500 font-bold text-lg">{product.cart_count}</p>
                  <p className="text-gray-400 text-xs">sepette</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Status */}
        <div className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-xl">
              <Package size={24} className="text-orange-500" />
            </div>
            Stok Durumu
          </h2>
          
          {/* Stats */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-500" size={24} />
                <span className="text-white font-semibold">Stokta</span>
              </div>
              <span className="text-green-500 font-bold text-2xl">{inventory.in_stock}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-yellow-500" size={24} />
                <span className="text-white font-semibold">Düşük Stok</span>
              </div>
              <span className="text-yellow-500 font-bold text-2xl">{inventory.low_stock}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="flex items-center gap-3">
                <Package className="text-red-500" size={24} />
                <span className="text-white font-semibold">Tükendi</span>
              </div>
              <span className="text-red-500 font-bold text-2xl">{inventory.out_of_stock}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Stok Sağlığı</span>
              <span>{((inventory.in_stock / overview.total_products) * 100).toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-black rounded-full overflow-hidden border border-gray-700">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${(inventory.in_stock / overview.total_products) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-sm mb-1">Kategori Sayısı</p>
          <p className="text-2xl font-bold text-white">{overview.total_categories}</p>
        </div>

        <div className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-sm mb-1">Ortalama Sepet</p>
          <p className="text-2xl font-bold text-white">{cart_analytics.avg_cart_size} ürün</p>
        </div>

        <div className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-sm mb-1">Düşük Stok Uyarısı</p>
          <p className="text-2xl font-bold text-yellow-500">{inventory.low_stock}</p>
        </div>

        <div className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-sm mb-1">Dolu Sepetler</p>
          <p className="text-2xl font-bold text-blue-500">{cartAnalytics?.total_users_with_cart || 0}</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <Sparkles className="text-blue-400 mt-1" size={24} />
          <div>
            <h3 className="text-white font-bold text-lg mb-2">Dashboard Özellikleri</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>✨ Gerçek zamanlı satış ve kullanıcı istatistikleri</li>
              <li>📊 En çok satan ürünler ve sepet analizi</li>
              <li>⚠️ Stok uyarıları ve envanter durumu</li>
              <li>💰 Gelir takibi ve dönüşüm oranları</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
