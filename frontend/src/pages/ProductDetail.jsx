import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Star, ShieldAlert, ShoppingBag, Plus, Minus, ArrowLeft, Send } from 'lucide-react';
import { API_URL } from '../config';

const ProductDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const { user, token } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  // Review states
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchProductDetails = () => {
    fetch(`${API_URL}/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching product details:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const handleQuantityChange = (val) => {
    if (val < 1) return;
    if (product && val > product.stock) return;
    setQuantity(val);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    setSubmittingReview(true);
    setErrorMsg('');

    try {
      const response = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: id,
          rating: newRating,
          comment: newComment
        })
      });

      const data = await response.json();
      if (response.ok) {
        setNewComment('');
        setNewRating(5);
        // Refresh product details to show new review and updated rating_avg
        fetchProductDetails();
      } else {
        setErrorMsg(data.message || 'Failed to submit review.');
      }
    } catch (err) {
      setErrorMsg('Network error submitting review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex justify-center items-center">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-stone-200 h-10 w-10"></div>
          <div className="flex-1 space-y-6 py-1">
            <div className="h-2 bg-stone-200 rounded"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-2 bg-stone-200 rounded col-span-2"></div>
                <div className="h-2 bg-stone-200 rounded col-span-1"></div>
              </div>
              <div className="h-2 bg-stone-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-stone-900">Product not found.</h2>
        <Link to="/products" className="btn-primary inline-block">Back to Products</Link>
      </div>
    );
  }

  const name = lang === 'am' ? product.name_am : product.name_en;
  const description = lang === 'am' ? product.description_am : product.description_en;
  const dimensions = lang === 'am' ? product.dimensions_am : product.dimensions_en;
  const features = lang === 'am' ? product.features_am : product.features_en;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Back button */}
      <div>
        <Link to="/products" className="inline-flex items-center space-x-2 text-sm text-stone-500 hover:text-stone-900 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Products</span>
        </Link>
      </div>

      {/* Main product showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-stone-100 border border-stone-200/50 shadow-sm relative">
            <img 
              src={product.images[activeImage]} 
              alt={name} 
              className="w-full h-full object-cover"
            />
            {product.stock <= 0 && (
              <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center">
                <span className="bg-red-500 text-white font-bold px-6 py-2 rounded-full text-sm uppercase tracking-wider">
                  {t('products.out_of_stock')}
                </span>
              </div>
            )}
          </div>
          
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex space-x-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden bg-stone-100 border-2 ${
                    activeImage === idx ? 'border-primary-500 shadow-sm' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt={`${name} thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text details */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs text-primary-600 font-bold uppercase tracking-wider">{product.category}</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-stone-950 font-display">{name}</h1>
            
            {/* Stars */}
            <div className="flex items-center space-x-2 pt-1">
              <div className="flex items-center text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-4.5 w-4.5 ${
                      star <= Math.round(product.rating_avg) ? 'fill-amber-500 text-amber-500' : 'text-stone-300'
                    }`} 
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-stone-800">{parseFloat(product.rating_avg).toFixed(1)}</span>
              <span className="text-sm text-stone-400">|</span>
              <span className="text-sm text-stone-500 font-light">{product.reviews?.length || 0} customer reviews</span>
            </div>
          </div>

          <p className="text-2xl font-bold text-stone-950 font-display">
            {formatPrice(product.price_usd, product.price_etb, lang)}
          </p>

          <p className="text-stone-600 font-light leading-relaxed text-sm sm:text-base">
            {description}
          </p>

          <hr className="border-stone-200" />

          {/* Specs */}
          <div className="space-y-3 text-sm">
            {dimensions && (
              <div className="flex">
                <span className="w-32 text-stone-500 font-medium">{t('products.dimensions')}:</span>
                <span className="text-stone-900 font-semibold">{dimensions}</span>
              </div>
            )}
            <div className="flex">
              <span className="w-32 text-stone-500 font-medium">Availability:</span>
              <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock > 0 ? `${t('products.in_stock')} (${product.stock} items)` : t('products.out_of_stock')}
              </span>
            </div>
          </div>

          {/* Features list */}
          {features && features.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-stone-900 uppercase tracking-wider">{t('products.features')}</h4>
              <ul className="list-disc list-inside text-stone-600 font-light text-sm space-y-1">
                {features.map((feat, i) => (
                  <li key={i}>{feat}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Quantity and Cart buttons */}
          {product.stock > 0 && (
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              
              {/* Quantity */}
              <div className="flex items-center border border-stone-300 rounded-full bg-white px-2">
                <button 
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="p-2 hover:bg-stone-50 text-stone-600 rounded-full"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 font-bold text-sm text-stone-800">{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="p-2 hover:bg-stone-50 text-stone-600 rounded-full"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Add to Cart button */}
              <button 
                onClick={() => addToCart(product, quantity)}
                className="w-full sm:flex-1 btn-primary flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="h-5 w-5" />
                <span>{t('products.add_to_cart')}</span>
              </button>

            </div>
          )}

        </div>

      </div>

      {/* Reviews list and Submission */}
      <div className="border-t border-stone-200 pt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Review list */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-stone-950 font-display">{t('products.reviews')} ({product.reviews?.length || 0})</h2>
          
          <div className="space-y-6">
            {!product.reviews || product.reviews.length === 0 ? (
              <p className="text-stone-500 font-light italic">No reviews yet for this product.</p>
            ) : (
              product.reviews.map((rev) => (
                <div key={rev.id} className="bg-stone-50 p-6 rounded-2xl border border-stone-200/40 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-stone-900 text-sm">{rev.user_name}</span>
                    <span className="text-xs text-stone-400 font-light">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-4 w-4 ${
                          star <= rev.rating ? 'fill-amber-500 text-amber-500' : 'text-stone-200'
                        }`} 
                      />
                    ))}
                  </div>

                  <p className="text-sm text-stone-600 font-light leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Review form */}
        <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200/50 h-fit space-y-4">
          <h3 className="text-lg font-bold text-stone-950 font-display">{t('products.write_review')}</h3>
          
          {token ? (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              
              {/* Rating selection */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{t('products.rating')}</label>
                <div className="flex items-center space-x-1.5 text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star className={`h-6 w-6 ${star <= newRating ? 'fill-amber-500 text-amber-500' : 'text-stone-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{t('products.comment')}</label>
                <textarea
                  required
                  rows="4"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts about this product..."
                  className="w-full border border-stone-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                ></textarea>
              </div>

              {errorMsg && (
                <div className="text-red-500 text-xs font-semibold flex items-center space-x-1.5">
                  <ShieldAlert className="h-4 w-4" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full btn-primary !py-2.5 text-sm flex items-center justify-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>{submittingReview ? 'Submitting...' : t('products.submit_review')}</span>
              </button>

            </form>
          ) : (
            <div className="text-center py-4 space-y-3">
              <p className="text-xs text-stone-500">You must be logged in to write reviews.</p>
              <Link to="/login" className="inline-block btn-outline !py-2 !px-4 text-xs font-semibold">
                Login / Register
              </Link>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default ProductDetail;
