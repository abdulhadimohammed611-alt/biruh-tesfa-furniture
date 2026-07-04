import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { Search, SlidersHorizontal, Star, ShoppingCart, Grid, List, Sparkles } from 'lucide-react';
import { API_URL } from '../config';

const Products = () => {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const { currency, formatPrice } = useCurrency();
  const { addToCart } = useCart();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isListView, setIsListView] = useState(false);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Sync category state if URL param changes
  useEffect(() => {
    setCategoryFilter(searchParams.get('category') || '');
  }, [searchParams]);

  const [categoriesList, setCategoriesList] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then(res => res.json())
      .then(data => {
        const mapped = data.map(cat => ({
          value: cat.slug,
          label: lang === 'am' ? cat.name_am : cat.name_en
        }));
        setCategoriesList([{ value: '', label: lang === 'am' ? 'ሁሉም ምርቶች' : 'All Categories' }, ...mapped]);
      })
      .catch(err => {
        console.warn("API error fetching categories for filter, using default fallbacks.", err);
        setCategoriesList([
          { value: '', label: lang === 'am' ? 'ሁሉም ምርቶች' : 'All Categories' },
          { value: 'sofas', label: lang === 'am' ? 'ሶፋዎች እና ሳሎን' : 'Sofas & Living' },
          { value: 'bedroom', label: lang === 'am' ? 'የመኝታ ክፍል ዕቃዎች' : 'Bedroom Furniture' },
          { value: 'office', label: lang === 'am' ? 'የቢሮ ዕቃዎች' : 'Office Furniture' },
          { value: 'dining', label: lang === 'am' ? 'የምግብ ጠረጴዛዎች' : 'Dining Sets' },
          { value: 'storage', label: lang === 'am' ? 'ቁምሳጥን እና መደርደሪያዎች' : 'Storage' },
          { value: 'lighting', label: lang === 'am' ? 'የቅንጦት መብራቶች' : 'Lighting' }
        ]);
      });
  }, [lang]);

  // Fetch products based on filters
  const fetchFilteredProducts = () => {
    setLoading(true);
    let url = `${API_URL}/api/products?currency=${currency}`;
    
    if (categoryFilter) url += `&category=${categoryFilter}`;
    if (searchQuery) url += `&search=${searchQuery}`;
    if (priceMin) url += `&price_min=${priceMin}`;
    if (priceMax) url += `&price_max=${priceMax}`;
    
    if (sortBy === 'price_asc') url += `&sort=price_asc`;
    else if (sortBy === 'price_desc') url += `&sort=price_desc`;
    else if (sortBy === 'rating') url += `&sort=rating`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('API error fetching products. Fallback to mock product array.', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    // Debounce/Fetch on filters modification
    const delayDebounceFn = setTimeout(() => {
      fetchFilteredProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [categoryFilter, searchQuery, priceMin, priceMax, sortBy, currency]);

  const handleCategoryChange = (cat) => {
    setCategoryFilter(cat);
    if (cat) {
      setSearchParams({ category: cat });
    } else {
      searchParams.delete('category');
      setSearchParams(searchParams);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setPriceMin('');
    setPriceMax('');
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title */}
      <div className="text-center md:text-left space-y-2 mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-900">{t('products.title')}</h1>
        <p className="text-sm text-stone-500 font-light">Explore our premium furniture collection crafted with perfection.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Panel (Desktop Sidebar) */}
        <div className="hidden lg:block space-y-8 bg-white p-6 rounded-2xl border border-stone-200/60 shadow-xs h-fit sticky top-28">
          <div className="flex justify-between items-center pb-4 border-b border-stone-100">
            <h3 className="font-bold text-stone-900 flex items-center space-x-2">
              <SlidersHorizontal className="h-4.5 w-4.5 text-stone-600" />
              <span>{t('products.filters')}</span>
            </h3>
            <button 
              onClick={clearAllFilters}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium underline"
            >
              Clear All
            </button>
          </div>

          {/* Category List */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-stone-800 uppercase tracking-wider">{t('products.categories')}</h4>
            <div className="space-y-1.5">
              {categoriesList.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    categoryFilter === cat.value
                      ? 'bg-primary-50 text-primary-600 font-semibold'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-stone-800 uppercase tracking-wider">{t('products.price_range')} ({currency})</h4>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="w-full border border-stone-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <span className="text-stone-400 text-xs">-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-full border border-stone-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Products Main Section */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Search, Sorting, Grid view Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-stone-200/50 shadow-2xs">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-stone-400" />
              <input
                type="text"
                placeholder={t('products.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            {/* View selectors & Sort */}
            <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
              
              {/* Mobile Filter Toggle */}
              <button 
                onClick={() => setShowFiltersMobile(true)}
                className="lg:hidden flex items-center space-x-2 text-sm border border-stone-200 rounded-lg px-3.5 py-2 hover:bg-stone-50"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
              </button>

              {/* Sorting */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none text-stone-700 bg-white"
              >
                <option value="newest">Sort: Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Sort: Highest Rated</option>
              </select>

              {/* View Layout buttons */}
              <div className="hidden sm:flex items-center border border-stone-200 rounded-lg overflow-hidden">
                <button 
                  onClick={() => setIsListView(false)}
                  className={`p-2 transition-colors ${!isListView ? 'bg-stone-100 text-stone-800' : 'text-stone-400 hover:bg-stone-50'}`}
                >
                  <Grid className="h-4.5 w-4.5" />
                </button>
                <button 
                  onClick={() => setIsListView(true)}
                  className={`p-2 transition-colors ${isListView ? 'bg-stone-100 text-stone-800' : 'text-stone-400 hover:bg-stone-50'}`}
                >
                  <List className="h-4.5 w-4.5" />
                </button>
              </div>

            </div>
          </div>

          {/* Product grid / list display */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse bg-stone-100 rounded-2xl h-80"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-stone-200/50 space-y-4">
              <p className="text-stone-500 font-medium">{t('products.no_products')}</p>
              <button 
                onClick={clearAllFilters}
                className="btn-primary !py-2 !px-5 text-sm"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className={isListView ? "space-y-4" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"}>
              {products.map((prod) => (
                <div 
                  key={prod.id} 
                  className={`bg-white rounded-2xl overflow-hidden border border-stone-200/40 shadow-2xs hover:shadow-md transition-all duration-300 ${
                    isListView ? 'flex flex-col sm:flex-row h-fit' : 'flex flex-col h-full justify-between'
                  } group`}
                >
                  {/* Image */}
                  <Link 
                    to={`/products/${prod.id}`} 
                    className={`relative overflow-hidden block ${isListView ? 'w-full sm:w-60 h-48 shrink-0' : 'h-56'}`}
                  >
                    <img 
                      src={prod.images[0]} 
                      alt={lang === 'am' ? prod.name_am : prod.name_en} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full text-xs font-bold text-stone-800 flex items-center space-x-1 shadow-sm">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      <span>{parseFloat(prod.rating_avg).toFixed(1)}</span>
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-primary-600 font-bold uppercase tracking-wider">{prod.category}</span>
                      <Link to={`/products/${prod.id}`} className="block">
                        <h3 className="text-base font-bold text-stone-900 hover:text-primary-600 transition-colors line-clamp-1">
                          {lang === 'am' ? prod.name_am : prod.name_en}
                        </h3>
                      </Link>
                      <p className="text-xs text-stone-500 font-light line-clamp-2 leading-relaxed">
                        {lang === 'am' ? prod.description_am : prod.description_en}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-base font-bold text-stone-950 font-display">
                        {formatPrice(prod.price_usd, prod.price_etb, lang)}
                      </span>
                      <button 
                        onClick={() => addToCart(prod)}
                        className="btn-primary !py-2 !px-4 text-xs flex items-center space-x-1.5"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span>{t('products.add_to_cart')}</span>
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Mobile Filters Modal */}
      {showFiltersMobile && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div className="absolute inset-0 bg-stone-950/50" onClick={() => setShowFiltersMobile(false)}></div>
          <div className="absolute inset-y-0 left-0 max-w-full flex pr-10">
            <div className="w-screen max-w-xs bg-white p-6 shadow-xl flex flex-col space-y-6">
              
              <div className="flex justify-between items-center pb-4 border-b border-stone-100">
                <h3 className="font-bold text-stone-900">Filters</h3>
                <button onClick={() => setShowFiltersMobile(false)} className="p-1">
                  <SlidersHorizontal className="h-5 w-5 text-stone-500" />
                </button>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-stone-800">Categories</h4>
                <div className="space-y-1">
                  {categoriesList.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        handleCategoryChange(cat.value);
                        setShowFiltersMobile(false);
                      }}
                      className={`w-full text-left p-2 rounded text-sm ${
                        categoryFilter === cat.value
                          ? 'bg-primary-50 text-primary-600 font-bold'
                          : 'text-stone-600'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-stone-800">Price Range ({currency})</h4>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-full border border-stone-200 rounded p-1.5 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full border border-stone-200 rounded p-1.5 text-sm"
                  />
                </div>
              </div>

              <button 
                onClick={() => {
                  clearAllFilters();
                  setShowFiltersMobile(false);
                }}
                className="w-full btn-outline text-center !py-2 text-sm"
              >
                Clear All Filters
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Products;
