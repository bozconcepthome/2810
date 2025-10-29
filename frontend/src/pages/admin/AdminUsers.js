import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { Search, User } from 'lucide-react';
import { toast } from 'sonner';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { getAuthHeader } = useAdminAuth();

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user =>
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/users`, {
        headers: getAuthHeader()
      });
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Kullanıcılar yüklenemedi');
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-3xl font-bold text-white">Kullanıcılar</h1>
        <p className="text-gray-400 mt-1">Toplam {filteredUsers.length} kullanıcı</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Kullanıcı ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-[#1C1C1C] border border-gray-800 rounded-lg text-white
            focus:outline-none focus:ring-2 focus:ring-[#C9A962] focus:border-transparent"
        />
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-[#1C1C1C] border border-gray-800 rounded-2xl p-6
              hover:border-[#C9A962]/50 transition-all duration-200"
          >
            {/* User Avatar */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-[#C9A962] to-[#D4AF37] 
                rounded-full flex items-center justify-center">
                <User className="text-black" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">{user.full_name}</h3>
                <p className="text-gray-400 text-sm">{user.email}</p>
              </div>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
              <div>
                <p className="text-gray-400 text-xs mb-1">Sipariş Sayısı</p>
                <p className="text-2xl font-bold text-[#C9A962]">
                  {user.order_count || 0}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Kayıt Tarihi</p>
                <p className="text-white text-sm">
                  {new Date(user.created_at).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="bg-[#1C1C1C] border border-gray-800 rounded-2xl p-12 text-center">
          <p className="text-gray-400">Kullanıcı bulunamadı</p>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
