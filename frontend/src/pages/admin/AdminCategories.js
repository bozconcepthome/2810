import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Plus, Edit, Trash2, Eye, EyeOff, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
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
      toast.success('Kategori sırası güncellendi');
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
        { name: newCategoryName.trim() },
        { headers: getAuthHeader() }
      );
      toast.success('Kategori eklendi');
      setNewCategoryName('');
      setShowAddModal(false);
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error(error.response?.data?.detail || 'Kategori eklenemedi');
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (!window.confirm(`"${categoryName}" kategorisini silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/admin/categories/${categoryId}`, {
        headers: getAuthHeader()
      });
      toast.success('Kategori silindi');
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
      toast.success(category.is_active ? 'Kategori gizlendi' : 'Kategori gösterildi');
      fetchCategories();
    } catch (error) {
      console.error('Error toggling category:', error);
      toast.error('Durum güncellenemedi');
    }
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
        <div>
          <h1 className="text-3xl font-bold text-white">Kategori Yönetimi</h1>
          <p className="text-gray-400 mt-1">Kategorileri sürükle-bırak ile sıralayın</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#C9A962] to-[#D4AF37]
            text-black font-semibold rounded-lg hover:opacity-90 transition-all duration-200"
        >
          <Plus size={20} />
          <span>Yeni Kategori</span>
        </button>
      </div>

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-blue-400 text-sm">
          💡 Kategorileri sürükle-bırak yaparak yeniden sıralayabilirsiniz. 
          Ana sitede kategoriler bu sıraya göre gösterilecektir.
        </p>
      </div>

      {/* Categories List */}
      <div className="bg-[#1C1C1C] border border-gray-800 rounded-2xl p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="categories">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {categories.map((category, index) => (
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
                          bg-[#0A0A0A] border border-gray-700 rounded-lg p-4
                          flex items-center justify-between
                          ${snapshot.isDragging ? 'shadow-xl border-[#C9A962]' : ''}
                          transition-all duration-200
                        `}
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          {/* Drag Handle */}
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-[#C9A962]"
                          >
                            <GripVertical size={24} />
                          </div>

                          {/* Order Number */}
                          <div className="flex items-center justify-center w-10 h-10 
                            bg-gradient-to-r from-[#C9A962] to-[#D4AF37] rounded-full">
                            <span className="text-black font-bold">{index + 1}</span>
                          </div>

                          {/* Category Name */}
                          <div className="flex-1">
                            <h3 className="text-white font-semibold">{category.name}</h3>
                            <p className="text-gray-500 text-sm">
                              {category.is_active ? 'Aktif' : 'Gizli'}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => navigate(`/admin/categories/${encodeURIComponent(category.name)}/products`)}
                            className="p-2 hover:bg-[#C9A962]/10 text-[#C9A962] rounded-lg transition-colors"
                            title="Ürünleri Sırala"
                          >
                            <ArrowUpDown size={18} />
                          </button>
                          <button
                            onClick={() => handleToggleActive(category)}
                            className={`p-2 rounded-lg transition-colors ${
                              category.is_active
                                ? 'hover:bg-gray-800 text-green-400'
                                : 'hover:bg-gray-800 text-gray-500'
                            }`}
                            title={category.is_active ? 'Gizle' : 'Göster'}
                          >
                            {category.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id, category.name)}
                            className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={18} />
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

        {categories.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            Henüz kategori bulunmuyor
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1C1C1C] rounded-2xl p-6 w-full max-w-md border border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-4">Yeni Kategori</h2>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Kategori adı..."
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white
                focus:outline-none focus:ring-2 focus:ring-[#C9A962] focus:border-transparent mb-4"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <div className="flex items-center space-x-3">
              <button
                onClick={handleAddCategory}
                className="flex-1 py-3 bg-gradient-to-r from-[#C9A962] to-[#D4AF37] text-black 
                  font-semibold rounded-lg hover:opacity-90 transition-all"
              >
                Ekle
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCategoryName('');
                }}
                className="flex-1 py-3 bg-gray-700 text-white font-semibold rounded-lg 
                  hover:bg-gray-600 transition-all"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
