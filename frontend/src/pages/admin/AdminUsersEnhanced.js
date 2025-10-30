import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { 
  User, Mail, Phone, Calendar, ShoppingBag, CreditCard, 
  Crown, Package, Eye, EyeOff, Search, Filter, TrendingUp,
  ShoppingCart, ChevronDown, ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';

const AdminUsersEnhanced = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);
  const [showPasswordHashes, setShowPasswordHashes] = useState(false);
  const { getAuthHeader } = useAdminAuth();

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/users/detailed`, {
        headers: getAuthHeader()
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Kullanıcılar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.phone_number && user.phone_number.includes(searchQuery))
  );

  const toggleUserExpansion = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#C9A962] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#C9A962] to-[#E6C888] bg-clip-text text-transparent">
            Müşteri Yönetimi
          </h1>
          <p className="text-gray-400 mt-2">Tüm müşteri bilgileri ve istatistikleri</p>
        </div>
        
        <button
          onClick={() => setShowPasswordHashes(!showPasswordHashes)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-xl text-white hover:bg-gray-600 transition-colors"
        >
          {showPasswordHashes ? <EyeOff size={20} /> : <Eye size={20} />}
          <span>{showPasswordHashes ? 'Şifreleri Gizle' : 'Şifreleri Göster'}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Toplam Müşteri</p>
              <p className="text-3xl font-bold text-white mt-1">{users.length}</p>
            </div>
            <User className="w-12 h-12 text-[#C9A962]" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">BOZ PLUS Üyeleri</p>
              <p className="text-3xl font-bold text-purple-500 mt-1">
                {users.filter(u => u.is_boz_plus).length}
              </p>
            </div>
            <Crown className="w-12 h-12 text-purple-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Sipariş Veren</p>
              <p className="text-3xl font-bold text-green-500 mt-1">
                {users.filter(u => u.order_count > 0).length}
              </p>
            </div>
            <ShoppingBag className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Sepeti Dolu</p>
              <p className="text-3xl font-bold text-blue-500 mt-1">
                {users.filter(u => u.cart_items_count > 0).length}
              </p>
            </div>
            <ShoppingCart className="w-12 h-12 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 rounded-xl p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="İsim, email veya telefon ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-black border border-gray-700 rounded-xl text-white
              placeholder-gray-500 focus:outline-none focus:border-[#C9A962] transition-colors"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user, index) => {
          const isExpanded = expandedUser === user.id;
          
          return (
            <div
              key={user.id}
              className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 rounded-xl overflow-hidden hover:border-[#C9A962] transition-all duration-200"
            >
              {/* User Header */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#C9A962] to-[#E6C888] rounded-full flex items-center justify-center">
                        <span className="text-black font-bold text-lg">
                          {user.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-bold text-lg">{user.full_name}</h3>
                          {user.is_boz_plus && (
                            <span className="px-2 py-1 bg-purple-500/20 border border-purple-500 rounded-full text-purple-400 text-xs font-semibold flex items-center gap-1">
                              <Crown size={12} />
                              BOZ PLUS
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Mail size={14} />
                            {user.email}
                          </span>
                          {user.phone_number && (
                            <span className="flex items-center gap-1">
                              <Phone size={14} />
                              {user.phone_number}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex flex-wrap gap-4 mt-4">
                      <div className="flex items-center gap-2 px-3 py-2 bg-black/50 rounded-lg">
                        <ShoppingBag className="text-green-500" size={18} />
                        <span className="text-white font-semibold">{user.order_count}</span>
                        <span className="text-gray-400 text-sm">Sipariş</span>
                      </div>
                      
                      <div className="flex items-center gap-2 px-3 py-2 bg-black/50 rounded-lg">
                        <CreditCard className="text-[#C9A962]" size={18} />
                        <span className="text-white font-semibold">{user.total_spent.toFixed(2)} ₺</span>
                        <span className="text-gray-400 text-sm">Toplam</span>
                      </div>
                      
                      <div className="flex items-center gap-2 px-3 py-2 bg-black/50 rounded-lg">
                        <ShoppingCart className="text-blue-500" size={18} />
                        <span className="text-white font-semibold">{user.cart_items_count}</span>
                        <span className="text-gray-400 text-sm">Sepette</span>
                      </div>

                      <div className="flex items-center gap-2 px-3 py-2 bg-black/50 rounded-lg">
                        <Calendar className="text-purple-500" size={18} />
                        <span className="text-gray-400 text-sm">
                          Üyelik: {new Date(user.created_at).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expand Button */}
                  <button
                    onClick={() => toggleUserExpansion(user.id)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="text-gray-400" size={24} />
                    ) : (
                      <ChevronDown className="text-gray-400" size={24} />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-700 bg-black/50 p-6 space-y-6">
                  {/* Technical Info */}
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <span className="text-[#C9A962]">🔐</span>
                      Teknik Bilgiler
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-[#1C1C1C] border border-gray-700 rounded-lg p-3">
                        <p className="text-gray-400 text-sm mb-1">Kullanıcı ID:</p>
                        <p className="text-white font-mono text-sm">{user.id}</p>
                      </div>
                      {showPasswordHashes && (
                        <div className="bg-[#1C1C1C] border border-gray-700 rounded-lg p-3">
                          <p className="text-gray-400 text-sm mb-1">Şifre Hash:</p>
                          <p className="text-white font-mono text-xs break-all">
                            {user.hashed_password?.substring(0, 50)}...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cart Details */}
                  {user.cart_details && user.cart_details.length > 0 && (
                    <div>
                      <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <ShoppingCart className="text-blue-500" size={20} />
                        Sepetteki Ürünler ({user.cart_details.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {user.cart_details.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 bg-[#1C1C1C] border border-gray-700 rounded-lg p-3 hover:border-[#C9A962] transition-colors"
                          >
                            {item.image_url ? (
                              <img 
                                src={item.image_url}
                                alt={item.product_name}
                                className="w-16 h-16 object-cover rounded"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-800 rounded flex items-center justify-center">
                                <Package className="text-gray-600" size={24} />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">
                                {item.product_name}
                              </p>
                              <p className="text-[#C9A962] text-sm font-semibold">
                                {item.price} ₺
                              </p>
                              <p className="text-gray-400 text-xs">
                                Adet: {item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty Cart Message */}
                  {(!user.cart_details || user.cart_details.length === 0) && (
                    <div className="text-center py-6 text-gray-500">
                      <ShoppingCart className="mx-auto mb-2" size={32} />
                      <p>Sepet boş</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-16">
          <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">Kullanıcı Bulunamadı</h3>
          <p className="text-gray-500">Arama kriterlerinize uygun kullanıcı yok</p>
        </div>
      )}
    </div>
  );
};

export default AdminUsersEnhanced;
