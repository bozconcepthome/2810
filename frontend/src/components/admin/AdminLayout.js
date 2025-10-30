import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  LogOut, 
  Menu,
  X,
  Layers,
  BarChart3,
  Crown,
  Sparkles
} from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/products', icon: Package, label: 'Ürünler' },
    { path: '/admin/preorders', icon: Sparkles, label: 'Ön Siparişler' },
    { path: '/admin/categories', icon: Layers, label: 'Kategoriler' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Siparişler' },
    { path: '/admin/users', icon: Users, label: 'Kullanıcılar' },
    { path: '/admin/boz-plus', icon: Crown, label: 'BOZ PLUS' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1C1C1C] rounded-lg text-white"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-[#1C1C1C] border-r border-gray-800
          transform transition-transform duration-200 ease-in-out z-40
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-800">
            <h1 className="text-2xl font-bold text-white">
              Boz Concept
            </h1>
            <p className="text-sm text-[#C9A962] mt-1">Admin Panel</p>
          </div>

          {/* Admin Info */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#C9A962] to-[#D4AF37] rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-lg">
                  {admin?.full_name?.charAt(0) || 'A'}
                </span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">{admin?.full_name}</p>
                <p className="text-gray-400 text-xs">{admin?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-[#C9A962] to-[#D4AF37] text-black'
                      : 'text-gray-300 hover:bg-[#0A0A0A]'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg
                text-red-400 hover:bg-red-500/10 transition-all duration-200"
            >
              <LogOut size={20} />
              <span className="font-medium">Çıkış Yap</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Top Bar */}
        <div className="bg-[#1C1C1C] border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white lg:block hidden">
              {menuItems.find(item => item.path === location.pathname)?.label || 'Admin Panel'}
            </h2>
            <div className="lg:hidden">
              <h2 className="text-xl font-semibold text-white ml-12">
                {menuItems.find(item => item.path === location.pathname)?.label || 'Admin Panel'}
              </h2>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
