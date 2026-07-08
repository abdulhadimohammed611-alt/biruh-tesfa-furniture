import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { 
  Sparkles, Sofa, Bed, Briefcase, Utensils, Warehouse, 
  Lightbulb, ArrowRight, Star, Heart, Award, ShieldCheck, Hammer, FolderOpen, 
  ChevronDown
} from 'lucide-react';
import { API_URL } from '../config';
import { motion, useTransform } from 'framer-motion';
import { useMouseParallax, useCountUp } from '../animations/hooks';
import {
  pageTransitionVariants,
  fadeDown,
  fadeLeft,
  fadeUp,
  fadeIn,
  staggerContainer,
  staggerItem,
  buttonStaggerItem,
  buttonMotionProps,
  iconHoverProps,
  EASE_OUT_QUART,
} from '../animations/variants';

const getCategoryIcon = (slug) => {
  switch (slug) {
    case 'sofas': return Sofa;
    case 'bedroom': return Bed;
    case 'office': return Briefcase;
    case 'dining': return Utensils;
    case 'storage': return Warehouse;
    case 'lighting': return Lightbulb;
    default: return FolderOpen;
  }
};

const StatCard = ({ value, suffix, label }) => {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="space-y-2 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden group hover:border-primary-500/30 transition-colors">
      <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="text-4xl md:text-5xl font-extrabold text-primary-400 font-display">
        {count.toLocaleString()}{suffix}
      </div>
      <p className="text-stone-400 text-xs md:text-sm font-light uppercase tracking-wider">{label}</p>
    </div>
  );
};

const Home = () => {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  // Mouse Parallax values for cinematic Hero
  const { x: mouseX, y: mouseY } = useMouseParallax();
  const heroBgX = useTransform(mouseX, [-1, 1], [-25, 25]);
  const heroBgY = useTransform(mouseY, [-1, 1], [-25, 25]);
  
  const heroContentX = useTransform(mouseX, [-1, 1], [-8, 8]);
  const heroContentY = useTransform(mouseY, [-1, 1], [-8, 8]);

  const floatX1 = useTransform(mouseX, [-1, 1], [35, -35]);
  const floatY1 = useTransform(mouseY, [-1, 1], [35, -35]);

  const floatX2 = useTransform(mouseX, [-1, 1], [-25, 25]);
  const floatY2 = useTransform(mouseY, [-1, 1], [25, -25]);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then(res => res.json())
      .then(data => {
        const mapped = data.map(cat => ({
          key: cat.slug,
          label: lang === 'am' ? cat.name_am : cat.name_en,
          icon: getCategoryIcon(cat.slug),
          img: cat.image_url || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
          highlight: cat.slug === 'lighting'
        }));
        setCategories(mapped);
      })
      .catch(err => {
        console.warn("API error fetching categories for Home, using defaults", err);
        setCategories([
          { key: 'sofas', label: lang === 'am' ? 'ሶፋዎች እና ሳሎን' : 'Sofas & Living', icon: Sofa, img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80' },
          { key: 'bedroom', label: lang === 'am' ? 'የመኝታ ክፍል ዕቃዎች' : 'Bedroom Furniture', icon: Bed, img: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80' },
          { key: 'office', label: lang === 'am' ? 'የቢሮ ዕቃዎች' : 'Office Furniture', icon: Briefcase, img: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=600&q=80' },
          { key: 'dining', label: lang === 'am' ? 'የምግብ ጠረጴዛዎች' : 'Dining Sets', icon: Utensils, img: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=600&q=80' },
          { key: 'storage', label: lang === 'am' ? 'ቁምሳጥን እና መደርደሪያዎች' : 'Premium Storage', icon: Warehouse, img: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=600&q=80' },
          { key: 'lighting', label: lang === 'am' ? 'የቅንጦት መብራቶች' : 'Luxurious Lighting', icon: Lightbulb, img: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=600&q=80', highlight: true }
        ]);
      });
  }, [lang]);

  useEffect(() => {
    fetch(`${API_URL}/api/products?sort=rating`)
      .then(res => res.json())
      .then(data => {
        setFeaturedProducts(data.slice(0, 3));
        setLoading(false);
      })
      .catch(err => {
        console.warn('Backend server offline. Showing default fallback featured products.', err);
        setFeaturedProducts([
          {
            id: 'mock-1',
            name_en: 'Royal Golden Chesterfield Sofa',
            name_am: 'የመንግሥቱ ወርቃማ ቼስተርፊልድ ሶፋ',
            price_usd: 1299.00,
            price_etb: 155880.00,
            images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'],
            rating_avg: 4.8,
            category: 'sofas'
          },
          {
            id: 'mock-2',
            name_en: 'King Size Royal Canopy Bed',
            name_am: 'ኪንግ ሳይዝ ሮያል አልጋ',
            price_usd: 1899.00,
            price_etb: 227880.00,
            images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80'],
            rating_avg: 4.9,
            category: 'bedroom'
          },
          {
            id: 'mock-3',
            name_en: 'Luxury Cascading Crystal Chandelier',
            name_am: 'የቅንጦት ክሪስታል ቻንደሊየር',
            price_usd: 899.00,
            price_etb: 107880.00,
            images: ['https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=800&q=80'],
            rating_avg: 4.8,
            category: 'lighting'
          }
        ]);
        setLoading(false);
      });
  }, []);

  const titleWords = t('home.hero_title').split(' ');

  return (
    <motion.div
      className="space-y-20 pb-20 overflow-x-hidden"
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >

      {/* ── 1. Cinematic Hero Section ────────────────────────────────────── */}
      <div className="relative bg-stone-950 text-white min-h-[95vh] flex items-center justify-center overflow-hidden">
        
        {/* Soft Golden Ambient Light Blobs */}
        <div className="light-blob bg-radial-[circle_at_center,_#d98a27_0%,_transparent_70%] w-[50vw] h-[50vw] -top-12 -left-12 opacity-20 pointer-events-none" />
        <div className="light-blob bg-radial-[circle_at_center,_#eec774_0%,_transparent_75%] w-[40vw] h-[40vw] bottom-0 right-0 opacity-15 pointer-events-none" />

        {/* Floating Decorative Particles with Parallax */}
        <motion.div style={{ x: floatX1, y: floatY1 }} className="absolute top-[20%] left-[8%] opacity-20 text-primary-400 z-10 animate-float-slow hidden md:block pointer-events-none">
          <Sofa className="h-14 w-14" />
        </motion.div>
        <motion.div style={{ x: floatX2, y: floatY2 }} className="absolute bottom-[25%] right-[12%] opacity-15 text-primary-300 z-10 animate-float-fast hidden md:block pointer-events-none">
          <Lightbulb className="h-16 w-16" />
        </motion.div>
        <motion.div style={{ x: floatX1, y: floatY2 }} className="absolute top-[15%] right-[22%] opacity-10 text-white z-10 animate-float-slow pointer-events-none">
          <Sparkles className="h-9 w-9" />
        </motion.div>

        {/* Background Image with slow Ken Burns & Mouse Parallax */}
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ x: heroBgX, y: heroBgY }}
        >
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=80"
            alt="Luxurious Room"
            className="w-[110%] h-[110%] -left-[5%] -top-[5%] relative object-cover opacity-30 hero-bg-kenburns"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-900/50"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-primary-500/5 mix-blend-color-dodge"></div>
        </motion.div>

        {/* Hero Content */}
        <motion.div 
          className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-8 py-16"
          style={{ x: heroContentX, y: heroContentY }}
        >
          {/* Badge — drops from top */}
          <motion.div
            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary-500/15 border border-primary-500/30 text-primary-400 text-xs font-semibold uppercase tracking-widest"
            variants={fadeDown}
            initial="hidden"
            animate="visible"
          >
            <Sparkles className="h-4 w-4" />
            <span>{t('home.hero_title').includes('ያብሩ') ? 'ብሩህ ተስፋ ፈርኒቸር' : 'Biruh Tesfa Furniture'}</span>
          </motion.div>

          {/* Headline reveals word-by-word */}
          <motion.h1 
            className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight font-display leading-[1.1] max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {titleWords.map((word, idx) => (
              <motion.span
                key={idx}
                className="inline-block mr-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-stone-100 to-primary-300"
                variants={{
                  hidden: { opacity: 0, y: 18, filter: 'blur(4px)' },
                  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: EASE_OUT_QUART } }
                }}
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          {/* Description fades upward */}
          <motion.p
            className="text-stone-300 text-base sm:text-xl max-w-2xl mx-auto font-light leading-relaxed"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.35}
          >
            {t('home.hero_subtitle')}
          </motion.p>

          {/* Buttons stagger upward */}
          <motion.div
            className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={buttonStaggerItem}>
              <motion.div {...buttonMotionProps}>
                <Link
                  to="/products"
                  className="btn-primary w-full sm:w-auto text-center flex items-center justify-center space-x-2 shine-sweep"
                  style={{ display: 'inline-flex' }}
                >
                  <span>{t('home.shop_now')}</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div variants={buttonStaggerItem}>
              <motion.div {...buttonMotionProps}>
                <Link
                  to="/gallery"
                  className="btn-outline border-white/30 text-white hover:bg-white/10 hover:border-white w-full sm:w-auto text-center"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {t('home.view_gallery')}
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator with smooth bounce */}
        <motion.div
          className="absolute bottom-12 left-0 right-0 flex justify-center z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          <motion.div
            className="flex flex-col items-center cursor-pointer text-stone-400 hover:text-white transition-colors"
            onClick={() => window.scrollTo({ top: window.innerHeight * 0.9, behavior: 'smooth' })}
          >
            <span className="text-[9px] uppercase tracking-widest font-semibold mb-2">Scroll Down</span>
            <div className="w-6 h-10 border-2 border-stone-500/80 rounded-full flex justify-center p-1.5 backdrop-blur-xs">
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                className="w-1.5 h-1.5 bg-primary-400 rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Slogan banner */}
        <div className="absolute bottom-4 left-0 right-0 text-center z-10 text-stone-500 text-xs tracking-widest uppercase">
          "Brighten Your Home, Build Your Future."
        </div>
      </div>

      {/* ── 2. Categories Section (Transitions reveal: fade + blur + rise + scale 98%) ── */}
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10"
        initial={{ opacity: 0, y: 40, scale: 0.98, filter: 'blur(8px)' }}
        whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.8, ease: EASE_OUT_QUART }}
      >
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-900">{t('home.categories_title')}</h2>
          <p className="text-stone-500 font-light">{t('home.categories_subtitle')}</p>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <motion.div 
                key={cat.key} 
                variants={staggerItem}
                whileHover="hover"
              >
                <Link
                  to={cat.key === 'lighting' ? '/lighting' : `/products?category=${cat.key}`}
                  className="group relative h-80 rounded-2xl overflow-hidden shadow-md flex flex-col justify-end border border-stone-200/20 bg-stone-900 block"
                  style={{ display: 'flex' }}
                >
                  {/* Category Image Zoom on hover */}
                  <motion.div
                    className="absolute inset-0 z-0"
                    variants={{
                      hover: { scale: 1.08 }
                    }}
                    transition={{ duration: 0.45, ease: EASE_OUT_QUART }}
                  >
                    <img
                      src={cat.img}
                      alt={cat.label}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-stone-950/40 group-hover:bg-stone-950/20 transition-colors duration-500 z-10"></div>
                  </motion.div>

                  {/* Golden Glow Effect on Hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-primary-500/20 via-transparent to-transparent opacity-0 z-10 transition-opacity duration-300"
                    variants={{
                      hover: { opacity: 1 }
                    }}
                  />

                  {/* Content Overlay */}
                  <div className="relative z-20 p-6 text-white space-y-2">
                    {/* Icon rotates & scales on hover */}
                    <motion.div
                      className={`inline-flex p-2.5 rounded-xl ${cat.highlight ? 'bg-primary-500 text-white' : 'bg-white/15 backdrop-blur-md text-white'} mb-2`}
                      variants={{
                        hover: { rotate: 8, scale: 1.15 }
                      }}
                      transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
                    >
                      <Icon className="h-6 w-6" />
                    </motion.div>
                    
                    {/* Text slides up slightly on hover */}
                    <motion.h3 
                      className="text-xl font-bold tracking-wide font-display"
                      variants={{
                        hover: { y: -4 }
                      }}
                      transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
                    >
                      {cat.label}
                    </motion.h3>

                    <motion.div 
                      className="flex items-center space-x-1.5 text-xs text-stone-300 font-medium group-hover:text-primary-300 transition-colors"
                      variants={{
                        hover: { y: -4 }
                      }}
                      transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
                    >
                      <span>Explore Products</span>
                      <ArrowRight className="h-3 w-3" />
                    </motion.div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* ── 3. Featured Section (Transitions reveal: fade + blur + rise + scale 98%) ── */}
      <motion.div 
        className="bg-stone-100/70 py-20"
        initial={{ opacity: 0, y: 40, scale: 0.98, filter: 'blur(8px)' }}
        whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.8, ease: EASE_OUT_QUART }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-stone-200 pb-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-stone-900">{t('home.featured_title')}</h2>
              <p className="text-stone-500 font-light">{t('home.featured_subtitle')}</p>
            </div>
            <Link to="/products" className="text-primary-600 hover:text-primary-700 font-semibold flex items-center space-x-1 text-sm shrink-0">
              <span>View All Products</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-white rounded-2xl h-96"></div>
              ))
            ) : (
              featuredProducts.map((prod) => (
                <motion.div
                  key={prod.id}
                  variants={staggerItem}
                  whileHover="hover"
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200/50 flex flex-col relative group"
                  style={{ willChange: 'transform' }}
                  variants={{
                    hidden: { opacity: 0, y: 32 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE_OUT_QUART } },
                    hover: {
                      y: -10,
                      boxShadow: '0 28px 56px -12px rgba(0,0,0,0.18), 0 0 0 2px rgba(217,138,39,0.5)',
                      transition: { duration: 0.35, ease: EASE_OUT_QUART }
                    }
                  }}
                >
                  <Link to={`/products/${prod.id}`} className="relative h-64 overflow-hidden block">
                    {/* Product Image Zoom on hover */}
                    <motion.img
                      src={prod.images[0]}
                      alt={lang === 'am' ? prod.name_am : prod.name_en}
                      className="w-full h-full object-cover"
                      variants={{
                        hover: { scale: 1.08 }
                      }}
                      transition={{ duration: 0.45, ease: EASE_OUT_QUART }}
                    />
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-stone-800 flex items-center space-x-1 shadow-sm">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      <span>{prod.rating_avg}</span>
                    </div>
                  </Link>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[10px] text-primary-600 font-bold uppercase tracking-wider">{prod.category}</span>
                      <Link to={`/products/${prod.id}`} className="block mt-1">
                        <h3 className="text-lg font-bold text-stone-900 hover:text-primary-600 transition-colors line-clamp-1">
                          {lang === 'am' ? prod.name_am : prod.name_en}
                        </h3>
                      </Link>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      {/* Price scales on hover */}
                      <motion.span 
                        className="text-lg font-bold text-stone-950 font-display"
                        variants={{
                          hover: { scale: 1.05, originX: 0 }
                        }}
                        transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
                      >
                        {formatPrice(prod.price_usd, prod.price_etb, lang)}
                      </motion.span>
                      
                      {/* Button slides upward and scales on hover */}
                      <motion.button
                        onClick={() => addToCart(prod)}
                        className="p-2 bg-stone-100 hover:bg-primary-500 hover:text-white rounded-full text-stone-700 transition-all duration-300"
                        title={t('products.add_to_cart')}
                        variants={{
                          initial: { y: 12, opacity: 0.8 },
                          hover: { y: 0, opacity: 1, scale: 1.08 }
                        }}
                        transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Sparkles className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* ── 4. Cinematic Statistics Section ─────────────────────────────── */}
      <motion.div 
        className="bg-stone-900 text-white py-24 relative overflow-hidden"
        initial={{ opacity: 0, y: 40, scale: 0.98, filter: 'blur(8px)' }}
        whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.8, ease: EASE_OUT_QUART }}
      >
        {/* Soft Ambient Light Blobs */}
        <div className="light-blob bg-radial-[circle_at_center,_#d98a27_0%,_transparent_70%] w-[380px] h-[380px] -top-20 -left-20 opacity-15" />
        <div className="light-blob bg-radial-[circle_at_center,_#eec774_0%,_transparent_75%] w-[300px] h-[300px] -bottom-20 -right-20 opacity-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatCard value={12} suffix="+" label={lang === 'am' ? 'የልምድ ዓመታት' : 'Years of Experience'} />
            <StatCard value={4800} suffix="+" label={lang === 'am' ? 'ደስተኛ ደንበኞች' : 'Happy Customers'} />
            <StatCard value={15} suffix="+" label={lang === 'am' ? 'የፊርማ ስብስቦች' : 'Signature Collections'} />
            <StatCard value={100} suffix="%" label={lang === 'am' ? 'ጥራት የተረጋገጠ' : 'Quality Guaranteed'} />
          </div>
        </div>
      </motion.div>

      {/* ── 5. Luxury Lighting Promotion Section (Transitions reveal) ───── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="bg-stone-950 text-white rounded-3xl overflow-hidden shadow-2xl relative min-h-[500px] flex items-center"
          initial={{ opacity: 0, y: 40, scale: 0.98, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: EASE_OUT_QUART }}
        >
          {/* Background image half layout */}
          <div className="absolute inset-y-0 right-0 w-full lg:w-1/2 z-0">
            <img
              src="https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=1200&q=80"
              alt="Luxury Chandelier"
              className="w-full h-full object-cover opacity-40 lg:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/70 to-transparent lg:block hidden"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 to-transparent lg:hidden block"></div>
          </div>

          <div className="relative z-10 max-w-xl p-8 sm:p-16 space-y-6">
            <div className="inline-block px-3 py-1 rounded bg-primary-500/20 border border-primary-500/30 text-primary-400 text-xs font-bold uppercase tracking-wider">
              {t('nav.lighting')}
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold font-display leading-tight">
              {t('home.lighting_promo_title')}
            </h2>
            <p className="text-stone-300 font-light leading-relaxed text-sm sm:text-base">
              {t('home.lighting_promo_subtitle')}
            </p>
            <div className="pt-2">
              <motion.div {...buttonMotionProps} style={{ display: 'inline-block' }}>
                <Link to="/lighting" className="btn-primary inline-flex items-center space-x-2 shine-sweep">
                  <span>{t('home.view_lighting')}</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── 6. Core Values / Why Choose Us (Transitions reveal) ─────────── */}
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12"
        initial={{ opacity: 0, y: 40, scale: 0.98, filter: 'blur(8px)' }}
        whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.8, ease: EASE_OUT_QUART }}
      >
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-bold text-stone-900">{t('home.why_us_title')}</h2>
          <p className="text-stone-500 font-light">{t('home.why_us_sub')}</p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* Card 1 */}
          <motion.div
            variants={staggerItem}
            whileHover="hover"
            className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200/50 space-y-4"
            style={{ willChange: 'transform' }}
            variants={{
              hidden: { opacity: 0, y: 32 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE_OUT_QUART } },
              hover: {
                y: -10,
                boxShadow: '0 28px 56px -12px rgba(0,0,0,0.18), 0 0 0 2px rgba(217,138,39,0.5)',
                transition: { duration: 0.35, ease: EASE_OUT_QUART }
              }
            }}
          >
            <motion.div 
              className="p-3 bg-amber-50 text-primary-600 rounded-xl w-fit" 
              variants={{
                hover: { rotate: 8, scale: 1.15 }
              }}
              transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
            >
              <Award className="h-8 w-8" />
            </motion.div>
            <h3 className="text-xl font-bold text-stone-900">{t('home.why_1_title')}</h3>
            <p className="text-stone-500 font-light text-sm leading-relaxed">
              {t('home.why_1_desc')}
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            variants={staggerItem}
            whileHover="hover"
            className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200/50 space-y-4"
            style={{ willChange: 'transform' }}
            variants={{
              hidden: { opacity: 0, y: 32 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE_OUT_QUART } },
              hover: {
                y: -10,
                boxShadow: '0 28px 56px -12px rgba(0,0,0,0.18), 0 0 0 2px rgba(217,138,39,0.5)',
                transition: { duration: 0.35, ease: EASE_OUT_QUART }
              }
            }}
          >
            <motion.div 
              className="p-3 bg-amber-50 text-primary-600 rounded-xl w-fit"
              variants={{
                hover: { rotate: 8, scale: 1.15 }
              }}
              transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
            >
              <Hammer className="h-8 w-8" />
            </motion.div>
            <h3 className="text-xl font-bold text-stone-900">{t('home.why_2_title')}</h3>
            <p className="text-stone-500 font-light text-sm leading-relaxed">
              {t('home.why_2_desc')}
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            variants={staggerItem}
            whileHover="hover"
            className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200/50 space-y-4"
            style={{ willChange: 'transform' }}
            variants={{
              hidden: { opacity: 0, y: 32 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE_OUT_QUART } },
              hover: {
                y: -10,
                boxShadow: '0 28px 56px -12px rgba(0,0,0,0.18), 0 0 0 2px rgba(217,138,39,0.5)',
                transition: { duration: 0.35, ease: EASE_OUT_QUART }
              }
            }}
          >
            <motion.div 
              className="p-3 bg-amber-50 text-primary-600 rounded-xl w-fit"
              variants={{
                hover: { rotate: 8, scale: 1.15 }
              }}
              transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
            >
              <ShieldCheck className="h-8 w-8" />
            </motion.div>
            <h3 className="text-xl font-bold text-stone-900">{t('home.why_3_title')}</h3>
            <p className="text-stone-500 font-light text-sm leading-relaxed">
              {t('home.why_3_desc')}
            </p>
          </motion.div>
        </motion.div>
      </motion.div>

    </motion.div>
  );
};

export default Home;
