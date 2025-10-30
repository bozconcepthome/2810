import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, Sparkles, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone_number: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Boz Concept Home Hoş geldiniz', { 
          duration: 1500,
          style: {
            background: 'linear-gradient(135deg, #C9A962 0%, #E6C888 100%)',
            color: '#000',
            fontWeight: 'bold'
          }
        });
      } else {
        await register(formData.email, formData.full_name, formData.password, formData.phone_number);
        toast.success('🎉 Hoş geldiniz! Hesabınız oluşturuldu', {
          duration: 1500,
          style: {
            background: 'linear-gradient(135deg, #C9A962 0%, #E6C888 100%)',
            color: '#000',
            fontWeight: 'bold'
          }
        });
      }
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Bir hata oluştu', {
        duration: 2000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center py-20" data-testid="auth-page">
      {/* Animated Bokeh Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        
        {/* Bokeh Circles */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#C9A962] rounded-full blur-[120px] opacity-20 animate-float" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#E6C888] rounded-full blur-[100px] opacity-20 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-purple-600 rounded-full blur-[90px] opacity-15 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-[#D4AF37] rounded-full blur-[110px] opacity-20 animate-float" style={{ animationDelay: '1.5s' }} />
        
        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-[#C9A962] rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-[#E6C888] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(201,169,98,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(201,169,98,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        {/* Logo/Brand */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-block mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-[#C9A962] via-[#E6C888] to-[#D4AF37] rounded-full flex items-center justify-center shadow-2xl shadow-[#C9A962]/50 animate-pulse">
              <Crown className="w-10 h-10 text-black" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#C9A962] via-[#E6C888] to-[#C9A962] bg-clip-text text-transparent mb-2 animate-gradient">
            Boz Concept Home
          </h1>
          <p className="text-gray-400 flex items-center justify-center gap-2">
            <Sparkles size={16} className="text-[#C9A962]" />
            Lüks & Minimalist Tasarım
            <Sparkles size={16} className="text-[#C9A962]" />
          </p>
        </div>

        {/* Main Card */}
        <div className="relative group">
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#C9A962] via-[#E6C888] to-[#D4AF37] rounded-3xl opacity-50 group-hover:opacity-75 blur-xl transition-all duration-500 animate-pulse" />
          
          {/* Card Content */}
          <div className="relative bg-gradient-to-br from-[#1C1C1C] via-[#0A0A0A] to-black backdrop-blur-xl border border-gray-800 rounded-3xl p-10 shadow-2xl">
            {/* Tab Switcher */}
            <div className="flex mb-8 bg-black/50 p-1.5 rounded-2xl border border-gray-700">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all duration-300 ${
                  isLogin
                    ? 'bg-gradient-to-r from-[#C9A962] to-[#E6C888] text-black shadow-lg shadow-[#C9A962]/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Giriş Yap
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all duration-300 ${
                  !isLogin
                    ? 'bg-gradient-to-r from-[#C9A962] to-[#E6C888] text-black shadow-lg shadow-[#C9A962]/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Kayıt Ol
              </button>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                {isLogin ? 'Tekrar Hoş Geldiniz' : 'Aramıza Katılın'}
              </h2>
              <p className="text-gray-400">
                {isLogin ? 'Hesabınıza giriş yapın' : 'Yeni hesap oluşturun'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name (Register Only) */}
              {!isLogin && (
                <div className="space-y-2 animate-slideDown">
                  <label className="block text-gray-300 text-sm font-semibold">
                    Ad Soyad
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C9A962] transition-colors" size={20} />
                    <input
                      type="text"
                      name="full_name"
                      data-testid="full-name-input"
                      required={!isLogin}
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Adınız Soyadınız"
                      className="w-full pl-12 pr-4 py-4 bg-black/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A962] focus:bg-black/70 transition-all duration-300 focus:shadow-lg focus:shadow-[#C9A962]/20"
                    />
                  </div>
                </div>
              )}

              {/* Phone Number (Register Only) */}
              {!isLogin && (
                <div className="space-y-2 animate-slideDown" style={{ animationDelay: '0.1s' }}>
                  <label className="block text-gray-300 text-sm font-semibold">
                    Telefon Numarası (Opsiyonel)
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C9A962] transition-colors" size={20} />
                    <input
                      type="tel"
                      name="phone_number"
                      data-testid="phone-input"
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder="+90 5XX XXX XX XX"
                      className="w-full pl-12 pr-4 py-4 bg-black/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A962] focus:bg-black/70 transition-all duration-300 focus:shadow-lg focus:shadow-[#C9A962]/20"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-gray-300 text-sm font-semibold">
                  E-posta Adresi
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C9A962] transition-colors" size={20} />
                  <input
                    type="email"
                    name="email"
                    data-testid="email-input"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ornek@email.com"
                    className="w-full pl-12 pr-4 py-4 bg-black/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A962] focus:bg-black/70 transition-all duration-300 focus:shadow-lg focus:shadow-[#C9A962]/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-gray-300 text-sm font-semibold">
                  Şifre
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C9A962] transition-colors" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    data-testid="password-input"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 bg-black/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A962] focus:bg-black/70 transition-all duration-300 focus:shadow-lg focus:shadow-[#C9A962]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#C9A962] transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {!isLogin && (
                  <p className="text-gray-500 text-xs mt-1">En az 6 karakter</p>
                )}
              </div>

              {/* Forgot Password (Login Only) */}
              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-[#C9A962] hover:text-[#E6C888] text-sm font-semibold transition-colors"
                  >
                    Şifremi Unuttum
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden bg-gradient-to-r from-[#C9A962] via-[#E6C888] to-[#D4AF37] hover:from-[#E6C888] hover:via-[#C9A962] hover:to-[#E6C888] text-black font-bold py-4 rounded-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#C9A962]/60 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative text-lg">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      {isLogin ? 'Giriş Yapılıyor...' : 'Kayıt Oluşturuluyor...'}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      {isLogin ? (
                        <>
                          <Lock size={20} />
                          Giriş Yap
                        </>
                      ) : (
                        <>
                          <Sparkles size={20} />
                          Hemen Kayıt Ol
                        </>
                      )}
                    </span>
                  )}
                </span>
              </button>
            </form>

            {/* Switch Mode */}
            <div className="mt-8 text-center">
              <p className="text-gray-400">
                {isLogin ? 'Hesabın yok mu?' : 'Zaten hesabın var mı?'}
                {' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setFormData({ email: '', password: '', full_name: '', phone_number: '' });
                  }}
                  className="text-[#C9A962] hover:text-[#E6C888] font-bold transition-colors hover:underline"
                >
                  {isLogin ? 'Kayıt ol' : 'Giriş yap'}
                </button>
              </p>
            </div>

            {/* Features (Register Only) */}
            {!isLogin && (
              <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-sm text-gray-400">
                    <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-green-500 text-xs">✓</span>
                    </div>
                    <span>Güvenli ve hızlı alışveriş</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-gray-400">
                    <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-green-500 text-xs">✓</span>
                    </div>
                    <span>Özel kampanya ve fırsatlardan haberdar olun</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-gray-400">
                    <div className="w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center mt-0.5">
                      <Crown className="text-purple-500" size={12} />
                    </div>
                    <span>BOZ PLUS üyeliğine başvurma hakkı</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
