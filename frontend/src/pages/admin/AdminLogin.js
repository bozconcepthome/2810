import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, Eye, EyeOff, Crown, Sparkles, KeyRound } from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { toast } from 'sonner';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('🎯 Admin Panel\'e Hoş Geldiniz', {
        duration: 1500,
        style: {
          background: 'linear-gradient(135deg, #C9A962 0%, #E6C888 100%)',
          color: '#000',
          fontWeight: 'bold'
        }
      });
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Giriş başarısız', {
        duration: 2000,
        style: {
          background: '#1C1C1C',
          color: '#fff',
          border: '1px solid #ef4444'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center">
      {/* Animated Bokeh Background - Admin Theme */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        
        {/* Bokeh Circles - Admin Colors */}
        <div className="absolute top-20 left-20 w-[500px] h-[500px] bg-[#C9A962] rounded-full blur-[130px] opacity-25 animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#E6C888] rounded-full blur-[110px] opacity-20 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-[#D4AF37] rounded-full blur-[100px] opacity-20 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-orange-600 rounded-full blur-[90px] opacity-15 animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/3 left-1/2 w-64 h-64 bg-yellow-600 rounded-full blur-[95px] opacity-15 animate-float" style={{ animationDelay: '0.5s' }} />
        
        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-[#C9A962] rounded-full animate-pulse shadow-lg shadow-[#C9A962]/50" />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-[#E6C888] rounded-full animate-pulse" style={{ animationDelay: '0.7s' }} />
        <div className="absolute bottom-1/4 left-1/2 w-3 h-3 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '1.2s' }} />
        <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
        
        {/* Radial Gradient Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(201,169,98,0.08),transparent_60%)]" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(201,169,98,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(201,169,98,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Admin Login Card */}
      <div className="relative z-10 w-full max-w-lg mx-auto px-4">
        {/* Brand Header */}
        <div className="text-center mb-10 animate-fadeIn">
          <div className="inline-block mb-6 relative">
            {/* Outer Glow Ring */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#C9A962] via-[#E6C888] to-[#D4AF37] rounded-full blur-2xl opacity-60 animate-pulse" />
            
            {/* Icon Container */}
            <div className="relative w-24 h-24 bg-gradient-to-r from-[#C9A962] via-[#E6C888] to-[#D4AF37] rounded-full flex items-center justify-center shadow-2xl shadow-[#C9A962]/60">
              <Shield className="w-12 h-12 text-black" strokeWidth={2.5} />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-[#C9A962] via-[#E6C888] to-[#C9A962] bg-clip-text text-transparent animate-gradient">
              Admin Panel
            </span>
          </h1>
          <p className="text-xl text-gray-300 font-semibold mb-2">Boz Concept Home</p>
          <p className="text-gray-400 flex items-center justify-center gap-2">
            <KeyRound size={16} className="text-[#C9A962]" />
            Güvenli Yönetim Girişi
            <KeyRound size={16} className="text-[#C9A962]" />
          </p>
        </div>

        {/* Login Card */}
        <div className="relative group">
          {/* Animated Glow */}
          <div className="absolute -inset-2 bg-gradient-to-r from-[#C9A962] via-[#E6C888] via-[#D4AF37] to-[#C9A962] rounded-3xl opacity-60 blur-2xl transition-all duration-500 animate-pulse" />
          
          {/* Card */}
          <div className="relative bg-gradient-to-br from-[#1C1C1C] via-[#0A0A0A] to-black backdrop-blur-xl border-2 border-gray-800 rounded-3xl p-10 shadow-2xl">
            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                <Crown className="text-[#C9A962]" size={32} />
                Yönetici Girişi
              </h2>
              <p className="text-gray-400">Yönetim paneline erişim için giriş yapın</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="block text-gray-300 text-sm font-bold flex items-center gap-2">
                  <Mail size={16} className="text-[#C9A962]" />
                  E-posta
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C9A962] transition-colors" size={22} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@bozconcept.com"
                    required
                    className="w-full pl-14 pr-4 py-4 bg-black/60 border-2 border-gray-700 rounded-xl text-white text-lg placeholder-gray-500 focus:outline-none focus:border-[#C9A962] focus:bg-black/80 transition-all duration-300 focus:shadow-xl focus:shadow-[#C9A962]/30"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-gray-300 text-sm font-bold flex items-center gap-2">
                  <Lock size={16} className="text-[#C9A962]" />
                  Şifre
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C9A962] transition-colors" size={22} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-14 pr-14 py-4 bg-black/60 border-2 border-gray-700 rounded-xl text-white text-lg placeholder-gray-500 focus:outline-none focus:border-[#C9A962] focus:bg-black/80 transition-all duration-300 focus:shadow-xl focus:shadow-[#C9A962]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#C9A962] transition-colors"
                  >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
              </div>

              {/* Default Credentials Hint */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <p className="text-blue-400 text-sm text-center">
                  <span className="font-semibold">💡 Varsayılan Giriş:</span> admin@bozconcept.com / admin123
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden bg-gradient-to-r from-[#C9A962] via-[#E6C888] to-[#D4AF37] hover:from-[#E6C888] hover:via-[#D4AF37] hover:to-[#C9A962] text-black font-bold py-5 rounded-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#C9A962]/70 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative text-xl flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
                      Giriş Yapılıyor...
                    </>
                  ) : (
                    <>
                      <Shield size={24} />
                      Yönetici Girişi
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400 text-sm font-semibold">Güvenli Bağlantı</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
