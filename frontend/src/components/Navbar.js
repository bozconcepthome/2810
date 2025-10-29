import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Instagram, Crown, ChevronDown, Package, LogOut, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Button } from './ui/button';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const accountMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setAccountMenuOpen(false);
    navigate('/');
  };

  return (
    <nav
      data-testid="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-black/95 backdrop-blur-lg shadow-2xl border-b border-gray-800'
          : 'bg-black/40 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" data-testid="logo-link" className="flex items-center space-x-2 transition-transform hover:scale-105">
            <img
              src="https://customer-assets.emergentagent.com/job_b295a86f-9e3f-46e9-b312-d8a568042b59/artifacts/sggtoyzw_assets_client_upload_media_8770e291c8248ccfb52eae7c92887d4e18d907a5_media_01jw37p102f5pajm4m2ckmt4gk.png"
              alt="Boz Concept Home"
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              data-testid="nav-home"
              className="text-sm font-medium text-white hover:text-[#C9A962] transition-all"
            >
              Anasayfa
            </Link>
            <Link
              to="/products"
              data-testid="nav-products"
              className="text-sm font-medium text-white hover:text-[#C9A962] transition-all"
            >
              Ürünler
            </Link>
            
            {/* BOZ PLUS Link - Always Visible */}
            <Link
              to="/boz-plus"
              data-testid="nav-boz-plus"
              className="flex items-center gap-1 text-sm font-medium bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent hover:from-[#A855F7] hover:to-[#8B5CF6] transition-all"
            >
              <Crown className="w-4 h-4 text-purple-400" />
              BOZ PLUS
            </Link>
            
            <Link
              to="/cart"
              data-testid="nav-cart"
              className="text-sm font-medium text-white hover:text-[#C9A962] transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
            </Link>
            
            {/* Instagram Link */}
            <a
              href="https://instagram.com/bozconcepthome"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-[#C9A962] transition-all duration-300 hover:scale-110"
              aria-label="Instagram'da Bizi Takip Edin"
            >
              <Instagram className="w-5 h-5" />
            </a>
            
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Shopping Cart Icon */}
                <Link
                  to="/cart"
                  className="relative text-white hover:text-[#C9A962] transition-all duration-300 hover:scale-110"
                  aria-label="Sepet"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#8B5CF6] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Account Dropdown */}
                <div className="relative" ref={accountMenuRef}>
                  <button
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="flex items-center gap-2 text-white hover:text-[#C9A962] transition-all"
                  >
                    <div className="flex flex-col items-end">
                      {user.is_boz_plus && (
                        <span className="text-[10px] font-bold bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent uppercase tracking-wider">
                          ⭐ BOZ PLUS ⭐
                        </span>
                      )}
                      <span className={`text-sm font-medium ${
                        user.is_boz_plus 
                          ? 'bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent font-bold' 
                          : 'text-white'
                      }`}>
                        Hesabım
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {accountMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#1C1C1C] border border-gray-800 rounded-xl shadow-xl overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-gray-800">
                        <p className={`font-semibold ${
                          user.is_boz_plus 
                            ? 'bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent' 
                            : 'text-white'
                        }`}>
                          {user.full_name}
                        </p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>

                      <div className="py-2">
                        <Link
                          to="/orders"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-white hover:bg-gray-800 transition-colors"
                        >
                          <Package className="w-4 h-4" />
                          <span>Siparişlerim</span>
                        </Link>

                        <Link
                          to="/boz-plus"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-white hover:bg-gray-800 transition-colors"
                        >
                          <Crown className="w-4 h-4 text-purple-400" />
                          <span className={user.is_boz_plus ? 'bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent font-semibold' : ''}>
                            {user.is_boz_plus ? 'BOZ PLUS ✓' : 'BOZ PLUS'}
                          </span>
                        </Link>

                        <Link
                          to="/about"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-white hover:bg-gray-800 transition-colors"
                        >
                          <Info className="w-4 h-4" />
                          <span>Hakkımızda</span>
                        </Link>
                      </div>

                      <div className="border-t border-gray-800">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2 w-full text-red-400 hover:bg-gray-800 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Çıkış Yap</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link to="/auth" data-testid="nav-login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-[#C9A962]/20 hover:text-[#C9A962]"
                >
                  <User className="w-4 h-4 mr-2" />
                  Giriş
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu & Cart Buttons */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Mobile Cart Icon */}
            {user && (
              <Link
                to="/cart"
                className="relative text-white hover:text-[#C9A962] transition-all duration-300"
                aria-label="Sepet"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#8B5CF6] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              data-testid="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/98 backdrop-blur-lg shadow-2xl border-t border-gray-800" data-testid="mobile-menu">
          <div className="px-4 py-6 space-y-4">
            <Link
              to="/"
              data-testid="mobile-nav-home"
              className="block text-white hover:text-[#C9A962] transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Anasayfa
            </Link>
            <Link
              to="/products"
              data-testid="mobile-nav-products"
              className="block text-white hover:text-[#C9A962] transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Ürünler
            </Link>
            <Link
              to="/cart"
              data-testid="mobile-nav-cart"
              className="block text-white hover:text-[#C9A962] transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sepet
            </Link>
            
            {/* Instagram Link */}
            <a
              href="https://instagram.com/bozconcepthome"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-white hover:text-[#C9A962] transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Instagram className="w-5 h-5" />
              <span>Instagram'da Bizi Takip Edin</span>
            </a>
            
            {user ? (
              <>
                {/* User info with BOZ PLUS styling */}
                <div className="pb-4 border-b border-gray-800">
                  {user.is_boz_plus && (
                    <span className="text-xs font-bold bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent uppercase tracking-wider block mb-1">
                      ⭐ BOZ PLUS ÜYE ⭐
                    </span>
                  )}
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-white" />
                    <span className={`font-medium ${
                      user.is_boz_plus 
                        ? 'bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent font-bold text-lg' 
                        : 'text-white'
                    }`}>
                      {user.full_name}
                    </span>
                  </div>
                </div>
                
                <Link
                  to="/boz-plus"
                  className={`block font-extrabold transition-all duration-300 ${
                    user.is_boz_plus 
                      ? 'bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent' 
                      : 'bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {user.is_boz_plus ? '👑 BOZ PLUS ✓' : '✨ BOZ PLUS Satın Al'}
                </Link>
                
                <Link
                  to="/orders"
                  data-testid="mobile-nav-orders"
                  className="block text-white hover:text-[#C9A962] transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Siparişlerim
                </Link>
                <button
                  data-testid="mobile-logout-button"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-white hover:text-[#C9A962] transition"
                >
                  Çıkış
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                data-testid="mobile-nav-login"
                className="block text-white hover:text-[#C9A962] transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Giriş / Kayıt
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;