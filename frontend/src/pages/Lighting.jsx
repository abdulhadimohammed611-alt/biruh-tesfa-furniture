import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Sparkles, Lightbulb, Compass, Flame, Radio } from 'lucide-react';

const Lighting = () => {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const { currency, formatPrice } = useCurrency();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subCategoryFilter, setSubCategoryFilter] = useState('');

  const subCategories = [
    { value: '', label: 'All Lighting', icon: Lightbulb },
    { value: 'ceiling', label: 'Ceiling Lights', icon: Compass },
    { value: 'wall', label: 'Wall Sconces', icon: Flame },
    { value: 'floor', label: 'Floor Lamps', icon: Lightbulb },
    { value: 'led', label: 'Smart LED', icon: Radio }
  ];

  useEffect(() => {
    setLoading(true);
    let url = 'http://localhost:5000/api/products?category=lighting';
    if (subCategoryFilter) {
      url += `&sub_category=${subCategoryFilter}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('API error fetching lighting. Showing local mock data.', err);
        // Fallback mock lighting items
        const mockLighting = [
          {
            id: 'mock-light-1',
            name_en: 'Luxury Cascading Crystal Chandelier',
            name_am: 'የቅንጦት ክሪስታል ቻንደሊየር',
            price_usd: 899.00,
            price_etb: 107880.00,
            category: 'lighting',
            sub_category: 'ceiling',
            images: ['https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=800&q=80'],
            rating_avg: 4.8
          },
          {
            id: 'mock-light-2',
            name_en: 'Nordic Minimalist Brass Wall Sconce',
            name_am: 'የኖርዲክ ብራስ ግድግዳ መብራት',
            price_usd: 129.00,
            price_etb: 15480.00,
            category: 'lighting',
            sub_category: 'wall',
            images: ['https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=800&q=80'],
            rating_avg: 4.3
          },
          {
            id: 'mock-light-3',
            name_en: 'Aero Arc Floor Lamp with Marble Base',
            name_am: 'ኤሮ አርክ ወለል መብራት ከእብነበረድ መሠረት ጋር',
            price_usd: 299.00,
            price_etb: 35880.00,
            category: 'lighting',
            sub_category: 'floor',
            images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80'],
            rating_avg: 4.7
          },
          {
            id: 'mock-light-4',
            name_en: 'Smart Neo LED Ambient Light Bar',
            name_am: 'ስማርት ኒዮ የሊድ ድባብ ብርሃን ባር',
            price_usd: 89.00,
            price_etb: 10680.00,
            category: 'lighting',
            sub_category: 'led',
            images: ['https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80'],
            rating_avg: 4.6
          }
        ];
        setProducts(subCategoryFilter ? mockLighting.filter(p => p.sub_category === subCategoryFilter) : mockLighting);
        setLoading(false);
      });
  }, [subCategoryFilter]);

  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen pb-20">
      
      {/* 1. Header Banner */}
      <div className="relative py-28 text-center overflow-hidden border-b border-stone-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=1200&q=80" 
            alt="Chandelier Glow" 
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 text-xs font-bold tracking-widest uppercase">
            <Sparkles className="h-4 w-4" />
            <span>Luxurious Lighting</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold font-display text-white">{t('lighting.title')}</h1>
          <p className="text-stone-400 font-light text-sm sm:text-base max-w-xl mx-auto">
            {t('lighting.subtitle')}
          </p>
        </div>
      </div>

      {/* 2. Subcategory Pills */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-16">
        <div className="flex flex-wrap justify-center gap-3">
          {subCategories.map((sub) => {
            const Icon = sub.icon;
            const isActive = subCategoryFilter === sub.value;
            return (
              <button
                key={sub.value}
                onClick={() => setSubCategoryFilter(sub.value)}
                className={`flex items-center space-x-2 px-5 py-3 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' 
                    : 'bg-stone-900 text-stone-400 hover:text-white hover:bg-stone-850 border border-stone-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{sub.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3. Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse bg-stone-900 rounded-3xl h-96"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-stone-900/40 rounded-3xl border border-stone-800 space-y-4 max-w-xl mx-auto">
            <p className="text-stone-400">No lighting fixtures found in this category.</p>
            <button 
              onClick={() => setSubCategoryFilter('')}
              className="btn-primary !py-2.5 !px-5 text-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((prod) => (
              <div 
                key={prod.id} 
                className="bg-stone-900/50 rounded-2xl overflow-hidden border border-stone-850 hover:border-primary-500/30 transition-all duration-300 flex flex-col justify-between group shadow-lg hover:shadow-glow"
              >
                
                {/* Image */}
                <Link to={`/products/${prod.id}`} className="relative h-64 overflow-hidden block">
                  <img 
                    src={prod.images[0]} 
                    alt={lang === 'am' ? prod.name_am : prod.name_en} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute top-3 right-3 bg-stone-950/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-xs font-bold text-white flex items-center space-x-1 border border-stone-800">
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    <span>{parseFloat(prod.rating_avg).toFixed(1)}</span>
                  </div>
                </Link>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-primary-400 font-bold uppercase tracking-wider">{prod.sub_category || 'Fixtures'}</span>
                    <Link to={`/products/${prod.id}`} className="block">
                      <h3 className="text-base font-bold text-white hover:text-primary-400 transition-colors line-clamp-1">
                        {lang === 'am' ? prod.name_am : prod.name_en}
                      </h3>
                    </Link>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-base font-bold text-white font-display">
                      {formatPrice(prod.price_usd, prod.price_etb, lang)}
                    </span>
                    <button 
                      onClick={() => addToCart(prod)}
                      className="p-2.5 bg-stone-800 hover:bg-primary-500 hover:text-white rounded-full text-stone-300 transition-all duration-300"
                      title={t('products.add_to_cart')}
                    >
                      <ShoppingCart className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Lighting;
