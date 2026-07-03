import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { 
  Sparkles, Sofa, Bed, Briefcase, Utensils, Warehouse, 
  Lightbulb, ArrowRight, Star, Heart, Award, ShieldCheck, Hammer, FolderOpen 
} from 'lucide-react';

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

const Home = () => {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
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
    // Fetch top 3-4 products from API
    fetch('http://localhost:5000/api/products?sort=rating')
      .then(res => res.json())
      .then(data => {
        setFeaturedProducts(data.slice(0, 3));
        setLoading(false);
      })
      .catch(err => {
        console.warn('Backend server offline. Showing default fallback featured products.', err);
        // Fallback seed data
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

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. Hero Section */}
      <div className="relative bg-stone-950 text-white min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Gold Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=80" 
            alt="Luxurious Room"
            className="w-full h-full object-cover opacity-35 scale-105 animate-[pulse_8s_infinite]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-900/50"></div>
          <div className="absolute inset-0 bg-radial-gradient from-primary-500/10 via-transparent to-transparent opacity-60"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-8 py-16">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary-500/15 border border-primary-500/30 text-primary-400 text-xs font-semibold uppercase tracking-widest animate-fade-in">
            <Sparkles className="h-4 w-4" />
            <span>{t('home.hero_title').includes('ያብሩ') ? 'ብሩህ ተስፋ ፈርኒቸር' : 'Biruh Tesfa Furniture'}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight font-display leading-[1.1] max-w-4xl mx-auto bg-clip-text text-transparent bg-gradient-to-r from-white via-stone-100 to-primary-300">
            {t('home.hero_title')}
          </h1>

          <p className="text-stone-300 text-base sm:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            {t('home.hero_subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link to="/products" className="btn-primary w-full sm:w-auto text-center flex items-center justify-center space-x-2">
              <span>{t('home.shop_now')}</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/gallery" className="btn-outline border-white/30 text-white hover:bg-white/10 hover:border-white w-full sm:w-auto text-center">
              {t('home.view_gallery')}
            </Link>
          </div>
        </div>

        {/* Slogan banner */}
        <div className="absolute bottom-6 left-0 right-0 text-center z-10 text-stone-500 text-xs tracking-widest uppercase">
          “Brighten Your Home, Build Your Future.”
        </div>
      </div>

      {/* 2. Categories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-900">{t('home.categories_title')}</h2>
          <p className="text-stone-500 font-light">{t('home.categories_subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link 
                key={cat.key} 
                to={cat.key === 'lighting' ? '/lighting' : `/products?category=${cat.key}`}
                className="group relative h-80 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 flex flex-col justify-end"
              >
                <div className="absolute inset-0 bg-stone-950/40 group-hover:bg-stone-950/20 transition-colors duration-500 z-10"></div>
                <img 
                  src={cat.img} 
                  alt={cat.label} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Content Overlay */}
                <div className="relative z-20 p-6 text-white space-y-2">
                  <div className={`inline-flex p-2.5 rounded-xl ${cat.highlight ? 'bg-primary-500 text-white' : 'bg-white/15 backdrop-blur-md text-white'} mb-2`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold tracking-wide font-display">{cat.label}</h3>
                  <div className="flex items-center space-x-1.5 text-xs text-stone-300 font-medium group-hover:text-primary-300 transition-colors">
                    <span>Explore Products</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3. Featured Section */}
      <div className="bg-stone-100/70 py-20">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-white rounded-2xl h-96"></div>
              ))
            ) : (
              featuredProducts.map((prod) => (
                <div 
                  key={prod.id} 
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-stone-200/50 transition-all duration-300 flex flex-col group"
                >
                  <Link to={`/products/${prod.id}`} className="relative h-64 overflow-hidden block">
                    <img 
                      src={prod.images[0]} 
                      alt={lang === 'am' ? prod.name_am : prod.name_en} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                      <span className="text-lg font-bold text-stone-950 font-display">
                        {formatPrice(prod.price_usd, prod.price_etb, lang)}
                      </span>
                      <button 
                        onClick={() => addToCart(prod)}
                        className="p-2 bg-stone-100 hover:bg-primary-500 hover:text-white rounded-full text-stone-700 transition-all duration-300"
                        title={t('products.add_to_cart')}
                      >
                        <Sparkles className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
        </div>
      </div>

      {/* 4. Luxury Lighting Promotion Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-950 text-white rounded-3xl overflow-hidden shadow-2xl relative min-h-[500px] flex items-center">
          
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
              <Link to="/lighting" className="btn-primary inline-flex items-center space-x-2">
                <span>{t('home.view_lighting')}</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Core Values / Why Choose Us */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-bold text-stone-900">{t('home.why_us_title')}</h2>
          <p className="text-stone-500 font-light">{t('home.why_us_sub')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200/50 space-y-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-amber-50 text-primary-600 rounded-xl w-fit">
              <Award className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-stone-900">{t('home.why_1_title')}</h3>
            <p className="text-stone-500 font-light text-sm leading-relaxed">
              {t('home.why_1_desc')}
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200/50 space-y-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-amber-50 text-primary-600 rounded-xl w-fit">
              <Hammer className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-stone-900">{t('home.why_2_title')}</h3>
            <p className="text-stone-500 font-light text-sm leading-relaxed">
              {t('home.why_2_desc')}
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200/50 space-y-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-amber-50 text-primary-600 rounded-xl w-fit">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-stone-900">{t('home.why_3_title')}</h3>
            <p className="text-stone-500 font-light text-sm leading-relaxed">
              {t('home.why_3_desc')}
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Home;
