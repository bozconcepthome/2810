import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Save, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Account = () => {
  const { user, token, refreshUser } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  React.useEffect(() => {
    if (!user || !token) {
      navigate('/auth');
    }
  }, [user, token, navigate]);

  const handleEmailChange = async (e) => {
    e.preventDefault();
    
    if (!emailData.newEmail || !emailData.password) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    if (emailData.newEmail === user.email) {
      toast.error('Yeni e-posta adresi mevcut adresle aynı olamaz');
      return;
    }

    setLoading(true);
    try {
      await axios.put(
        `${API_URL}/auth/update-email`,
        {
          new_email: emailData.newEmail,
          password: emailData.password
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await refreshUser();
      setEmailData({ newEmail: '', password: '' });
      toast.success('E-posta adresiniz başarıyla güncellendi!');
    } catch (error) {
      console.error('Email update error:', error);
      toast.error(error.response?.data?.detail || 'E-posta güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Yeni şifre en az 6 karakter olmalıdır');
      return;
    }

    setLoading(true);
    try {
      await axios.put(
        `${API_URL}/auth/update-password`,
        {
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Şifreniz başarıyla güncellendi!');
    } catch (error) {
      console.error('Password update error:', error);
      toast.error(error.response?.data?.detail || 'Şifre güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-8 h-8 text-[#C9A962]" />
            <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              Hesap Ayarları
            </h1>
          </div>
          <p className="text-gray-400">Hesap bilgilerinizi güncelleyin</p>
        </div>

        {/* User Info */}
        <div className="bg-gradient-to-br from-[#1C1C1C] to-[#0A0A0A] border border-gray-800 rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Mevcut Bilgiler</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-300">
              <User className="w-5 h-5 text-[#C9A962]" />
              <span>{user.full_name}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <Mail className="w-5 h-5 text-[#C9A962]" />
              <span>{user.email}</span>
            </div>
          </div>
        </div>

        {/* Email Change */}
        <div className="bg-gradient-to-br from-[#1C1C1C] to-[#0A0A0A] border border-gray-800 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-6 h-6 text-[#C9A962]" />
            <h2 className="text-2xl font-bold text-white">E-posta Değiştir</h2>
          </div>

          <form onSubmit={handleEmailChange} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Yeni E-posta Adresi
              </label>
              <input
                type="email"
                value={emailData.newEmail}
                onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#C9A962]"
                placeholder="yeni@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Mevcut Şifreniz (Doğrulama için)
              </label>
              <input
                type="password"
                value={emailData.password}
                onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#C9A962]"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#C9A962] to-[#E6C888] hover:from-[#A78D4E] hover:to-[#C9A962] text-black font-semibold py-3 rounded-lg transition-all duration-300"
            >
              <Save className="w-5 h-5 mr-2" />
              {loading ? 'Güncelleniyor...' : 'E-posta Güncelle'}
            </Button>
          </form>
        </div>

        {/* Password Change */}
        <div className="bg-gradient-to-br from-[#1C1C1C] to-[#0A0A0A] border border-gray-800 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-[#C9A962]" />
            <h2 className="text-2xl font-bold text-white">Şifre Değiştir</h2>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Mevcut Şifre
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#C9A962] pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Yeni Şifre
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#C9A962] pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">En az 6 karakter</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Yeni Şifre (Tekrar)
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#C9A962]"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#C9A962] to-[#E6C888] hover:from-[#A78D4E] hover:to-[#C9A962] text-black font-semibold py-3 rounded-lg transition-all duration-300"
            >
              <Save className="w-5 h-5 mr-2" />
              {loading ? 'Güncelleniyor...' : 'Şifre Güncelle'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Account;
