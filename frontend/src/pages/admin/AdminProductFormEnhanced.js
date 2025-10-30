import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { 
  ArrowLeft, Upload, X, Link as LinkIcon, ChevronUp, ChevronDown,
  Image as ImageIcon, Package, Trash2
} from 'lucide-react';
import { toast } from 'sonner';

const AdminProductFormEnhanced = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { getAuthHeader } = useAdminAuth();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [uploadedImages, setUploadedImages] = useState([]);
  
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
    barcode: '',
    stock_status: 'Stokta',
    stock_amount: '',
    image_urls: []
  });

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/categories`, {
        headers: getAuthHeader()
      });
      const cats = response.data.map(c => c.name);
      setCategories(cats);
      
      if (cats.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: cats[0] }));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products/${id}`);
      const product = response.data;
      setFormData(product);
      setUploadedImages(product.image_urls || []);
      
      // Set category index
      const catIndex = categories.findIndex(c => c === product.category);
      if (catIndex !== -1) {
        setSelectedCategoryIndex(catIndex);
      }
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

  const handleCategoryUp = () => {
    if (selectedCategoryIndex > 0) {
      const newIndex = selectedCategoryIndex - 1;
      setSelectedCategoryIndex(newIndex);
      setFormData(prev => ({ ...prev, category: categories[newIndex] }));
    }
  };

  const handleCategoryDown = () => {
    if (selectedCategoryIndex < categories.length - 1) {
      const newIndex = selectedCategoryIndex + 1;
      setSelectedCategoryIndex(newIndex);
      setFormData(prev => ({ ...prev, category: categories[newIndex] }));
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} bir resim dosyası değil`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} 5MB'dan büyük`);
        return;
      }
    }

    setUploading(true);
    const uploadedUrls = [];

    try {
      for (const file of files) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

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

        uploadedUrls.push(response.data.url);
      }

      setUploadedImages(prev => [...prev, ...uploadedUrls]);
      setFormData(prev => ({
        ...prev,
        image_urls: [...prev.image_urls, ...uploadedUrls]
      }));
      
      toast.success(`${files.length} görsel yüklendi`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Görsel yükleme başarısız');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    setFormData(prev => ({
      ...prev,
      image_urls: newImages
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      discounted_price: formData.discounted_price ? parseFloat(formData.discounted_price) : null,
      boz_plus_price: formData.boz_plus_price ? parseFloat(formData.boz_plus_price) : null,
      stock_amount: formData.stock_amount ? parseInt(formData.stock_amount) : null,
      image_urls: uploadedImages
    };

    try {
      if (isEdit) {
        await axios.put(
          `${API_URL}/api/admin/products/${id}`,
          submitData,
          { headers: getAuthHeader() }
        );
        toast.success('✅ Ürün güncellendi');
      } else {
        await axios.post(
          `${API_URL}/api/admin/products`,
          submitData,
          { headers: getAuthHeader() }
        );
        toast.success('✅ Ürün oluşturuldu');
      }

      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.detail || 'Ürün kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-2 hover:bg-[#1C1C1C] rounded-lg transition-colors"
        >
          <ArrowLeft className="text-white" size={24} />
        </button>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#C9A962] to-[#E6C888] bg-clip-text text-transparent">
          {isEdit ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 rounded-2xl p-8">
        <div className="space-y-8">
          {/* Images Section */}
          <div>
            <label className="block text-lg font-bold text-white mb-4 flex items-center gap-2">
              <ImageIcon className="text-[#C9A962]" size={24} />
              Ürün Görselleri
            </label>

            {/* Upload Button */}
            <div className="mb-4">
              <label className="relative cursor-pointer">
                <div className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#C9A962] to-[#E6C888] hover:from-[#A78D4E] hover:to-[#C9A962] text-black font-bold rounded-xl transition-all duration-200 hover:scale-105">
                  <Upload size={20} />
                  {uploading ? 'Yükleniyor...' : 'Bilgisayardan Görsel Yükle'}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              <p className="text-gray-500 text-sm mt-2">
                Birden fazla resim seçebilirsiniz (Maks: 5MB/resim)
              </p>
            </div>

            {/* Uploaded Images Grid */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {uploadedImages.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Ürün ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg border-2 border-gray-700 group-hover:border-[#C9A962] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} className="text-white" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/80 rounded text-white text-xs font-bold">
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Ürün Adı *
              </label>
              <input
                type="text"
                name="product_name"
                value={formData.product_name}
                onChange={handleChange}
                required
                placeholder="Örn: Lüks Ahşap Dresuar"
                className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white focus:outline-none focus:border-[#C9A962] transition-colors"
              />
            </div>

            {/* Category - Up/Down Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Kategori * (⬆️ ⬇️ ile seçin)
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-4 py-3 bg-gradient-to-r from-[#C9A962]/20 to-[#E6C888]/20 border-2 border-[#C9A962] rounded-xl">
                  <p className="text-white font-bold text-center text-lg">
                    {categories[selectedCategoryIndex] || 'Kategori yok'}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={handleCategoryUp}
                    disabled={selectedCategoryIndex === 0}
                    className="p-2 bg-[#C9A962] hover:bg-[#E6C888] disabled:bg-gray-700 disabled:opacity-50 rounded-lg transition-colors"
                  >
                    <ChevronUp className="text-black" size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={handleCategoryDown}
                    disabled={selectedCategoryIndex === categories.length - 1}
                    className="p-2 bg-[#C9A962] hover:bg-[#E6C888] disabled:bg-gray-700 disabled:opacity-50 rounded-lg transition-colors"
                  >
                    <ChevronDown className="text-black" size={20} />
                  </button>
                </div>
              </div>
              <p className="text-gray-500 text-xs mt-1">
                {selectedCategoryIndex + 1} / {categories.length}
              </p>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Fiyat (₺) *
              </label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                placeholder="1500.00"
                className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white focus:outline-none focus:border-[#C9A962] transition-colors"
              />
            </div>

            {/* Discounted Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                İndirimli Fiyat (₺)
              </label>
              <input
                type="number"
                step="0.01"
                name="discounted_price"
                value={formData.discounted_price}
                onChange={handleChange}
                placeholder="1200.00"
                className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white focus:outline-none focus:border-[#C9A962] transition-colors"
              />
            </div>

            {/* BOZ PLUS Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <Package className="text-purple-500" size={16} />
                BOZ PLUS Fiyatı (₺)
              </label>
              <input
                type="number"
                step="0.01"
                name="boz_plus_price"
                value={formData.boz_plus_price}
                onChange={handleChange}
                placeholder="1000.00"
                className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white focus:outline-none focus:border-[#C9A962] transition-colors"
              />
            </div>

            {/* Stock Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Stok Miktarı
              </label>
              <input
                type="number"
                name="stock_amount"
                value={formData.stock_amount}
                onChange={handleChange}
                placeholder="100"
                className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white focus:outline-none focus:border-[#C9A962] transition-colors"
              />
            </div>

            {/* Barcode */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Barkod
              </label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                placeholder="1234567890"
                className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white focus:outline-none focus:border-[#C9A962] transition-colors"
              />
            </div>

            {/* Colors */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Renkler
              </label>
              <input
                type="text"
                name="colors"
                value={formData.colors}
                onChange={handleChange}
                placeholder="Siyah, Beyaz, Ahşap"
                className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white focus:outline-none focus:border-[#C9A962] transition-colors"
              />
            </div>

            {/* Dimensions */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Boyutlar
              </label>
              <input
                type="text"
                name="dimensions"
                value={formData.dimensions}
                onChange={handleChange}
                placeholder="50cm x 80cm x 120cm"
                className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white focus:outline-none focus:border-[#C9A962] transition-colors"
              />
            </div>

            {/* Materials */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Malzemeler
              </label>
              <input
                type="text"
                name="materials"
                value={formData.materials}
                onChange={handleChange}
                placeholder="Ahşap, Metal, Cam"
                className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white focus:outline-none focus:border-[#C9A962] transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Ürün Açıklaması
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Ürün hakkında detaylı açıklama..."
              className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white focus:outline-none focus:border-[#C9A962] transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#C9A962] to-[#E6C888] text-black font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Kaydediliyor...' : (isEdit ? 'Güncelle' : 'Oluştur')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminProductFormEnhanced;
