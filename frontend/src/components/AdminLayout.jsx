import React, { useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, Box, ShoppingCart, Users, Image, 
  ArrowLeft, ShieldCheck, LogOut, FolderOpen
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, loading, logout } = useAuth();

  // Route security block
  useEffect(() => {
    if (!loading) {
      if (!token) {
        navigate('/login');
      } else if (user && user.role !== 'admin') {
        navigate('/profile'); // customer tries to access admin
      }
    }
  }, [user, token, loading, navigate]);

  if (loading) {
    return <div className="p-12 text-center text-stone-500 font-light">Authorizing admin access...</div>;
  }

  if (!user || user.role !== 'admin') return null;

  const menuItems = [
    { path: '/admin', label: 'Analytics Overview', icon: BarChart3 },
    { path: '/admin/products', label: 'Products Catalog', icon: Box },
    { path: '/admin/categories', label: 'Categories Management', icon: FolderOpen },
    { path: '/admin/orders', label: 'Orders Registry', icon: ShoppingCart },
    { path: '/admin/users', label: 'User Database', icon: Users },
    { path: '/admin/gallery', label: 'Gallery Showcase', icon: Image }
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row">
      
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-stone-900 text-stone-300 flex flex-col border-r border-stone-850 shrink-0">
        
        {/* Sidebar Header */}
        <div className="p-6 bg-stone-950 flex items-center space-x-2 text-white border-b border-stone-900">
          <ShieldCheck className="h-6 w-6 text-primary-500" />
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-wider leading-none">ADMIN PANEL</span>
            <span className="text-[10px] text-stone-400 font-light mt-1">BIRUH TESFA</span>
          </div>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 p-4 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/10'
                    : 'hover:bg-stone-800 hover:text-white text-stone-400'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 bg-stone-950/40 border-t border-stone-850 flex flex-col gap-2">
          <Link to="/profile" className="flex items-center space-x-2 text-xs text-stone-400 hover:text-white px-4 py-2 rounded-lg hover:bg-stone-800 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Customer Portal</span>
          </Link>
          <button 
            onClick={() => {
              logout();
              navigate('/login');
            }} 
            className="w-full flex items-center space-x-2 text-xs text-red-400 hover:text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          {children || <Outlet />}
        </div>
      </main>

    </div>
  );
};

export default AdminLayout;
