import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, Grid, List } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.minPrice) params.append('min_price', filters.minPrice);
      if (filters.maxPrice) params.append('max_price', filters.maxPrice);

      const response = await axios.get(`${API_URL}/products?${params.toString()}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      search: '',
      minPrice: '',
      maxPrice: '',
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-black" data-testid="products-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A962]/10 rounded-full mb-4">
            <span className="text-sm font-semibold text-[#C9A962] uppercase tracking-wide">Koleksiyon</span>
          </div>
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Ürünler
          </h1>
          <p className="text-gray-400 text-lg">Tüm koleksiyonumuzu keşfedin</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-72 space-y-6" data-testid="filters-sidebar">
            <div className="bg-[#1C1C1C] rounded-2xl shadow-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-white flex items-center text-lg">
                  <Filter className="w-5 h-5 mr-2 text-[#C9A962]" />
                  Filtreler
                </h3>
                <Button
                  data-testid="clear-filters-button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs text-[#C9A962] hover:text-[#A78D4E] hover:bg-[#C9A962]/10"
                >
                  Temizle
                </Button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-2">Ara</label>
                <Input
                  data-testid="search-input"
                  type="text"
                  placeholder="Ürün ara..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="bg-black border-gray-700 text-white placeholder:text-gray-600 focus:border-[#C9A962] focus:ring-[#C9A962]"
                />
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-2">Kategori</label>
                <Select
                  value={filters.category || "all"}
                  onValueChange={(value) => handleFilterChange('category', value === "all" ? "" : value)}
                >
                  <SelectTrigger data-testid="category-select" className="bg-black border-gray-700 text-white focus:border-[#C9A962] focus:ring-[#C9A962]">
                    <SelectValue placeholder="Tüm Kategoriler" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C1C1C] border-gray-700">
                    <SelectItem value="all" className="text-white hover:bg-[#C9A962]/20">Tüm Kategoriler</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-white hover:bg-[#C9A962]/20">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-2">Fiyat Aralığı</label>
                <div className="flex gap-2">
                  <Input
                    data-testid="min-price-input"
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="bg-black border-gray-700 text-white placeholder:text-gray-600 focus:border-[#C9A962] focus:ring-[#C9A962]"
                  />
                  <Input
                    data-testid="max-price-input"
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="bg-black border-gray-700 text-white placeholder:text-gray-600 focus:border-[#C9A962] focus:ring-[#C9A962]"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {/* View Toggle */}
            <div className="flex justify-between items-center mb-8 bg-[#1C1C1C] rounded-xl p-4 shadow-md border border-gray-800">
              <p className="text-gray-400 font-medium">
                <span className="text-[#C9A962] font-bold text-lg">{products.length}</span> ürün bulundu
              </p>
              <div className="flex gap-2">
                <Button
                  data-testid="grid-view-button"
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-[#C9A962] hover:bg-[#A78D4E]' : 'border-gray-700 text-gray-400 hover:border-[#C9A962] hover:text-[#C9A962]'}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  data-testid="list-view-button"
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-[#C9A962] hover:bg-[#A78D4E]' : 'border-gray-700 text-gray-400 hover:border-[#C9A962] hover:text-[#C9A962]'}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#C9A962] border-t-transparent mx-auto" />
                <p className="mt-4 text-gray-400">Yükleniyor...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-[#1C1C1C] rounded-2xl shadow-lg border border-gray-800" data-testid="no-products-message">
                <p className="text-gray-400 text-lg">Ürün bulunamadı</p>
              </div>
            ) : (
              <div
                className={`gap-6 ${ viewMode === 'grid'
                    ? 'columns-1 sm:columns-2 lg:columns-3 space-y-6'
                    : 'grid grid-cols-1 gap-6'
                }`}
                data-testid="products-grid"
              >
                {products.map((product, idx) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    data-testid={`product-item-${product.id}`}
                    className={`group bg-[#1C1C1C] rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 break-inside-avoid opacity-0 animate-fade-in-up border border-gray-800 ${
                      viewMode === 'list' ? 'flex' : 'inline-block w-full'
                    }`}
                    style={{
                      animationDelay: `${0.05 * (idx % 20)}s`,
                      animationFillMode: 'forwards'
                    }}
                  >
                    <div
                      className={`relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 ${
                        viewMode === 'list' ? 'w-56 h-56 flex-shrink-0' : 'w-full aspect-[3/4]'
                      }`}
                    >
                      {product.image_urls && product.image_urls[0] && (
                        <img
                          src={product.image_urls[0]}
                          alt={product.product_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      )}
                      
                      {/* Gold accent on hover */}
                      <div className="absolute top-4 right-4 w-2 h-2 bg-[#E6C888] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg shadow-[#E6C888]/50"></div>
                    </div>
                    <div className="p-5 flex-1">
                      <span className="text-xs text-[#C9A962] uppercase tracking-wide font-semibold">
                        {product.category}
                      </span>
                      <h3 className="font-bold text-white mt-2 mb-3 line-clamp-2 text-base group-hover:text-[#C9A962] transition">
                        {product.product_name}
                      </h3>
                      {viewMode === 'list' && product.description && (
                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-[#C9A962]">
                          {product.discounted_price || product.price} ₺
                        </span>
                        <span className="text-xs bg-gradient-to-r from-green-900/50 to-emerald-900/50 text-green-400 px-3 py-1 rounded-full font-medium border border-green-800">
                          {product.stock_status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;