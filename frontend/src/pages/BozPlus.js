import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Check, Clock, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const BozPlus = () => {
  const { user, token, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [bozPlusStatus, setBozPlusStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (token) {
      fetchBozPlusStatus();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchBozPlusStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/boz-plus/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBozPlusStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch BOZ PLUS status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestBozPlus = async () => {
    // Check if user is logged in
    if (!token) {
      toast.info('Lütfen önce giriş yapın', {
        duration: 3000,
        style: {
          background: '#1C1C1C',
          color: '#fff',
          border: '1px solid #C9A962'
        }
      });
      navigate('/auth');
      return;
    }

    setRequesting(true);
    try {
      await axios.post(
        `${API_URL}/boz-plus/request`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('🎉 BOZ PLUS talebiniz alındı! Admin onayı bekleniyor.', {
        duration: 5000,
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          border: 'none'
        }
      });
      
      await fetchBozPlusStatus();
      await refreshUser();
    } catch (error) {
      console.error('Failed to request BOZ PLUS:', error);
      toast.error(error.response?.data?.detail || 'Talep gönderilemedi');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#C9A962] border-t-transparent" />
      </div>
    );
  }

  const benefits = [
    'Tüm ürünlerde özel BOZ PLUS fiyatları',
    'Altın taç rozeti ile özel statü',
    'Öncelikli müşteri desteği',
    '30 gün kesintisiz erişim',
    'Yeni ürünlere erken erişim',
    'Özel kampanyalardan haberdar olma'
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          {/* Crown Icon */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Crown className="w-20 h-20 text-[#D4AF37] fill-[#D4AF37] animate-pulse" />
              <div className="absolute inset-0 blur-xl bg-purple-600/30"></div>
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-white">BOZ</span> <span className="bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent font-extrabold animate-pulse drop-shadow-[0_0_30px_rgba(139,92,246,0.5)]">PLUS</span>
          </h1>
          <p className="text-xl text-purple-200">Premium Alışveriş Deneyimi</p>
        </div>

        {/* Status Card */}
        {token && bozPlusStatus?.is_boz_plus ? (
          <div className="relative bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-violet-900/40 border-2 border-purple-500 rounded-2xl p-8 mb-12 shadow-[0_0_50px_rgba(139,92,246,0.4)] overflow-hidden">
            {/* Luxury background effects */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxMzksMzIsMjQ2LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Crown className="w-12 h-12 text-[#D4AF37] fill-[#D4AF37] animate-bounce" />
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-300 via-violet-200 to-purple-300 bg-clip-text text-transparent">Aktif BOZ PLUS Üyesi</h2>
                  <p className="text-purple-200">Özel ayrıcalıklarınızdan faydalanabilirsiniz</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 text-purple-100">
                  <Clock className="w-5 h-5" />
                  <span className="text-lg font-bold">{bozPlusStatus.days_remaining} gün kaldı</span>
                </div>
                <p className="text-sm text-purple-300 mt-1">
                  Bitiş: {new Date(bozPlusStatus.boz_plus_expiry_date).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>
          </div>
        ) : token && bozPlusStatus?.boz_plus_requested ? (
          <div className="bg-yellow-900/30 border-2 border-yellow-500 rounded-2xl p-8 mb-12">
            <div className="text-center">
              <Clock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Talep Gönderildi</h2>
              <p className="text-yellow-300">
                BOZ PLUS talebiniz admin onayı bekliyor. En kısa sürede geri dönüş yapılacaktır.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative bg-gradient-to-br from-purple-900/30 via-violet-900/30 to-purple-900/30 border-2 border-purple-500/50 rounded-2xl p-8 mb-12 text-center shadow-[0_0_40px_rgba(139,92,246,0.3)] overflow-hidden">
            {/* Luxury shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent animate-shimmer"></div>
            <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-pulse" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent mb-4 drop-shadow-[0_0_20px_rgba(139,92,246,0.5)]">Özel Fiyatlardan Yararlan!</h2>
            <p className="text-xl text-white mb-6">
              Sadece <span className="bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent font-extrabold text-3xl animate-pulse">₺100</span> ile 30 gün premium erişim
            </p>
            <Button
              onClick={handleRequestBozPlus}
              disabled={requesting}
              size="lg"
              className="bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#8B5CF6] text-white font-extrabold py-6 px-12 text-lg shadow-[0_0_40px_rgba(139,92,246,0.6)] hover:shadow-[0_0_60px_rgba(139,92,246,0.9)] transition-all duration-300 border border-purple-400/30"
            >
              {requesting ? 'İşleniyor...' : '✨ BOZ PLUS Satın Al ✨'}
            </Button>
            <p className="text-sm text-purple-300 mt-4">
              * Admin onayı sonrası üyeliğiniz aktif olacaktır
            </p>
          </div>
        )}

        {/* Comparison Table - Why BOZ PLUS? */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            <span className="text-white">Neden </span>
            <span className="bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(139,92,246,0.5)]">
              BOZ PLUS
            </span>
            <span className="text-white"> Olmalısınız?</span>
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-purple-500">
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold">ÖZELLİK</th>
                  <th className="text-center py-4 px-6 text-gray-400 font-semibold">Normal Kullanıcı</th>
                  <th className="text-center py-4 px-6 bg-gradient-to-r from-purple-900/30 via-violet-900/30 to-purple-900/30">
                    <span className="bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent font-bold text-lg drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]">
                      👑 BOZ PLUS Üye
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {/* Row 1 - Prices */}
                <tr className="hover:bg-gray-900/50 transition-colors">
                  <td className="py-5 px-6 text-white font-medium">Ürün Fiyatları</td>
                  <td className="py-5 px-6 text-center text-gray-400">Normal Fiyat</td>
                  <td className="py-5 px-6 text-center bg-gradient-to-r from-purple-900/10 via-violet-900/10 to-purple-900/10">
                    <span className="bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent font-bold text-lg">
                      🔥 Özel İndirimli Fiyat
                    </span>
                  </td>
                </tr>

                {/* Row 2 - Special Status */}
                <tr className="hover:bg-gray-900/50 transition-colors">
                  <td className="py-5 px-6 text-white font-medium">Özel Statü & Rozet</td>
                  <td className="py-5 px-6 text-center">
                    <span className="text-2xl">❌</span>
                  </td>
                  <td className="py-5 px-6 text-center bg-gradient-to-r from-purple-900/10 via-violet-900/10 to-purple-900/10">
                    <div className="flex items-center justify-center space-x-2">
                      <Crown className="w-6 h-6 text-purple-400 fill-[#FFD700]" />
                      <span className="text-purple-400 font-bold">Altın Taç Rozeti</span>
                    </div>
                  </td>
                </tr>

                {/* Row 3 - Customer Support */}
                <tr className="hover:bg-gray-900/50 transition-colors">
                  <td className="py-5 px-6 text-white font-medium">Müşteri Desteği</td>
                  <td className="py-5 px-6 text-center text-gray-400">Standart</td>
                  <td className="py-5 px-6 text-center bg-gradient-to-r from-purple-900/10 via-violet-900/10 to-purple-900/10">
                    <span className="bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent font-bold">
                      ⚡ Öncelikli Destek
                    </span>
                  </td>
                </tr>

                {/* Row 4 - Early Access */}
                <tr className="hover:bg-gray-900/50 transition-colors">
                  <td className="py-5 px-6 text-white font-medium">Yeni Ürünlere Erişim</td>
                  <td className="py-5 px-6 text-center text-gray-400">Normal Zamanda</td>
                  <td className="py-5 px-6 text-center bg-gradient-to-r from-purple-900/10 via-violet-900/10 to-purple-900/10">
                    <span className="bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent font-bold">
                      🚀 Erken Erişim
                    </span>
                  </td>
                </tr>

                {/* Row 5 - Special Campaigns */}
                <tr className="hover:bg-gray-900/50 transition-colors">
                  <td className="py-5 px-6 text-white font-medium">Özel Kampanyalar</td>
                  <td className="py-5 px-6 text-center">
                    <span className="text-2xl">❌</span>
                  </td>
                  <td className="py-5 px-6 text-center bg-gradient-to-r from-purple-900/10 via-violet-900/10 to-purple-900/10">
                    <span className="bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent font-bold">
                      💎 Özel Fırsatlar
                    </span>
                  </td>
                </tr>

                {/* Row 6 - Access Duration */}
                <tr className="hover:bg-gray-900/50 transition-colors">
                  <td className="py-5 px-6 text-white font-medium">Ayrıcalık Süresi</td>
                  <td className="py-5 px-6 text-center">
                    <span className="text-2xl">-</span>
                  </td>
                  <td className="py-5 px-6 text-center bg-gradient-to-r from-purple-900/10 via-violet-900/10 to-purple-900/10">
                    <span className="text-purple-400 font-bold text-lg">30 Gün Kesintisiz</span>
                  </td>
                </tr>

                {/* Row 7 - Monthly Cost */}
                <tr className="hover:bg-gray-900/50 transition-colors border-t-2 border-purple-500/30">
                  <td className="py-5 px-6 text-white font-bold text-lg">Aylık Ücret</td>
                  <td className="py-5 px-6 text-center text-gray-400 font-bold">₺0</td>
                  <td className="py-5 px-6 text-center bg-gradient-to-r from-purple-900/10 via-violet-900/10 to-purple-900/10">
                    <div className="flex flex-col items-center">
                      <span className="text-purple-400 font-extrabold text-2xl animate-pulse">₺100</span>
                      <span className="text-xs text-gray-400 mt-1">/ 30 Gün</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Savings Highlight */}
          <div className="mt-8 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-2 border-green-500 rounded-xl p-6 text-center">
            <p className="text-white text-lg mb-2">
              💰 <strong className="text-green-400">BOZ PLUS</strong> üyeleri ortalama <strong className="text-green-400 text-2xl">%15-30</strong> tasarruf ediyor!
            </p>
            <p className="text-gray-300 text-sm">
              Ayda sadece 2-3 ürün alıyorsanız, BOZ PLUS üyeliği kendini amorti ediyor! 🎯
            </p>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-[#1C1C1C] border border-gray-800 rounded-xl p-6 hover:border-purple-500 transition-all"
            >
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                <p className="text-white">{benefit}</p>
              </div>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="bg-[#1C1C1C] border-2 border-purple-500/30 rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-6 text-center">
            <span className="text-white">Nasıl </span>
            <span className="bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent">Çalışır?</span>
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center mx-auto mb-4 text-black font-bold text-xl shadow-[0_0_20px_rgba(255,215,0,0.5)]">
                1
              </div>
              <h4 className="text-white font-semibold mb-2">Satın Al</h4>
              <p className="text-gray-400 text-sm">Butona tıklayarak talep oluştur</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center mx-auto mb-4 text-black font-bold text-xl shadow-[0_0_20px_rgba(255,215,0,0.5)]">
                2
              </div>
              <h4 className="text-white font-semibold mb-2">Onay Bekle</h4>
              <p className="text-gray-400 text-sm">Admin talebini hızlıca onaylar</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center mx-auto mb-4 text-black font-bold text-xl shadow-[0_0_20px_rgba(255,215,0,0.5)]">
                3
              </div>
              <h4 className="text-white font-semibold mb-2">Aktifleş</h4>
              <p className="text-gray-400 text-sm">30 günlük üyeliğin başlar</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center mx-auto mb-4 text-black font-bold text-xl shadow-[0_0_20px_rgba(255,215,0,0.5)]">
                4
              </div>
              <h4 className="text-white font-semibold mb-2">Keyfini Çıkar</h4>
              <p className="text-gray-400 text-sm">Özel fiyatlarla alışveriş yap</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BozPlus;
