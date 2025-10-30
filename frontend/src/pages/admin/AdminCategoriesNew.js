import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  GripVertical, Plus, Edit2, Trash2, Eye, EyeOff, 
  Package, ChevronDown, ChevronUp, Save, X, Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

const AdminCategoriesNew = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [categoryProducts, setCategoryProducts] = useState({});
  const { getAuthHeader } = useAdminAuth();
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/categories`, {
        headers: getAuthHeader()
      });
      setCategories(response.data);
      
      // Fetch products for each category
      const productsData = {};
      for (const cat of response.data) {
        try {
          const productsRes = await axios.get(`${API_URL}/api/products?category=${cat.name}`);
          productsData[cat.id] = productsRes.data;
        } catch (err) {
          console.error(`Error fetching products for ${cat.name}:`, err);
          productsData[cat.id] = [];
        }
      }
      setCategoryProducts(productsData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Kategoriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order property
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    setCategories(updatedItems);

    // Save to backend
    try {
      await axios.post(
        `${API_URL}/api/admin/categories/reorder`,
        {
          categories: updatedItems.map(cat => ({ id: cat.id, order: cat.order }))
        },
        { headers: getAuthHeader() }
      );
      toast.success('✅ Kategori sırası güncellendi');
    } catch (error) {
      console.error('Error reordering categories:', error);
      toast.error('Sıralama kaydedilemedi');
      fetchCategories(); // Revert on error
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Kategori adı boş olamaz');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/admin/categories`,
        { 
          name: newCategoryName.trim(),
          image_url: newCategoryImage.trim() || null
        },
        { headers: getAuthHeader() }
      );
      toast.success('✅ Kategori eklendi');
      setNewCategoryName('');
      setNewCategoryImage('');
      setShowAddModal(false);
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error(error.response?.data?.detail || 'Kategori eklenemedi');
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      toast.error('Kategori adı boş olamaz');
      return;
    }

    try {
      await axios.put(
        `${API_URL}/api/admin/categories/${editingCategory.id}`,
        {
          name: editingCategory.name.trim(),
          image_url: editingCategory.image_url || null,
          is_active: editingCategory.is_active
        },
        { headers: getAuthHeader() }
      );
      toast.success('✅ Kategori güncellendi');
      setEditingCategory(null);
      setShowEditModal(false);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error(error.response?.data?.detail || 'Kategori güncellenemedi');
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    const productsInCategory = categoryProducts[categoryId]?.length || 0;
    
    if (productsInCategory > 0) {
      const confirmed = window.confirm(
        `"${categoryName}" kategorisinde ${productsInCategory} adet ürün var. Silmek istediğinize emin misiniz? Bu kategorideki ürünler kategorisiz kalacaktır.`
      );
      if (!confirmed) return;
    } else {
      const confirmed = window.confirm(`"${categoryName}" kategorisini silmek istediğinize emin misiniz?`);
      if (!confirmed) return;
    }

    try {
      await axios.delete(`${API_URL}/api/admin/categories/${categoryId}`, {
        headers: getAuthHeader()
      });
      toast.success('✅ Kategori silindi');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error.response?.data?.detail || 'Kategori silinemedi');
    }
  };

  const handleToggleActive = async (category) => {
    try {
      await axios.put(
        `${API_URL}/api/admin/categories/${category.id}`,
        { is_active: !category.is_active },
        { headers: getAuthHeader() }
      );
      toast.success(category.is_active ? '👁️ Kategori gizlendi' : '✅ Kategori gösterildi');
      fetchCategories();
    } catch (error) {
      console.error('Error toggling category:', error);
      toast.error('Durum güncellenemedi');
    }
  };

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const openEditModal = (category) => {
    setEditingCategory({ ...category });
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#C9A962] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#C9A962] to-[#E6C888] bg-clip-text text-transparent">
            Kategori Yönetimi
          </h1>
          <p className="text-gray-400 mt-2">Kategorileri sürükle-bırak ile sıralayın ve düzenleyin</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#C9A962] to-[#E6C888]
            text-black font-bold rounded-xl hover:scale-105 transition-all duration-200 shadow-lg shadow-[#C9A962]/30"
        >
          <Plus size={22} />
          <span>Yeni Kategori Ekle</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Toplam Kategori</p>
              <p className="text-3xl font-bold text-white mt-1">{categories.length}</p>
            </div>
            <Package className="w-12 h-12 text-[#C9A962]" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Aktif Kategoriler</p>
              <p className="text-3xl font-bold text-green-500 mt-1">
                {categories.filter(c => c.is_active).length}
              </p>
            </div>
            <Eye className="w-12 h-12 text-green-500" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Gizli Kategoriler</p>
              <p className="text-3xl font-bold text-red-500 mt-1">
                {categories.filter(c => !c.is_active).length}
              </p>
            </div>
            <EyeOff className="w-12 h-12 text-red-500" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-400 text-2xl">💡</div>
          <div>
            <p className="text-blue-400 font-semibold">İpuçları:</p>
            <ul className="text-blue-300 text-sm mt-2 space-y-1 list-disc list-inside">
              <li>Kategorileri sürükle-bırak yaparak yeniden sıralayabilirsiniz</li>
              <li>Her kategorideki ürün sayısını görebilirsiniz</li>
              <li>Kategorileri gizleyebilir veya silebilirsiniz</li>
              <li>Kategori isimlerini ve görsellerini düzenleyebilirsiniz</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Categories List with Drag & Drop */}
      <div className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-800 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <GripVertical className="text-[#C9A962]" />
          Kategoriler (Sürükle & Bırak)
        </h2>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="categories">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`space-y-3 ${snapshot.isDraggingOver ? 'bg-[#C9A962]/5 rounded-xl p-2' : ''}`}
              >
                {categories.map((category, index) => {
                  const products = categoryProducts[category.id] || [];
                  const isExpanded = expandedCategories[category.id];
                  
                  return (
                    <Draggable
                      key={category.id}
                      draggableId={category.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`
                            bg-[#0A0A0A] border rounded-xl overflow-hidden
                            ${snapshot.isDragging ? 'shadow-2xl border-[#C9A962] scale-105' : 'border-gray-700'}
                            transition-all duration-200
                          `}
                        >
                          {/* Category Header */}
                          <div className="p-5 flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1">
                              {/* Drag Handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-[#C9A962] transition-colors"
                              >
                                <GripVertical size={28} />
                              </div>

                              {/* Order Number */}
                              <div className="flex items-center justify-center w-12 h-12 
                                bg-gradient-to-r from-[#C9A962] to-[#E6C888] rounded-full shadow-lg">
                                <span className="text-black font-bold text-lg">{index + 1}</span>
                              </div>

                              {/* Category Info */}
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <h3 className="text-white font-bold text-lg">{category.name}</h3>
                                  {!category.is_active && (
                                    <span className="px-3 py-1 bg-red-500/20 border border-red-500 rounded-full text-red-400 text-xs font-semibold">
                                      Gizli
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-400 text-sm mt-1">
                                  {products.length} ürün
                                </p>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2">
                              {/* Expand/Collapse */}
                              <button
                                onClick={() => toggleCategoryExpansion(category.id)}
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                title={isExpanded ? "Daralt" : "Genişlet"}
                              >
                                {isExpanded ? (
                                  <ChevronUp className="text-gray-400" size={20} />
                                ) : (
                                  <ChevronDown className="text-gray-400" size={20} />
                                )}
                              </button>

                              {/* Toggle Visibility */}
                              <button
                                onClick={() => handleToggleActive(category)}
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                title={category.is_active ? "Gizle" : "Göster"}
                              >
                                {category.is_active ? (
                                  <Eye className="text-green-500" size={20} />
                                ) : (
                                  <EyeOff className="text-red-500" size={20} />
                                )}
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => openEditModal(category)}
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                title="Düzenle"
                              >
                                <Edit2 className="text-blue-500" size={20} />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteCategory(category.id, category.name)}
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                title="Sil"
                              >
                                <Trash2 className="text-red-500" size={20} />
                              </button>

                              {/* Manage Products */}
                              <button
                                onClick={() => navigate(`/admin/categories/${category.name}/products`)}
                                className="px-4 py-2 bg-[#C9A962] text-black rounded-lg font-semibold hover:bg-[#E6C888] transition-colors"
                              >
                                Ürünleri Yönet
                              </button>
                            </div>
                          </div>

                          {/* Expanded Products List */}
                          {isExpanded && (
                            <div className="border-t border-gray-700 bg-black/50 p-5">
                              {products.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {products.map(product => (
                                    <div
                                      key={product.id}
                                      className="flex items-center gap-3 bg-[#1C1C1C] border border-gray-700 rounded-lg p-3 hover:border-[#C9A962] transition-colors"
                                    >
                                      {product.image_urls && product.image_urls[0] ? (
                                        <img 
                                          src={product.image_urls[0]} 
                                          alt={product.product_name}
                                          className="w-12 h-12 object-cover rounded"
                                        />
                                      ) : (
                                        <div className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center">
                                          <Package className="text-gray-600" size={24} />
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm font-medium truncate">
                                          {product.product_name}
                                        </p>
                                        <p className="text-[#C9A962] text-xs font-semibold">
                                          {product.price} ₺
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-500 text-center py-4">
                                  Bu kategoride henüz ürün yok
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Yeni Kategori Ekle</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Kategori Adı *
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Örn: Mutfak Rafı"
                  className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white
                    focus:outline-none focus:border-[#C9A962] transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Kategori Görseli (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  value={newCategoryImage}
                  onChange={(e) => setNewCategoryImage(e.target.value)}
                  placeholder="Görsel URL'si"
                  className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white
                    focus:outline-none focus:border-[#C9A962] transition-colors"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-8">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCategoryName('');
                  setNewCategoryImage('');
                }}
                className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold
                  hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <X size={20} />
                İptal
              </button>
              <button
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#C9A962] to-[#E6C888] text-black
                  rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50
                  disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save size={20} />
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && editingCategory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#1C1C1C] to-black border border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Kategoriyi Düzenle</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Kategori Adı *
                </label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                  placeholder="Kategori adı"
                  className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white
                    focus:outline-none focus:border-[#C9A962] transition-colors"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Kategori Görseli
                </label>
                <input
                  type="text"
                  value={editingCategory.image_url || ''}
                  onChange={(e) => setEditingCategory({...editingCategory, image_url: e.target.value})}
                  placeholder="Görsel URL'si"
                  className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white
                    focus:outline-none focus:border-[#C9A962] transition-colors"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-black/50 rounded-xl">
                <span className="text-gray-300 font-semibold">Kategori Durumu</span>
                <button
                  onClick={() => setEditingCategory({
                    ...editingCategory, 
                    is_active: !editingCategory.is_active
                  })}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    editingCategory.is_active
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {editingCategory.is_active ? 'Aktif' : 'Gizli'}
                </button>
              </div>
            </div>

            <div className="flex space-x-3 mt-8">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCategory(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold
                  hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <X size={20} />
                İptal
              </button>
              <button
                onClick={handleUpdateCategory}
                disabled={!editingCategory.name.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#C9A962] to-[#E6C888] text-black
                  rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50
                  disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save size={20} />
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesNew;
