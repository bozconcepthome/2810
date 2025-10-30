import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { toast } from 'sonner';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      toast.success('Giriş başarılı!', {
        style: {
          background: 'linear-gradient(135deg, #C9A962 0%, #D4AF37 100%)',
          color: '#000',
          border: 'none'
        }
      });
      navigate('/admin/dashboard');
    } else {
      toast.error(result.message || 'Giriş başarısız');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Admin Panel
          </h1>
          <p className="text-gray-400">Boz Concept Home</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#1C1C1C] rounded-2xl p-8 border border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                E-posta
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white 
                  focus:outline-none focus:ring-2 focus:ring-[#C9A962] focus:border-transparent
                  transition-all duration-200"
                placeholder="admin@bozconcept.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white 
                  focus:outline-none focus:ring-2 focus:ring-[#C9A962] focus:border-transparent
                  transition-all duration-200"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[#C9A962] to-[#D4AF37] text-black 
                font-semibold rounded-lg hover:opacity-90 transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          {/* Default Credentials Info */}
          <div className="mt-6 p-4 bg-[#0A0A0A] border border-gray-800 rounded-lg">
            <p className="text-xs text-gray-400 text-center">
              Varsayılan Giriş Bilgileri
            </p>
            <p className="text-sm text-gray-300 text-center mt-1">
              admin@bozconcept.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
