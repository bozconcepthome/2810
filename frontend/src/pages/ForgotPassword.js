import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Lütfen e-posta adresinizi girin');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setSent(true);
      toast.success('Şifre sıfırlama bağlantısı e-postanıza gönderildi!');
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.response?.data?.detail || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center bg-black">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-gradient-to-br from-[#1C1C1C] to-[#0A0A0A] border border-gray-800 rounded-2xl p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                <Mail className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                E-posta Gönderildi!
              </h2>
              <p className="text-gray-400 mb-6">
                Şifre sıfırlama bağlantısı <strong className="text-[#C9A962]">{email}</strong> adresine gönderildi.
              </p>
              <p className="text-sm text-gray-500 mb-8">
                E-postanızı kontrol edin ve bağlantıya tıklayarak şifrenizi sıfırlayın.
                E-posta gelmezse spam klasörünü kontrol etmeyi unutmayın.
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => navigate('/auth')}
                className="w-full bg-gradient-to-r from-[#C9A962] to-[#E6C888] hover:from-[#A78D4E] hover:to-[#C9A962] text-black font-semibold"
              >
                Giriş Sayfasına Dön
              </Button>
              
              <button
                onClick={() => setSent(false)}
                className="w-full text-sm text-gray-400 hover:text-white transition"
              >
                E-postayı tekrar gönder
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 flex items-center justify-center bg-black">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-gradient-to-br from-[#1C1C1C] to-[#0A0A0A] border border-gray-800 rounded-2xl p-8">
          <button
            onClick={() => navigate('/auth')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Geri Dön</span>
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#C9A962]/20 rounded-full mb-4">
              <Mail className="w-8 h-8 text-[#C9A962]" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Şifremi Unuttum
            </h2>
            <p className="text-gray-400">
              E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                E-posta Adresi
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#C9A962]"
                placeholder="ornek@email.com"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#C9A962] to-[#E6C888] hover:from-[#A78D4E] hover:to-[#C9A962] text-black font-semibold py-3 rounded-lg transition-all duration-300"
            >
              {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/auth')}
              className="text-sm text-gray-400 hover:text-white transition"
            >
              Şifrenizi hatırladınız mı? <span className="text-[#C9A962]">Giriş Yap</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
