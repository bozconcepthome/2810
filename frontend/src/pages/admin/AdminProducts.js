import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`"${productName}" ürününü silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/admin/products/${productId}`, {
        headers: getAuthHeader()
      });
      
      toast.success('Ürün başarıyla silindi');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Ürün silinemedi');
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Ürünler</h1>
          <p className="text-gray-400 mt-1">Toplam {filteredProducts.length} ürün</p>
        </div>
        <Link
          to="/admin/products/new"
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#C9A962] to-[#D4AF37]
            text-black font-semibold rounded-lg hover:opacity-90 transition-all duration-200"
        >
          <Plus size={20} />
          <span>Yeni Ürün</span>
        </Link>
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

      {/* Products Table */}
      <div className="bg-[#1C1C1C] border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0A0A0A] border-b border-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Görsel</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Ürün Adı</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Kategori</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Fiyat</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Stok</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-[#0A0A0A]/50 transition-colors">
                  <td className="px-6 py-4">
                    <img
                      src={product.image_urls?.[0] || '/placeholder.png'}
                      alt={product.product_name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{product.product_name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-[#C9A962]/20 text-[#C9A962] rounded-full text-sm">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[#C9A962] font-semibold">
                      ₺{product.price.toFixed(2)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      product.stock_status === 'Stokta'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {product.stock_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/admin/products/edit/${product.id}`}
                        className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.product_name)}
                        className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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

export default AdminProducts;
