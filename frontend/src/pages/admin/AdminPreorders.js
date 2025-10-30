import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  GripVertical, Plus, Edit2, Trash2, Eye, EyeOff, 
  Package, Save, X, Upload, Calendar, Percent, Tag
} from 'lucide-react';
import { toast } from 'sonner';

const AdminPreorders = () => {
  const [preorders, setPreorders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPreorder, setEditingPreorder] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    estimated_price: '',
    estimated_release_date: '',
    image_urls: [],
    category: '',
    discount_percentage: 0,
    is_active: true
  });
  const { getAuthHeader } = useAdminAuth();

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchCategories();
    fetchPreorders();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/categories`, {
        headers: getAuthHeader()
      });
      const cats = response.data.map(c => c.name);
      setCategories(cats);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPreorders = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/preorder-products`, {
        headers: getAuthHeader()
      });
      setPreorders(response.data);
    } catch (error) {
      console.error('Error fetching preorders:', error);
      toast.error('Ön siparişler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(preorders);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    setPreorders(updatedItems);

    try {
      await axios.post(
        `${API_URL}/api/admin/preorder-products/reorder`,
        { preorders: updatedItems.map(p => ({ id: p.id, order: p.order })) },
        { headers: getAuthHeader() }
      );
      toast.success('✅ Sıralama güncellendi');
    } catch (error) {
      console.error('Error reordering:', error);
      toast.error('Sıralama kaydedilemedi');
      fetchPreorders();
    }
  };

  const resetForm = () => {
    setFormData({
      product_name: '',
      description: '',
      estimated_price: '',
      estimated_release_date: '',
      image_urls: [],
      category: categories[0] || '',
      discount_percentage: 0,
      is_active: true
    });
    setSelectedCategoryIndex(0);
    setEditingPreorder(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (preorder) => {
    setFormData({
      product_name: preorder.product_name,
      description: preorder.description || '',
      estimated_price: preorder.estimated_price,
      estimated_release_date: preorder.estimated_release_date || '',
      image_urls: preorder.image_urls || [],
      category: preorder.category || '',
      discount_percentage: preorder.discount_percentage || 0,
      is_active: preorder.is_active
    });
    
    const catIndex = categories.findIndex(c => c === preorder.category);
    setSelectedCategoryIndex(catIndex !== -1 ? catIndex : 0);
    
    setEditingPreorder(preorder);
    setShowModal(true);
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

    setUploadingImages(true);
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

      setFormData(prev => ({
        ...prev,
        image_urls: [...prev.image_urls, ...uploadedUrls]
      }));
      
      toast.success(`✅ ${files.length} görsel yüklendi`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Görsel yükleme başarısız');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.product_name.trim() || !formData.estimated_price) {
      toast.error('Ürün adı ve fiyat zorunludur');
      return;
    }

    const submitData = {
      ...formData,
      estimated_price: parseFloat(formData.estimated_price),
      discount_percentage: parseInt(formData.discount_percentage) || 0,
      image_urls: formData.image_urls.filter(url => url.trim() !== '')
    };

    try {
      if (editingPreorder) {
        await axios.put(
          `${API_URL}/api/admin/preorder-products/${editingPreorder.id}`,
          submitData,
          { headers: getAuthHeader() }
        );
        toast.success('✅ Ön sipariş ürünü güncellendi');
      } else {
        await axios.post(
          `${API_URL}/api/admin/preorder-products`,
          submitData,
          { headers: getAuthHeader() }
        );
        toast.success('✅ Ön sipariş ürünü eklendi');
      }
      
      setShowModal(false);
      resetForm();
      fetchPreorders();
    } catch (error) {
      console.error('Error saving preorder:', error);
      toast.error(error.response?.data?.detail || 'Kaydetme başarısız');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name}" ön sipariş ürününü silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/admin/preorder-products/${id}`, {
        headers: getAuthHeader()
      });
      toast.success('✅ Ön sipariş ürünü silindi');
      fetchPreorders();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Silme başarısız');
    }
  };

  const handleToggleActive = async (preorder) => {
    try {
      await axios.put(
        `${API_URL}/api/admin/preorder-products/${preorder.id}`,
        { is_active: !preorder.is_active },
        { headers: getAuthHeader() }
      );
      toast.success(preorder.is_active ? '👁️ Gizlendi' : '✅ Gösteriliyor');
      fetchPreorders();
    } catch (error) {
      console.error('Error toggling:', error);
      toast.error('Durum güncellenemedi');
    }
  };

  const addImageUrl = () => {
    setFormData({
      ...formData,
      image_urls: [...formData.image_urls, '']
    });
  };

  const removeImageUrl = (index) => {
    const newUrls = formData.image_urls.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      image_urls: newUrls.length > 0 ? newUrls : ['']
    });
  };

  const updateImageUrl = (index, value) => {
    const newUrls = [...formData.image_urls];
    newUrls[index] = value;
    setFormData({
      ...formData,
      image_urls: newUrls
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Ön Sipariş Ürünleri
          </h1>
          <p className="text-gray-400 mt-2">Yakında çıkacak ürünleri yönetin</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:scale-105 transition-all duration-200 shadow-lg shadow-purple-500/30"
        >
          <Plus size={22} />
          Yeni Ön Sipariş Ürünü
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Toplam Ön Sipariş</p>
          <p className="text-3xl font-bold text-white mt-1">{preorders.length}</p>
        </div>
        <div className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Aktif</p>
          <p className="text-3xl font-bold text-green-500 mt-1">
            {preorders.filter(p => p.is_active).length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Gizli</p>
          <p className="text-3xl font-bold text-red-500 mt-1">
            {preorders.filter(p => !p.is_active).length}
          </p>
        </div>
      </div>

      {/* Preorders List */}
      <div className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <GripVertical className="text-purple-500" />
          Ön Sipariş Ürünleri (Sürükle & Bırak)
        </h2>

        {preorders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Henüz ön sipariş ürünü yok</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="preorders">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`space-y-3 ${snapshot.isDraggingOver ? 'bg-purple-500/5 rounded-xl p-2' : ''}`}
                >
                  {preorders.map((preorder, index) => (
                    <Draggable key={preorder.id} draggableId={preorder.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`bg-[#0A0A0A] border rounded-xl p-5 flex items-center gap-4 ${
                            snapshot.isDragging ? 'shadow-2xl border-purple-500 scale-105' : 'border-gray-700'
                          } transition-all duration-200`}
                        >
                          {/* Drag Handle */}
                          <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-purple-500">
                            <GripVertical size={28} />
                          </div>

                          {/* Order Number */}
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">{index + 1}</span>
                          </div>

                          {/* Image Preview */}
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-800">
                            {preorder.image_urls && preorder.image_urls[0] ? (
                              <img 
                                src={preorder.image_urls[0]}
                                alt={preorder.product_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="text-gray-600" size={32} />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white font-bold text-lg">{preorder.product_name}</h3>
                              {!preorder.is_active && (
                                <span className="px-2 py-1 bg-red-500/20 border border-red-500 rounded text-red-400 text-xs font-semibold">
                                  Gizli
                                </span>
                              )}
                              {preorder.discount_percentage > 0 && (
                                <span className="px-2 py-1 bg-green-500/20 border border-green-500 rounded text-green-400 text-xs font-semibold">
                                  -%{preorder.discount_percentage}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm line-clamp-1">{preorder.description || 'Açıklama yok'}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="text-purple-400 font-semibold">~{preorder.estimated_price} ₺</span>
                              {preorder.category && (
                                <span className="text-gray-500">{preorder.category}</span>
                              )}
                              {preorder.estimated_release_date && (
                                <span className="text-gray-500">
                                  📅 {new Date(preorder.estimated_release_date).toLocaleDateString('tr-TR')}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleActive(preorder)}
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                              title={preorder.is_active ? "Gizle" : "Göster"}
                            >
                              {preorder.is_active ? (
                                <Eye className="text-green-500" size={20} />
                              ) : (
                                <EyeOff className="text-red-500" size={20} />
                              )}
                            </button>

                            <button
                              onClick={() => openEditModal(preorder)}
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <Edit2 className="text-blue-500" size={20} />
                            </button>

                            <button
                              onClick={() => handleDelete(preorder.id, preorder.product_name)}
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <Trash2 className="text-red-500" size={20} />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-700 rounded-2xl p-8 max-w-3xl w-full my-8">
            <h2 className="text-3xl font-bold text-white mb-6">
              {editingPreorder ? 'Ön Sipariş Ürünü Düzenle' : 'Yeni Ön Sipariş Ürünü'}
            </h2>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {/* Product Name */}
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2 flex items-center gap-2">
                  <Tag size={16} className="text-purple-500" />
                  Ürün Adı *
                </label>
                <input
                  type="text"
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  placeholder="Örn: Lüks Ahşap Dresuar"
                  className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ürün hakkında detaylı bilgi..."
                  rows={3}
                  className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
                />
              </div>

              {/* Price & Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2">
                    Tahmini Fiyat (₺) *
                  </label>
                  <input
                    type="number"
                    value={formData.estimated_price}
                    onChange={(e) => setFormData({ ...formData, estimated_price: e.target.value })}
                    placeholder="1500"
                    className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2 flex items-center gap-2">
                    <Percent size={16} className="text-green-500" />
                    İndirim Oranı (%)
                  </label>
                  <input
                    type="number"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                    placeholder="15"
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              {/* Category & Release Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2">
                    Kategori
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Örn: Dresuar"
                    className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2 flex items-center gap-2">
                    <Calendar size={16} className="text-blue-500" />
                    Tahmini Çıkış Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.estimated_release_date}
                    onChange={(e) => setFormData({ ...formData, estimated_release_date: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              {/* Image URLs */}
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2 flex items-center gap-2">
                  <Upload size={16} className="text-purple-500" />
                  Ürün Görselleri (URL)
                </label>
                <div className="space-y-3">
                  {formData.image_urls.map((url, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => updateImageUrl(index, e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 px-4 py-3 bg-black border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                      />
                      {formData.image_urls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageUrl(index)}
                          className="p-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500 rounded-lg transition-colors"
                        >
                          <X size={18} className="text-red-500" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    Görsel Ekle
                  </button>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-4 bg-black/50 rounded-xl">
                <span className="text-gray-300 font-semibold">Ürün Durumu</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    formData.is_active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}
                >
                  {formData.is_active ? 'Aktif' : 'Gizli'}
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <X size={20} />
                İptal
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Save size={20} />
                {editingPreorder ? 'Güncelle' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPreorders;
