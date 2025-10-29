import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
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
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Giriş başarılı!');
      } else {
        await register(formData.email, formData.full_name, formData.password, formData.phone_number);
        toast.success('Kayıt başarılı!');
      }
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen pt-24 pb-20 flex items-center justify-center" data-testid="auth-page">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2
            className="text-3xl font-bold text-center text-gray-900 mb-8"
            style={{ fontFamily: 'Playfair Display, serif' }}
            data-testid="auth-title"
          >
            {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <Label htmlFor="full_name">Ad Soyad</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  data-testid="full-name-input"
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Adınız Soyadınız"
                  className="text-gray-900"
                />
              </div>
            )}
            
            {!isLogin && (
              <div>
                <Label htmlFor="phone_number">Telefon Numarası</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  data-testid="phone-input"
                  type="tel"
                  required
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="05XX XXX XX XX"
                  className="text-gray-900"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                name="email"
                data-testid="email-input"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="ornek@email.com"
                className="text-gray-900"
              />
            </div>

            <div>
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                name="password"
                data-testid="password-input"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="text-gray-900"
              />
            </div>

            <Button
              type="submit"
              data-testid="auth-submit-button"
              className="w-full bg-amber-700 hover:bg-amber-800"
              disabled={loading}
            >
              {loading ? 'Yükleniyor...' : isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              data-testid="toggle-auth-mode-button"
              className="text-sm text-amber-700 hover:text-amber-800 font-medium"
            >
              {isLogin
                ? 'Hesabın yok mu? Kayıt ol'
                : 'Zaten hesabın var mı? Giriş yap'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;