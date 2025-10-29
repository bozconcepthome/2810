import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

const AdminCategoryProducts = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { getAuthHeader } = useAdminAuth();
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchCategoryProducts();
  }, [categoryName]);

  const fetchCategoryProducts = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/admin/categories/${encodeURIComponent(categoryName)}/products`,
        { headers: getAuthHeader() }
      );
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching category products:', error);
      toast.error('Ürünler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(products);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update category_order property
    const updatedItems = items.map((item, index) => ({
      ...item,
      category_order: index
    }));

    setProducts(updatedItems);
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      await axios.post(
        `${API_URL}/api/admin/categories/${encodeURIComponent(categoryName)}/products/reorder`,
        {
          products: products.map((p, index) => ({ 
            id: p.id, 
            category_order: index 
          }))
        },
        { headers: getAuthHeader() }
      );
      toast.success('Ürün sırası kaydedildi!');
    } catch (error) {
      console.error('Error saving product order:', error);
      toast.error('Sıralama kaydedilemedi');
    } finally {
      setSaving(false);
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
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/categories')}
            className="p-2 hover:bg-gray-800 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">{categoryName}</h1>
            <p className="text-gray-400 mt-1">Ürün Sıralaması - {products.length} ürün</p>
          </div>
        </div>
        <button
          onClick={handleSaveOrder}
          disabled={saving}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#C9A962] to-[#D4AF37]
            text-black font-semibold rounded-lg hover:opacity-90 transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={20} />
          <span>{saving ? 'Kaydediliyor...' : 'Sıralamayı Kaydet'}</span>
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
        <p className="text-blue-300 text-sm">
          💡 Ürünleri sürükleyerek istediğiniz sıraya koyabilirsiniz. 
          Değişiklikleri kaydetmek için "Sıralamayı Kaydet" butonuna tıklayın.
        </p>
      </div>

      {/* Products List with Drag & Drop */}
      <div className="bg-[#1C1C1C] border border-gray-800 rounded-xl overflow-hidden">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Bu kategoride henüz ürün bulunmuyor</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="products">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="divide-y divide-gray-800"
                >
                  {products.map((product, index) => (
                    <Draggable key={product.id} draggableId={product.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center p-4 hover:bg-gray-800/50 transition ${
                            snapshot.isDragging ? 'bg-gray-800 shadow-xl' : ''
                          }`}
                        >
                          {/* Drag Handle */}
                          <div
                            {...provided.dragHandleProps}
                            className="mr-4 cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical className="w-5 h-5 text-gray-500" />
                          </div>

                          {/* Order Number */}
                          <div className="mr-4">
                            <div className="w-10 h-10 rounded-full bg-[#C9A962] flex items-center justify-center font-bold text-black">
                              {index + 1}
                            </div>
                          </div>

                          {/* Product Image */}
                          {product.image_urls && product.image_urls.length > 0 && (
                            <img
                              src={product.image_urls[0]}
                              alt={product.product_name}
                              className="w-16 h-16 object-cover rounded-lg mr-4"
                            />
                          )}

                          {/* Product Info */}
                          <div className="flex-1">
                            <h3 className="text-white font-semibold">{product.product_name}</h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-400">
                                Fiyat: {product.discounted_price || product.price} ₺
                              </span>
                              {product.boz_plus_price && (
                                <span className="text-sm text-[#C9A962]">
                                  BOZ PLUS: {product.boz_plus_price} ₺
                                </span>
                              )}
                              <span className="text-sm text-gray-500">
                                Stok: {product.stock_status}
                              </span>
                            </div>
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

      {/* Save Button (Bottom) */}
      {products.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleSaveOrder}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#C9A962] to-[#D4AF37]
              text-black font-semibold rounded-lg hover:opacity-90 transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            <span>{saving ? 'Kaydediliyor...' : 'Sıralamayı Kaydet'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminCategoryProducts;
