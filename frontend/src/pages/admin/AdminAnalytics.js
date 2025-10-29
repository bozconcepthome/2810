import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { Eye, MousePointerClick, ShoppingBag, LayoutGrid } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminAnalytics = () => {
  const [summary, setSummary] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', '1', '7', '30'
  const { getAuthHeader } = useAdminAuth();

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchAnalytics();
  }, [timeFilter]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const daysParam = timeFilter === 'all' ? '' : `?days=${timeFilter}`;
      
      const [summaryRes, timelineRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/analytics/summary${daysParam}`, {
          headers: getAuthHeader()
        }),
        axios.get(`${API_URL}/api/admin/analytics/timeline?days=${timeFilter === 'all' ? '30' : timeFilter}`, {
          headers: getAuthHeader()
        })
      ]);

      setSummary(summaryRes.data);
      setTimeline(timelineRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const timeFilters = [
    { label: 'Bugün', value: '1' },
    { label: 'Son 7 Gün', value: '7' },
    { label: 'Son 30 Gün', value: '30' },
    { label: 'Tüm Zamanlar', value: 'all' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A962]"></div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Sayfa Görüntüleme',
      value: summary?.summary?.total_page_views || 0,
      icon: Eye,
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      label: 'Ürün Tıklamaları',
      value: summary?.summary?.total_product_clicks || 0,
      icon: MousePointerClick,
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      label: 'Kategori Tıklamaları',
      value: summary?.summary?.total_category_clicks || 0,
      icon: LayoutGrid,
      gradient: 'from-orange-500 to-red-600'
    },
    {
      label: 'Sepete Ekleme',
      value: summary?.summary?.total_add_to_cart || 0,
      icon: ShoppingBag,
      gradient: 'from-green-500 to-emerald-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 mt-1">Müşteri davranışları ve tıklama verileri</p>
        </div>
        
        {/* Time Filters */}
        <div className="flex items-center space-x-2 bg-[#1C1C1C] border border-gray-800 rounded-lg p-1">
          {timeFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setTimeFilter(filter.value)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                timeFilter === filter.value
                  ? 'bg-gradient-to-r from-[#C9A962] to-[#D4AF37] text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
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

      {/* Timeline Chart */}
      <div className="bg-[#1C1C1C] border border-gray-800 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Aktivite Grafiği</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1C1C1C', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Line type="monotone" dataKey="page_view" stroke="#3B82F6" name="Sayfa Görüntüleme" strokeWidth={2} />
            <Line type="monotone" dataKey="product_click" stroke="#A855F7" name="Ürün Tıklama" strokeWidth={2} />
            <Line type="monotone" dataKey="category_click" stroke="#F97316" name="Kategori Tıklama" strokeWidth={2} />
            <Line type="monotone" dataKey="add_to_cart" stroke="#10B981" name="Sepete Ekleme" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Clicked Products */}
        <div className="bg-[#1C1C1C] border border-gray-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">En Çok Tıklanan Ürünler</h3>
          <div className="space-y-3">
            {summary?.top_products?.slice(0, 5).map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full">
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{product.product_name}</p>
                    <p className="text-gray-400 text-xs">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#C9A962] font-bold">{product.count}</p>
                  <p className="text-gray-500 text-xs">tıklama</p>
                </div>
              </div>
            ))}
            {(!summary?.top_products || summary.top_products.length === 0) && (
              <p className="text-gray-400 text-center py-4">Henüz veri yok</p>
            )}
          </div>
        </div>

        {/* Most Added to Cart */}
        <div className="bg-[#1C1C1C] border border-gray-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">En Çok Sepete Eklenen Ürünler</h3>
          <div className="space-y-3">
            {summary?.top_cart_products?.slice(0, 5).map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full">
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{product.product_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#C9A962] font-bold">{product.count}</p>
                  <p className="text-gray-500 text-xs">kez</p>
                </div>
              </div>
            ))}
            {(!summary?.top_cart_products || summary.top_cart_products.length === 0) && (
              <p className="text-gray-400 text-center py-4">Henüz veri yok</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-[#1C1C1C] border border-gray-800 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">En Çok Tıklanan Kategoriler</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={summary?.top_categories?.slice(0, 10) || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="category" stroke="#9CA3AF" angle={-45} textAnchor="end" height={100} />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1C1C1C', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Bar dataKey="count" fill="#F97316" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminAnalytics;
