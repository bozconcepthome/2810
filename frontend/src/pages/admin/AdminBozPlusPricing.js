import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { Crown, Save, Search } from 'lucide-react';
import { toast } from 'sonner';

const AdminBozPlusPricing = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedPrices, setEditedPrices] = useState({});
  const { getAuthHeader } = useAdminAuth();

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/products`, {
        headers: getAuthHeader()
      });
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Ürünler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (productId, value) => {
    setEditedPrices(prev => ({
      ...prev,
      [productId]: value
    }));
  };

  const handleSave = async (productId) => {
    if (!editedPrices[productId]) return;

    setSaving(true);
    try {
      await axios.put(
        `${API_URL}/api/admin/products/${productId}`,
        { boz_plus_price: parseFloat(editedPrices[productId]) || null },
        { headers: getAuthHeader() }
      );
      
      toast.success('BOZ PLUS fiyat güncellendi');
      
      // Update local state
      setProducts(prev => prev.map(p => 
        p.id === productId 
          ? { ...p, boz_plus_price: parseFloat(editedPrices[productId]) || null }
          : p
      ));
      
      // Clear edited price
      setEditedPrices(prev => {
        const newPrices = { ...prev };
        delete newPrices[productId];
        return newPrices;
      });
    } catch (error) {
      console.error('Error updating price:', error);
      toast.error('Fiyat güncellenemedi');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    if (Object.keys(editedPrices).length === 0) {
      toast.error('Değişiklik yapılmadı');
      return;
    }

    setSaving(true);
    let successCount = 0;
    let errorCount = 0;

    for (const [productId, price] of Object.entries(editedPrices)) {
      try {
        await axios.put(
          `${API_URL}/api/admin/products/${productId}`,
          { boz_plus_price: parseFloat(price) || null },
          { headers: getAuthHeader() }
        );
        successCount++;
      } catch (error) {
        console.error('Error updating price for product:', productId, error);
        errorCount++;
      }
    }

    setSaving(false);
    
    if (errorCount === 0) {
      toast.success(`${successCount} ürün fiyatı güncellendi!`);
      setEditedPrices({});
      fetchProducts();
    } else {
      toast.error(`${successCount} başarılı, ${errorCount} hatalı`);
    }
  };

  const calculateSavings = (product) => {
    const regularPrice = product.discounted_price || product.price;
    const bozPlusPrice = product.boz_plus_price;
    
    if (!bozPlusPrice) return 0;
    return ((regularPrice - bozPlusPrice) / regularPrice * 100).toFixed(0);
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
            <h1 className="text-3xl font-bold text-white">BOZ PLUS Fiyat Yönetimi</h1>
            <p className="text-gray-400 mt-1">Tüm ürünler için özel fiyat belirleyin</p>
          </div>
        </div>
        {Object.keys(editedPrices).length > 0 && (
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600
              text-white font-semibold rounded-lg hover:opacity-90 transition-all"
          >
            <Save size={20} />
            <span>{saving ? 'Kaydediliyor...' : `Tümünü Kaydet (${Object.keys(editedPrices).length})`}</span>
          </button>
        )}
      </div>

      {/* Info */}
      <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-4">
        <p className="text-purple-300 text-sm">
          💡 BOZ PLUS fiyatları tüm kullanıcılara gösterilir, ancak sadece BOZ PLUS üyeleri bu fiyattan satın alabilir.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Ürün veya kategori ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-[#1C1C1C] border border-gray-800 rounded-lg text-white
            focus:outline-none focus:ring-2 focus:ring-[#C9A962] focus:border-transparent"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1C1C1C] border border-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Toplam Ürün</p>
          <p className="text-3xl font-bold text-white">{products.length}</p>
        </div>
        <div className="bg-[#1C1C1C] border border-purple-500/30 rounded-lg p-4">
          <p className="text-purple-400 text-sm">BOZ PLUS Fiyatlı</p>
          <p className="text-3xl font-bold text-purple-400">
            {products.filter(p => p.boz_plus_price).length}
          </p>
        </div>
        <div className="bg-[#1C1C1C] border border-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Fiyat Bekleyen</p>
          <p className="text-3xl font-bold text-yellow-400">
            {products.filter(p => !p.boz_plus_price).length}
          </p>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#1C1C1C] border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0A0A0A] border-b border-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Ürün</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Kategori</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Normal Fiyat</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-purple-400">BOZ PLUS Fiyat</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-green-400">Tasarruf</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredProducts.map((product) => {
                const regularPrice = product.discounted_price || product.price;
                const currentBozPlusPrice = editedPrices[product.id] !== undefined 
                  ? editedPrices[product.id] 
                  : product.boz_plus_price || '';
                const savings = calculateSavings(product);

                return (
                  <tr key={product.id} className="hover:bg-[#0A0A0A]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.image_urls?.[0] || '/placeholder.png'}
                          alt={product.product_name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <p className="text-white font-medium text-sm">{product.product_name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-[#C9A962]/20 text-[#C9A962] rounded-full text-xs">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-[#C9A962] font-semibold">₺{regularPrice.toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        step="0.01"
                        value={currentBozPlusPrice}
                        onChange={(e) => handlePriceChange(product.id, e.target.value)}
                        placeholder="Fiyat girin"
                        className="w-32 px-3 py-2 bg-[#0A0A0A] border border-purple-700 rounded-lg text-white text-right
                          focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {product.boz_plus_price && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">
                          %{savings}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editedPrices[product.id] !== undefined && (
                        <button
                          onClick={() => handleSave(product.id)}
                          disabled={saving}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-sm"
                        >
                          Kaydet
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">Ürün bulunamadı</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBozPlusPricing;
