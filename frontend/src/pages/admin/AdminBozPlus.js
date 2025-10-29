import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { Crown, Check, X, Calendar, Clock, Plus, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const AdminBozPlus = () => {
  const [requests, setRequests] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'members'
  const { getAuthHeader } = useAdminAuth();

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'requests') {
        const response = await axios.get(`${API_URL}/api/admin/boz-plus/requests`, {
          headers: getAuthHeader()
        });
        setRequests(response.data);
      } else {
        const response = await axios.get(`${API_URL}/api/admin/boz-plus/members`, {
          headers: getAuthHeader()
        });
        setMembers(response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId, userName) => {
    if (!window.confirm(`${userName} için BOZ PLUS üyeliğini onaylıyor musunuz? (30 gün)`)) {
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/admin/boz-plus/approve/${userId}`,
        {},
        { headers: getAuthHeader() }
      );
      toast.success('BOZ PLUS üyeliği onaylandı!');
      fetchData();
    } catch (error) {
      console.error('Error approving:', error);
      toast.error('Onaylama başarısız');
    }
  };

  const handleReject = async (userId, userName) => {
    if (!window.confirm(`${userName} için BOZ PLUS talebini reddetmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/admin/boz-plus/reject/${userId}`,
        {},
        { headers: getAuthHeader() }
      );
      toast.success('Talep reddedildi');
      fetchData();
    } catch (error) {
      console.error('Error rejecting:', error);
      toast.error('Reddetme başarısız');
    }
  };

  const handleExtend = async (userId, userName, days = 30) => {
    if (!window.confirm(`${userName} için BOZ PLUS üyeliğini ${days} gün uzatmak istiyor musunuz?`)) {
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/admin/boz-plus/extend/${userId}?days=${days}`,
        {},
        { headers: getAuthHeader() }
      );
      toast.success(`Üyelik ${days} gün uzatıldı`);
      fetchData();
    } catch (error) {
      console.error('Error extending:', error);
      toast.error('Uzatma başarısız');
    }
  };

  const handleRevoke = async (userId, userName) => {
    if (!window.confirm(`${userName} için BOZ PLUS üyeliğini iptal etmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/api/admin/boz-plus/revoke/${userId}`,
        { headers: getAuthHeader() }
      );
      toast.success('Üyelik iptal edildi');
      fetchData();
    } catch (error) {
      console.error('Error revoking:', error);
      toast.error('İptal başarısız');
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Crown className="w-10 h-10 text-[#FFD700] fill-[#FFD700]" />
          <div>
            <h1 className="text-3xl font-bold text-white">BOZ PLUS Yönetimi</h1>
            <p className="text-gray-400 mt-1">Premium üyelik talepleri ve aktif üyeler</p>
          </div>
        </div>
        <Link
          to="/admin/boz-plus-pricing"
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600
            text-white font-semibold rounded-lg hover:opacity-90 transition-all"
        >
          <DollarSign size={20} />
          <span>Fiyat Yönetimi</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 bg-[#1C1C1C] border border-gray-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 px-6 py-3 rounded-lg transition-all duration-200 ${
            activeTab === 'requests'
              ? 'bg-gradient-to-r from-[#C9A962] to-[#D4AF37] text-black'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Bekleyen Talepler ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`flex-1 px-6 py-3 rounded-lg transition-all duration-200 ${
            activeTab === 'members'
              ? 'bg-gradient-to-r from-[#C9A962] to-[#D4AF37] text-black'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Aktif Üyeler ({members.length})
        </button>
      </div>

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="bg-[#1C1C1C] border border-gray-800 rounded-2xl p-12 text-center">
              <p className="text-gray-400">Bekleyen talep bulunmuyor</p>
            </div>
          ) : (
            requests.map((user) => (
              <div
                key={user.id}
                className="bg-[#1C1C1C] border border-gray-800 rounded-2xl p-6 hover:border-yellow-500/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{user.full_name}</h3>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Kayıt: {new Date(user.created_at).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleApprove(user.id, user.full_name)}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all flex items-center space-x-2"
                    >
                      <Check size={18} />
                      <span>Onayla</span>
                    </button>
                    <button
                      onClick={() => handleReject(user.id, user.full_name)}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all flex items-center space-x-2"
                    >
                      <X size={18} />
                      <span>Reddet</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {members.length === 0 ? (
            <div className="bg-[#1C1C1C] border border-gray-800 rounded-2xl p-12 text-center">
              <p className="text-gray-400">Aktif BOZ PLUS üyesi bulunmuyor</p>
            </div>
          ) : (
            members.map((user) => (
              <div
                key={user.id}
                className="bg-[#1C1C1C] border-2 border-purple-500/30 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      <Crown className="w-6 h-6 text-[#FFD700] fill-[#FFD700]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-bold text-white">{user.full_name}</h3>
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                          BOZ PLUS
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <div className="flex items-center space-x-1 text-purple-400">
                          <Clock size={14} />
                          <span>{user.days_remaining} gün kaldı</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Calendar size={14} />
                          <span>Bitiş: {new Date(user.boz_plus_expiry_date).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleExtend(user.id, user.full_name, 30)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center space-x-2"
                      title="30 gün uzat"
                    >
                      <Plus size={16} />
                      <span className="hidden sm:inline">30 Gün</span>
                    </button>
                    <button
                      onClick={() => handleRevoke(user.id, user.full_name)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all flex items-center space-x-2"
                    >
                      <X size={16} />
                      <span className="hidden sm:inline">İptal</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Info Card */}
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/50 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-3">💡 BOZ PLUS Bilgileri</h3>
        <ul className="text-sm text-gray-300 space-y-2">
          <li>• BOZ PLUS üyeliği 30 gün geçerlidir</li>
          <li>• Üyelik ₺100 karşılığında verilir</li>
          <li>• Üyeler tüm ürünlerde özel fiyatlardan yararlanır</li>
          <li>• Süre dolduğunda otomatik olarak sona erer</li>
          <li>• Dilediğiniz zaman süreyi uzatabilir veya üyeliği iptal edebilirsiniz</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminBozPlus;
