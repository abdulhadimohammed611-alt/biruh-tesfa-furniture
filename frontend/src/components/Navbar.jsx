import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, X, ShoppingBag, User, Globe, DollarSign, 
  Trash2, Plus, Minus, ShieldAlert, Sparkles 
} from 'lucide-react';

const Navbar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang, toggleLanguage } = useLanguage();
  const { currency, toggleCurrency, formatPrice } = useCurrency();
  const { cartItems, getCartCount, updateQuantity, removeFromCart, getCartTotalUSD, getCartTotalETB } = useCart();
  const { user, logout } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const cartCount = getCartCount();
  const cartTotal = currency === 'ETB' ? getCartTotalETB() : getCartTotalUSD();

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      <nav className="glass sticky top-0 z-40 shadow-sm border-b border-stone-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 text-stone-900 group">
                <div className="p-2 bg-primary-500 rounded-lg text-white group-hover:scale-105 transition-transform duration-300">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold tracking-wider font-display leading-none">BIRUH TESFA</span>
                  <span className="text-[10px] text-stone-500 font-light mt-0.5 tracking-widest uppercase">Furniture</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-stone-700 hover:text-primary-500 font-medium transition-colors">{t('nav.home')}</Link>
              <Link to="/about" className="text-stone-700 hover:text-primary-500 font-medium transition-colors">{t('nav.about')}</Link>
              <Link to="/products" className="text-stone-700 hover:text-primary-500 font-medium transition-colors">{t('nav.products')}</Link>
              <Link to="/lighting" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-ping"></span>
                {t('nav.lighting')}
              </Link>
              <Link to="/gallery" className="text-stone-700 hover:text-primary-500 font-medium transition-colors">{t('nav.gallery')}</Link>
              <Link to="/contact" className="text-stone-700 hover:text-primary-500 font-medium transition-colors">{t('nav.contact')}</Link>
            </div>

            {/* Icons and Controls */}
            <div className="hidden md:flex items-center space-x-6">
              
              {/* Language Switcher */}
              <button 
                onClick={toggleLanguage} 
                className="flex items-center space-x-1 text-stone-600 hover:text-stone-900 p-2 rounded-lg hover:bg-stone-100/50 transition-colors"
                title="Switch Language"
              >
                <Globe className="h-5 w-5 text-stone-500" />
                <span className="text-sm font-semibold">{lang === 'en' ? 'AM' : 'EN'}</span>
              </button>

              {/* Currency Switcher */}
              <button 
                onClick={toggleCurrency} 
                className="flex items-center space-x-1 text-stone-600 hover:text-stone-900 p-2 rounded-lg hover:bg-stone-100/50 transition-colors"
                title="Switch Currency"
              >
                <span className="text-sm font-bold bg-stone-200 text-stone-700 w-6 h-6 rounded-full flex items-center justify-center">
                  {currency === 'ETB' ? '$' : 'ብር'}
                </span>
                <span className="text-xs font-semibold">{currency}</span>
              </button>

              {/* Shopping Cart Button */}
              <button 
                onClick={() => setIsCartOpen(true)} 
                className="relative p-2.5 bg-stone-100/80 rounded-full hover:bg-stone-200/80 text-stone-700 transition-colors"
              >
                <ShoppingBag className="h-5.5 w-5.5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary-500 text-white text-xs font-bold w-5.5 h-5.5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* User Dropdown */}
              <div className="relative">
                {user ? (
                  <div>
                    <button 
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="flex items-center space-x-2 p-1.5 pr-3 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                    </button>
                    
                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-stone-200 py-2 z-50">
                        {user.role === 'admin' && (
                          <Link 
                            to="/admin" 
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-primary-600 hover:bg-stone-50 font-semibold"
                          >
                            <ShieldAlert className="h-4 w-4" />
                            <span>{t('nav.admin')}</span>
                          </Link>
                        )}
                        <Link 
                          to="/profile" 
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                        >
                          <User className="h-4 w-4 text-stone-500" />
                          <span>{t('nav.profile')}</span>
                        </Link>
                        <hr className="my-1 border-stone-100" />
                        <button 
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                        >
                          <X className="h-4 w-4" />
                          <span>{t('nav.logout')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link 
                    to="/login" 
                    className="flex items-center space-x-2 btn-primary !py-2 !px-5 text-sm"
                  >
                    <User className="h-4 w-4" />
                    <span>{t('nav.login')}</span>
                  </Link>
                )}
              </div>

            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <div className="flex items-center space-x-4 md:hidden">
              {/* Language Switch */}
              <button onClick={toggleLanguage} className="text-sm font-bold text-stone-600 bg-stone-100 p-2 rounded-lg">
                {lang === 'en' ? 'AM' : 'EN'}
              </button>
              
              {/* Currency Switch */}
              <button onClick={toggleCurrency} className="text-xs font-bold text-stone-600 bg-stone-100 p-2 rounded-lg">
                {currency}
              </button>

              {/* Cart Toggle */}
              <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-stone-700 bg-stone-100 rounded-full">
                <ShoppingBag className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Burger Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="p-2 text-stone-700 bg-stone-100 rounded-lg"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 bg-white/95 backdrop-blur-md px-4 pt-2 pb-6 space-y-3">
            <Link 
              to="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-stone-700 hover:bg-stone-50 font-medium"
            >
              {t('nav.home')}
            </Link>
            <Link 
              to="/about" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-stone-700 hover:bg-stone-50 font-medium"
            >
              {t('nav.about')}
            </Link>
            <Link 
              to="/products" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-stone-700 hover:bg-stone-50 font-medium"
            >
              {t('nav.products')}
            </Link>
            <Link 
              to="/lighting" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-primary-600 hover:bg-stone-50 font-semibold"
            >
              ⚡ {t('nav.lighting')}
            </Link>
            <Link 
              to="/gallery" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-stone-700 hover:bg-stone-50 font-medium"
            >
              {t('nav.gallery')}
            </Link>
            <Link 
              to="/contact" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-stone-700 hover:bg-stone-50 font-medium"
            >
              {t('nav.contact')}
            </Link>

            <hr className="border-stone-100" />
            
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-3 px-3 py-2">
                  <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900 leading-tight">{user.name}</p>
                    <p className="text-xs text-stone-500">{user.email}</p>
                  </div>
                </div>
                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-primary-600 font-semibold hover:bg-stone-50 rounded-lg"
                  >
                    {t('nav.admin')}
                  </Link>
                )}
                <Link 
                  to="/profile" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-stone-600 hover:bg-stone-50 rounded-lg"
                >
                  {t('nav.profile')}
                </Link>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-center btn-primary"
              >
                {t('nav.login')}
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Cart Slider Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay background */}
          <div 
            className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsCartOpen(false)}
          ></div>
          
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
              
              {/* Header */}
              <div className="px-6 py-5 border-b border-stone-200 flex justify-between items-center bg-stone-50">
                <h2 className="text-lg font-bold text-stone-950 flex items-center space-x-2">
                  <ShoppingBag className="h-5 w-5 text-primary-500" />
                  <span>{t('cart.title')}</span>
                </h2>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 text-stone-500 hover:text-stone-800 hover:bg-stone-200/50 rounded-full transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col justify-center items-center text-center space-y-4">
                    <div className="p-4 bg-stone-100 rounded-full text-stone-400">
                      <ShoppingBag className="h-12 w-12" />
                    </div>
                    <p className="text-stone-500 font-medium">{t('cart.empty')}</p>
                    <button 
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate('/products');
                      }}
                      className="btn-primary !py-2.5 !px-5 text-sm"
                    >
                      {t('home.shop_now')}
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="flex space-x-4 border-b border-stone-100 pb-4">
                      <img 
                        src={item.image} 
                        alt={lang === 'am' ? item.name_am : item.name_en} 
                        className="w-20 h-20 object-cover rounded-lg bg-stone-100 border border-stone-100"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-stone-900 text-sm truncate">
                          {lang === 'am' ? item.name_am : item.name_en}
                        </h4>
                        <p className="text-sm font-semibold text-primary-600 mt-1">
                          {formatPrice(item.price_usd, item.price_etb, lang)}
                        </p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3 mt-2">
                          <div className="flex items-center border border-stone-200 rounded-md">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-stone-100 text-stone-600 transition-colors"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="px-2.5 text-xs font-semibold text-stone-800">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-stone-100 text-stone-600 transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 hover:bg-red-50 text-red-500 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Checkout Info */}
              {cartItems.length > 0 && (
                <div className="px-6 py-6 border-t border-stone-200 bg-stone-50 space-y-4">
                  <div className="flex justify-between items-center text-stone-900 font-bold">
                    <span>{t('cart.total')}:</span>
                    <span className="text-xl text-primary-600 font-display">
                      {formatPrice(
                        getCartTotalUSD(),
                        getCartTotalETB(),
                        lang
                      )}
                    </span>
                  </div>
                  <button 
                    onClick={handleCheckoutClick}
                    className="w-full btn-primary text-center flex items-center justify-center space-x-2"
                  >
                    <span>{t('cart.checkout')}</span>
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
