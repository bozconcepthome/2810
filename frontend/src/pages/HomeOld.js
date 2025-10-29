import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchFeaturedProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data.categories.slice(0, 6));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setFeaturedProducts(response.data.slice(0, 8));
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Video Section */}
      <section className="relative h-screen overflow-hidden" data-testid="hero-section">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://customer-assets.emergentagent.com/job_b295a86f-9e3f-46e9-b312-d8a568042b59/artifacts/oji4tpag_3714085573074912081.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-4">
          <h1
            data-testid="hero-title"
            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-center mb-6 tracking-tight"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Yaşam Alanlarınızda Estetiği Yeniden Tanımlayın
          </h1>
          <p className="text-lg sm:text-xl text-center mb-8 max-w-2xl" style={{ fontFamily: 'Inter, sans-serif' }}>
            Modern ve minimalist tasarımlarımızla evinize şıklık ve fonksiyonellik katmayı keşfedin
          </p>
          <Link to="/products">
            <Button
              data-testid="hero-cta-button"
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 text-lg rounded-full transition-all duration-300 hover:scale-105"
            >
              Koleksiyonları Keşfet
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white" data-testid="categories-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Öne Çıkan Kategoriler
            </h2>
            <p className="text-gray-600 text-lg">Her stil için kusursuz çözümler</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/products?category=${encodeURIComponent(category)}`}
                data-testid={`category-card-${index}`}
                className="group relative overflow-hidden rounded-xl bg-gray-100 aspect-square hover:shadow-2xl transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-xl font-semibold mb-2">{category}</h3>
                  <div className="flex items-center text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Keşfet
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50" data-testid="featured-products-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Popüler Ürünler
            </h2>
            <p className="text-gray-600 text-lg">En çok tercih edilen tasarımlar</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                data-testid={`product-card-${product.id}`}
                className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  {product.image_urls && product.image_urls[0] && (
                    <img
                      src={product.image_urls[0]}
                      alt={product.product_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.product_name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-amber-700">
                      {product.discounted_price || product.price} ₺
                    </span>
                    <span className="text-sm text-gray-500">{product.category}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/products">
              <Button
                data-testid="view-all-products-button"
                size="lg"
                className="bg-gray-900 text-white hover:bg-gray-800 px-8 rounded-full"
              >
                Tüm Ürünleri Gör
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-20 bg-white" data-testid="brand-story-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-8"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Boz Concept Home Felsefesi
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            Modern, endüstriyel ve minimalist tasarım anlayışımızla, yaşam alanlarınızı estetik ve fonksiyonel hale
            getiriyoruz. Kaliteden ödün vermeden, her detayı özenle tasarladığımız ürünlerimizle evinize şıklık
            katıyoruz.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            Sıcak ahşap dokularının soğuk metalin gücüyle buluştuğu eşsiz tasarımlarımızla, modern yaşamın
            konforu ve zevkini bir arada sunuyoruz.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;