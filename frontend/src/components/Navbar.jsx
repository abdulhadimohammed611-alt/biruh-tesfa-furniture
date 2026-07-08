import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  Menu, X, ShoppingBag, User, Globe, DollarSign,
  Trash2, Plus, Minus, ShieldAlert, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  mobileMenuVariants,
  buttonMotionProps,
  logoHoverProps,
  EASE_OUT_QUART,
} from '../animations/variants';

const Navbar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, toggleLanguage } = useLanguage();
  const { currency, toggleCurrency, formatPrice } = useCurrency();
  const { cartItems, getCartCount, updateQuantity, removeFromCart, getCartTotalUSD, getCartTotalETB } = useCart();
  const { user, logout } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const cartCount = getCartCount();
  const cartTotal = currency === 'ETB' ? getCartTotalETB() : getCartTotalUSD();

  // ── Detect scroll for navbar shadow ────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  // ── Active link helper ─────────────────────────────────────────────────────
  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `font-medium transition-colors relative ${
      isActive(path)
        ? 'text-primary-600'
        : 'text-stone-700 hover:text-primary-500'
    }`;

  return (
    <>
      {/* ── Animated Navbar ──────────────────────────────────────────────── */}
      <motion.nav
        className="glass sticky top-0 z-40 border-b border-stone-200/50"
        animate={{
          boxShadow: scrolled
            ? '0 4px 24px -4px rgba(0,0,0,0.12), 0 2px 8px -2px rgba(0,0,0,0.06)'
            : '0 1px 3px 0 rgba(0,0,0,0.05)',
        }}
        transition={{ duration: 0.35, ease: EASE_OUT_QUART }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">

            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 text-stone-900 group">
                <motion.div
                  className="p-2 bg-primary-500 rounded-lg text-white"
                  {...logoHoverProps}
                >
                  <Sparkles className="h-6 w-6" />
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold tracking-wider font-display leading-none">BIRUH TESFA</span>
                  <span className="text-[10px] text-stone-500 font-light mt-0.5 tracking-widest uppercase">Furniture</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {[
                { to: '/', label: t('nav.home') },
                { to: '/about', label: t('nav.about') },
                { to: '/products', label: t('nav.products') },
                { to: '/gallery', label: t('nav.gallery') },
                { to: '/contact', label: t('nav.contact') },
              ].map(({ to, label }) => (
                <Link key={to} to={to} className={navLinkClass(to)}>
                  {label}
                  {/* Active indicator underline */}
                  <AnimatePresence>
                    {isActive(to) && (
                      <motion.span
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-500 rounded-full"
                        layoutId="activeNavIndicator"
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        exit={{ opacity: 0, scaleX: 0 }}
                        transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
                      />
                    )}
                  </AnimatePresence>
                </Link>
              ))}

              {/* Lighting — special link */}
              <Link
                to="/lighting"
                className={`font-semibold transition-colors flex items-center gap-1 relative ${
                  isActive('/lighting') ? 'text-primary-700' : 'text-primary-600 hover:text-primary-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-ping"></span>
                {t('nav.lighting')}
                <AnimatePresence>
                  {isActive('/lighting') && (
                    <motion.span
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-500 rounded-full"
                      layoutId="activeNavIndicator"
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0 }}
                      transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
                    />
                  )}
                </AnimatePresence>
              </Link>
            </div>

            {/* Icons and Controls */}
            <div className="hidden md:flex items-center space-x-6">

              {/* Language Switcher */}
              <motion.button
                onClick={toggleLanguage}
                className="flex items-center space-x-1 text-stone-600 hover:text-stone-900 p-2 rounded-lg hover:bg-stone-100/50 transition-colors"
                title="Switch Language"
                {...buttonMotionProps}
              >
                <Globe className="h-5 w-5 text-stone-500" />
                <span className="text-sm font-semibold">{lang === 'en' ? 'AM' : 'EN'}</span>
              </motion.button>

              {/* Currency Switcher */}
              <motion.button
                onClick={toggleCurrency}
                className="flex items-center space-x-1 text-stone-600 hover:text-stone-900 p-2 rounded-lg hover:bg-stone-100/50 transition-colors"
                title="Switch Currency"
                {...buttonMotionProps}
              >
                <span className="text-sm font-bold bg-stone-200 text-stone-700 w-6 h-6 rounded-full flex items-center justify-center">
                  {currency === 'ETB' ? '$' : 'ብር'}
                </span>
                <span className="text-xs font-semibold">{currency}</span>
              </motion.button>

              {/* Shopping Cart Button */}
              <motion.button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 bg-stone-100/80 rounded-full hover:bg-stone-200/80 text-stone-700 transition-colors"
                {...buttonMotionProps}
              >
                <ShoppingBag className="h-5.5 w-5.5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary-500 text-white text-xs font-bold w-5.5 h-5.5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                    {cartCount}
                  </span>
                )}
              </motion.button>

              {/* User Dropdown */}
              <div className="relative">
                {user ? (
                  <div>
                    <motion.button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="flex items-center space-x-2 p-1.5 pr-3 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors"
                      {...buttonMotionProps}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                    </motion.button>

                    <AnimatePresence>
                      {isProfileDropdownOpen && (
                        <motion.div
                          className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-stone-200 py-2 z-50"
                          initial={{ opacity: 0, y: -8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.97 }}
                          transition={{ duration: 0.2, ease: EASE_OUT_QUART }}
                        >
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
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <motion.div {...buttonMotionProps}>
                    <Link
                      to="/login"
                      className="flex items-center space-x-2 btn-primary !py-2 !px-5 text-sm"
                    >
                      <User className="h-4 w-4" />
                      <span>{t('nav.login')}</span>
                    </Link>
                  </motion.div>
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
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-stone-700 bg-stone-100 rounded-lg"
                {...buttonMotionProps}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isMobileMenuOpen ? (
                    <motion.span
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-6 w-6" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="open"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-6 w-6" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Menu — animated with AnimatePresence */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden border-t border-stone-200 bg-white/95 backdrop-blur-md px-4 pt-2 pb-6 space-y-3 overflow-hidden"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ── Cart Slider Drawer ────────────────────────────────────────────── */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            className="fixed inset-0 z-50 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Overlay background */}
            <motion.div
              className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs"
              onClick={() => setIsCartOpen(false)}
            />

            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                className="w-screen max-w-md bg-white shadow-2xl flex flex-col"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.35, ease: EASE_OUT_QUART }}
              >

                {/* Header */}
                <div className="px-6 py-5 border-b border-stone-200 flex justify-between items-center bg-stone-50">
                  <h2 className="text-lg font-bold text-stone-950 flex items-center space-x-2">
                    <ShoppingBag className="h-5 w-5 text-primary-500" />
                    <span>{t('cart.title')}</span>
                  </h2>
                  <motion.button
                    onClick={() => setIsCartOpen(false)}
                    className="p-1 text-stone-500 hover:text-stone-800 hover:bg-stone-200/50 rounded-full transition-colors"
                    {...buttonMotionProps}
                  >
                    <X className="h-6 w-6" />
                  </motion.button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {cartItems.length === 0 ? (
                    <div className="h-full flex flex-col justify-center items-center text-center space-y-4">
                      <div className="p-4 bg-stone-100 rounded-full text-stone-400">
                        <ShoppingBag className="h-12 w-12" />
                      </div>
                      <p className="text-stone-500 font-medium">{t('cart.empty')}</p>
                      <motion.button
                        onClick={() => {
                          setIsCartOpen(false);
                          navigate('/products');
                        }}
                        className="btn-primary !py-2.5 !px-5 text-sm"
                        {...buttonMotionProps}
                      >
                        {t('home.shop_now')}
                      </motion.button>
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
                        {formatPrice(getCartTotalUSD(), getCartTotalETB(), lang)}
                      </span>
                    </div>
                    <motion.button
                      onClick={handleCheckoutClick}
                      className="w-full btn-primary text-center flex items-center justify-center space-x-2"
                      {...buttonMotionProps}
                    >
                      <span>{t('cart.checkout')}</span>
                    </motion.button>
                  </div>
                )}

              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
