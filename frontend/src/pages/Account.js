import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Save, Eye, EyeOff, Phone, Shield, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Account = () => {
  const { user, token, refreshUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [phoneData, setPhoneData] = useState({
    phoneNumber: user?.phone_number || ''
  });
  
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

  const handlePhoneUpdate = async (e) => {
    e.preventDefault();
    
    if (!phoneData.phoneNumber.trim()) {
      toast.error('Lütfen telefon numaranızı girin');
      return;
    }

    setLoading(true);
    try {
      await axios.put(
        `${API_URL}/auth/update-phone`,
        { phone_number: phoneData.phoneNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await refreshUser();
      toast.success('✅ Telefon numaranız başarıyla güncellendi!');
    } catch (error) {
      console.error('Phone update error:', error);
      toast.error(error.response?.data?.detail || 'Telefon numarası güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

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
      toast.success('✅ E-posta adresiniz başarıyla güncellendi!');
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
      toast.success('✅ Şifreniz başarıyla güncellendi!');
    } catch (error) {
      console.error('Password update error:', error);
      toast.error(error.response?.data?.detail || 'Şifre güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#C9A962] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-20 bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-[#C9A962] to-[#E6C888] rounded-full mx-auto mb-4 flex items-center justify-center">
            <User className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#C9A962] to-[#E6C888] bg-clip-text text-transparent mb-2">
            Hesap Ayarları
          </h1>
          <p className="text-gray-400">Hesap bilgilerinizi güncelleyin</p>
        </div>

        {/* Current Information Card */}
        <div className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <CheckCircle className="text-green-500" />
            Mevcut Bilgiler
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-black/50 rounded-xl border border-gray-700">
              <User className="text-[#C9A962]" size={24} />
              <div>
                <p className="text-gray-400 text-sm">İsim</p>
                <p className="text-white font-semibold">{user.full_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-black/50 rounded-xl border border-gray-700">
              <Mail className="text-[#C9A962]" size={24} />
              <div>
                <p className="text-gray-400 text-sm">E-posta</p>
                <p className="text-white font-semibold">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-black/50 rounded-xl border border-gray-700">
              <Phone className="text-[#C9A962]" size={24} />
              <div>
                <p className="text-gray-400 text-sm">Telefon</p>
                <p className="text-white font-semibold">
                  {user.phone_number || 'Henüz eklenmedi'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Phone Number Update Card */}
        <div className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Phone className="text-blue-500" />
            Telefon Numarası Güncelle
          </h2>
          
          <form onSubmit={handlePhoneUpdate} className="space-y-6">
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Telefon Numaranız
              </label>
              <input
                type="tel"
                placeholder="+90 (5XX) XXX XX XX"
                value={phoneData.phoneNumber}
                onChange={(e) => setPhoneData({ phoneNumber: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A962] transition-colors"
              />
              <p className="text-gray-500 text-sm mt-2">
                Siparişlerinizle ilgili bilgilendirmeler için kullanılacak
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {loading ? 'Güncelleniyor...' : 'Telefonu Güncelle'}
            </Button>
          </form>
        </div>

        {/* Email Change Card */}
        <div className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Mail className="text-[#C9A962]" />
            E-posta Değiştir
          </h2>
          
          <form onSubmit={handleEmailChange} className="space-y-6">
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Yeni E-posta Adresi
              </label>
              <input
                type="email"
                placeholder="yeni@email.com"
                value={emailData.newEmail}
                onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A962] transition-colors"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Mevcut Şifreniz (Doğrulama için)
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={emailData.password}
                onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A962] transition-colors"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#C9A962] to-[#E6C888] hover:from-[#A78D4E] hover:to-[#C9A962] text-black font-bold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {loading ? 'Güncelleniyor...' : 'E-posta Güncelle'}
            </Button>
          </form>
        </div>

        {/* Password Change Card */}
        <div className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Lock className="text-red-500" />
            Şifre Değiştir
          </h2>
          
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Mevcut Şifre
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 pr-12 bg-black border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A962] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Yeni Şifre
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 pr-12 bg-black border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A962] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-gray-500 text-sm mt-2">En az 6 karakter</p>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Yeni Şifre (Tekrar)
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 pr-12 bg-black border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A962] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Shield size={20} />
              {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Account;
