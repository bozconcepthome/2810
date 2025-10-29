import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { ArrowLeft, Upload, X, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

const AdminProductForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { getAuthHeader } = useAdminAuth();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    product_name: '',
    category: '',
    price: '',
    discounted_price: '',
    boz_plus_price: '',
    description: '',
    dimensions: '',
    materials: '',
    colors: '',
    stock_status: 'Stokta',
    stock_amount: '',
    image_urls: []
  });
  const [newImageUrl, setNewImageUrl] = useState('');

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products/${id}`);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Ürün yüklenemedi');
      navigate('/admin/products');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen sadece resim dosyası yükleyin');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await axios.post(
        `${API_URL}/api/admin/upload-image`,
        formDataUpload,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Upload response:', response.data);
      const imageUrl = response.data.image_url;
      console.log('Image URL:', imageUrl);

      setFormData(prev => ({
        ...prev,
        image_urls: [...prev.image_urls, imageUrl]
      }));
      
      toast.success('Görsel başarıyla yüklendi!');
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Check if token expired
      if (error.response?.status === 401 || error.response?.data?.detail?.includes('expired')) {
        toast.error('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 2000);
      } else {
        toast.error('Görsel yüklenemedi: ' + (error.response?.data?.detail || error.message));
      }
    } finally {
      setUploading(false);
    }
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      image_urls: [...prev.image_urls, newImageUrl.trim()]
    }));
    setNewImageUrl('');
    toast.success('Görsel eklendi');
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        discounted_price: formData.discounted_price ? parseFloat(formData.discounted_price) : null,
        boz_plus_price: formData.boz_plus_price ? parseFloat(formData.boz_plus_price) : null,
        stock_amount: formData.stock_amount ? parseInt(formData.stock_amount) : null
      };

      if (isEdit) {
        await axios.put(
          `${API_URL}/api/admin/products/${id}`,
          submitData,
          { headers: getAuthHeader() }
        );
        toast.success('Ürün güncellendi');
      } else {
        await axios.post(
          `${API_URL}/api/admin/products`,
          submitData,
          { headers: getAuthHeader() }
        );
        toast.success('Ürün oluşturuldu');
      }

      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(isEdit ? 'Ürün güncellenemedi' : 'Ürün oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-2 hover:bg-[#1C1C1C] rounded-lg transition-colors"
        >
          <ArrowLeft className="text-white" size={24} />
        </button>
        <h1 className="text-3xl font-bold text-white">
          {isEdit ? 'Ürün Düzenle' : 'Yeni Ürün'}
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-[#1C1C1C] border border-gray-800 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ürün Adı *
            </label>
            <input
              type="text"
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white
                focus:outline-none focus:ring-2 focus:ring-[#C9A962] focus:border-transparent"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Kategori *
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white
                focus:outline-none focus:ring-2 focus:ring-[#C9A962] focus:border-transparent"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fiyat (₺) *
            </label>
            <input
              type="number"
              step="0.01"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white
                focus:outline-none focus:ring-2 focus:ring-[#C9A962] focus:border-transparent"
            />
          </div>

          {/* Discounted Price */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              İndirimli Fiyat (₺)
            </label>
            <input
              type="number"
              step="0.01"
              name="discounted_price"
              value={formData.discounted_price}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white
                focus:outline-none focus:ring-2 focus:ring-[#C9A962] focus:border-transparent"
            />
          </div>
          
          {/* BOZ PLUS Price */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
              <span>BOZ PLUS Fiyat (₺)</span>
              <span className="text-xs text-purple-400">★ Premium</span>
            </label>
            <input
              type="number"
              step="0.01"
              name="boz_plus_price"
              value={formData.boz_plus_price}
              onChange={handleChange}
              placeholder="Özel üye fiyatı"
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-purple-700 rounded-lg text-white
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">BOZ PLUS üyeleri için özel fiyat (opsiyonel)</p>
          </div>

          {/* Stock Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stok Durumu *
            </label>
            <select
              name="stock_status"
              value={formData.stock_status}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white
                focus:outline-none focus:ring-2 focus:ring-[#C9A962] focus:border-transparent"
            >
              <option value="Stokta">Stokta</option>
              <option value="Tükendi">Tükendi</option>
            </select>
          </div>

          {/* Stock Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stok Miktarı
            </label>
            <input
              type="number"
              name="stock_amount"
              value={formData.stock_amount}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white
                focus:outline-none focus:ring-2 focus:ring-[#C9A962] focus:border-transparent"
            />
          </div>

          {/* Dimensions */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ölçüler
            </label>
            <input
              type="text"
              name="dimensions"
              value={formData.dimensions}
              onChange={handleChange}
              placeholder="Örn: 50 x 35"
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white
                focus:outline-none focus:ring-2 focus:ring-[#C9A962] focus:border-transparent"
            />
          </div>

          {/* Materials */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Malzemeler
            </label>
            <input
              type="text"
              name="materials"
              value={formData.materials}
              onChange={handleChange}
              placeholder="Örn: Ahşap, Metal"
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white
                focus:outline-none focus:ring-2 focus:ring-[#C9A962] focus:border-transparent"
            />
          </div>

          {/* Colors */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Renkler
            </label>
            <input
              type="text"
              name="colors"
              value={formData.colors}
              onChange={handleChange}
              placeholder="Örn: Siyah, Beyaz"
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white
                focus:outline-none focus:ring-2 focus:ring-[#C9A962] focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Açıklama
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white
                focus:outline-none focus:ring-2 focus:ring-[#C9A962] focus:border-transparent"
            />
          </div>

          {/* Image Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-4">
              Ürün Görselleri
            </label>

            {/* Upload Button */}
            <div className="mb-4">
              <label className="flex items-center justify-center space-x-2 w-full px-4 py-3 
                bg-[#0A0A0A] border border-dashed border-gray-700 rounded-lg cursor-pointer
                hover:border-[#C9A962] transition-colors">
                <Upload size={20} className="text-gray-400" />
                <span className="text-gray-400">
                  {uploading ? 'Yükleniyor...' : 'Dosya Yükle'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* URL Input */}
            <div className="flex space-x-2 mb-4">
              <div className="flex-1 relative">
                <LinkIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Görsel URL'si girin"
                  className="w-full pl-12 pr-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white
                    focus:outline-none focus:ring-2 focus:ring-[#C9A962] focus:border-transparent"
                />
              </div>
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-6 py-3 bg-gradient-to-r from-[#C9A962] to-[#D4AF37] text-black 
                  font-semibold rounded-lg hover:opacity-90 transition-all"
              >
                Ekle
              </button>
            </div>

            {/* Image Preview Grid */}
            {formData.image_urls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.image_urls.map((url, index) => {
                  console.log(`Rendering image ${index}:`, url);
                  return (
                    <div key={index} className="relative group">
                      <div className="w-full h-32 bg-gray-800 rounded-lg border-2 border-gray-700 overflow-hidden flex items-center justify-center">
                        <img
                          src={url}
                          alt={`Ürün görseli ${index + 1}`}
                          className="max-w-full max-h-full object-contain"
                          onLoad={(e) => {
                            console.log('✅ Image loaded successfully:', url);
                            e.target.style.display = 'block';
                            e.target.parentElement.style.backgroundColor = '#1f2937';
                          }}
                          onError={(e) => {
                            console.error('❌ Failed to load image:', url);
                            e.target.style.display = 'none';
                            const parent = e.target.parentElement;
                            parent.style.backgroundColor = '#1f2937';
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'text-red-400 text-xs text-center px-2 py-4';
                            errorDiv.textContent = 'Görsel yüklenemedi';
                            if (!parent.querySelector('.text-red-400')) {
                              parent.appendChild(errorDiv);
                            }
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full 
                          opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Görseli kaldır"
                      >
                        <X size={16} className="text-white" />
                      </button>
                      {/* Image URL display for debugging */}
                      <div className="mt-1 text-xs text-gray-400 truncate bg-gray-800 p-1 rounded" title={url}>
                        {url.split('/').pop()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center space-x-4 mt-8 pt-6 border-t border-gray-800">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-[#C9A962] to-[#D4AF37] text-black 
              font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? 'Kaydediliyor...' : (isEdit ? 'Güncelle' : 'Oluştur')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-8 py-3 bg-gray-700 text-white font-semibold rounded-lg 
              hover:bg-gray-600 transition-all"
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
