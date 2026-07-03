import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { CreditCard, ShieldCheck, ShoppingBag, Truck, MapPin, Phone, ShieldAlert, Sparkles, Building } from 'lucide-react';

const Checkout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cartItems, clearCart, getCartTotalUSD, getCartTotalETB } = useCart();
  const { currency, formatPrice } = useCurrency();
  const { lang } = useLanguage();
  const { user, token } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Addis Ababa');
  const [country, setCountry] = useState('Ethiopia');
  const [paymentMethod, setPaymentMethod] = useState('');

  // Card details (Stripe inline mockup)
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Execution states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successOrder, setSuccessOrder] = useState(null);

  // Sync user info if logged in
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
    }
  }, [user]);

  // Set default payment method based on currency
  useEffect(() => {
    if (currency === 'USD') {
      setPaymentMethod('stripe');
    } else {
      setPaymentMethod('chapa');
    }
  }, [currency]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !successOrder) {
      navigate('/products');
    }
  }, [cartItems, successOrder, navigate]);

  const totalAmount = currency === 'ETB' ? getCartTotalETB() : getCartTotalUSD();

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg('Please register or login first to complete your checkout.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const shippingAddress = { name, phone, street, city, country };
    const cartPayload = cartItems.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      price: currency === 'ETB' ? item.price_etb : item.price_usd
    }));

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cartItems: cartPayload,
          shippingAddress,
          paymentMethod,
          currency,
          totalAmount
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Clear local cart
        clearCart();
        setSuccessOrder(data.order);

        // Process payment flow
        if (paymentMethod === 'stripe' || paymentMethod === 'chapa' || paymentMethod === 'telebirr') {
          if (data.paymentDetails?.checkoutUrl) {
            setTimeout(() => {
              window.location.href = data.paymentDetails.checkoutUrl;
            }, 1500);
          } else {
            navigate(`/profile?order_success=true&order_id=${data.order.id}&mock_${paymentMethod}=true`);
          }
        } else if (paymentMethod === 'bank_transfer') {
          // Bank transfer completes order instantly but payment_status remains pending
          setTimeout(() => {
            navigate('/profile?order_success=true');
          }, 4000);
        }
      } else {
        setErrorMsg(data.message || 'Failed to place order.');
      }
    } catch (err) {
      setErrorMsg('Network error connecting to payment API.');
    } finally {
      setLoading(false);
    }
  };

  if (successOrder) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-stone-200 rounded-3xl text-center space-y-6 shadow-md">
        <Sparkles className="h-16 w-16 text-primary-500 mx-auto animate-bounce" />
        <h2 className="text-2xl font-bold text-stone-900">{t('checkout.success_title')}</h2>
        <div className="p-4 bg-stone-50 rounded-xl text-xs space-y-2 border border-stone-150">
          <p className="text-stone-500 font-light">{t('checkout.success_msg')}</p>
          <p className="font-bold font-mono text-stone-800 text-sm uppercase">{successOrder.id}</p>
        </div>

        {paymentMethod === 'stripe' && (
          <p className="text-sm text-green-600 font-semibold animate-pulse">Processing Stripe Card Transaction...</p>
        )}
        
        {paymentMethod === 'bank_transfer' && (
          <div className="text-left bg-amber-50 p-4 rounded-xl text-xs text-amber-900 border border-amber-200 space-y-2">
            <p className="font-bold">Bank Transfer Instructions:</p>
            <p>Please transfer **{formatPrice(0, successOrder.total_amount, lang)}** to either account:</p>
            <p className="font-semibold">CBE Account: 1000123456789</p>
            <p className="font-semibold">Awash Bank Account: 0132045678900</p>
            <p className="text-[10px] text-amber-700 italic">Please send the transfer confirmation screenshot to support@biruhtesfa.com.</p>
          </div>
        )}

        <p className="text-xs text-stone-400 font-light">Redirecting to profile orders tracker...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <h1 className="text-3xl font-bold text-stone-950 font-display border-b border-stone-200 pb-4">{t('checkout.title')}</h1>

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-500 rounded-2xl border border-red-200 text-sm font-semibold flex items-center space-x-2">
          <ShieldAlert className="h-5 w-5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Address and shipping info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Shipping Form */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-6">
            <h3 className="text-lg font-bold text-stone-900 font-display flex items-center space-x-2 border-b border-stone-100 pb-3">
              <Truck className="h-5 w-5 text-stone-600" />
              <span>{t('checkout.shipping_info')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{t('checkout.fullname')}</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Abebe Kebede"
                  className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-stone-50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{t('checkout.phone')}</label>
                <input
                  required
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+251 9..."
                  className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-stone-50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{t('checkout.street')}</label>
              <input
                required
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="e.g. Bole Subcity, House 123"
                className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-stone-50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{t('checkout.city')}</label>
                <input
                  required
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-stone-50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{t('checkout.country')}</label>
                <input
                  required
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-stone-50"
                />
              </div>
            </div>

          </div>

          {/* Payment Selection */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-6">
            <h3 className="text-lg font-bold text-stone-900 font-display flex items-center space-x-2 border-b border-stone-100 pb-3">
              <CreditCard className="h-5 w-5 text-stone-600" />
              <span>{t('checkout.payment_method')}</span>
            </h3>

            {currency === 'USD' ? (
              // USD Options
              <div className="space-y-4">
                <label className="flex items-center space-x-3 p-4 border border-primary-500 bg-primary-50/20 rounded-2xl cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4.5 w-4.5 text-primary-600 focus:ring-primary-500 border-stone-300"
                  />
                  <div>
                    <span className="font-semibold text-stone-900 text-sm">Stripe / Visa / MasterCard</span>
                    <p className="text-xs text-stone-500 font-light mt-0.5">Pay securely in USD using credit/debit card.</p>
                  </div>
                </label>

                {/* Card input mock UI */}
                {paymentMethod === 'stripe' && (
                  <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200/50 space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Card Number</label>
                      <input
                        required
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full border border-stone-200 rounded-lg p-2.5 text-sm bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Expiration Date</label>
                        <input
                          required
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full border border-stone-200 rounded-lg p-2.5 text-sm bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">CVC</label>
                        <input
                          required
                          type="text"
                          placeholder="123"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full border border-stone-200 rounded-lg p-2.5 text-sm bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // ETB Options
              <div className="space-y-4">
                
                {/* Chapa */}
                <label className={`flex items-center space-x-3 p-4 border rounded-2xl cursor-pointer transition-colors ${
                  paymentMethod === 'chapa' ? 'border-primary-500 bg-primary-50/20' : 'border-stone-200 hover:bg-stone-50'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="chapa"
                    checked={paymentMethod === 'chapa'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4.5 w-4.5 text-primary-600 focus:ring-primary-500 border-stone-300"
                  />
                  <div>
                    <span className="font-semibold text-stone-900 text-sm">Chapa (CBE Birr / Mobile Banking)</span>
                    <p className="text-xs text-stone-500 font-light mt-0.5">Pay in ETB using Ethiopian commercial banks, cards, or wallets.</p>
                  </div>
                </label>

                {/* Telebirr */}
                <label className={`flex items-center space-x-3 p-4 border rounded-2xl cursor-pointer transition-colors ${
                  paymentMethod === 'telebirr' ? 'border-primary-500 bg-primary-50/20' : 'border-stone-200 hover:bg-stone-50'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="telebirr"
                    checked={paymentMethod === 'telebirr'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4.5 w-4.5 text-primary-600 focus:ring-primary-500 border-stone-300"
                  />
                  <div>
                    <span className="font-semibold text-stone-900 text-sm">Telebirr Wallet</span>
                    <p className="text-xs text-stone-500 font-light mt-0.5">Instant checkout with Ethio Telecom mobile money wallet.</p>
                  </div>
                </label>

                {/* Bank Transfer */}
                <label className={`flex items-center space-x-3 p-4 border rounded-2xl cursor-pointer transition-colors ${
                  paymentMethod === 'bank_transfer' ? 'border-primary-500 bg-primary-50/20' : 'border-stone-200 hover:bg-stone-50'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4.5 w-4.5 text-primary-600 focus:ring-primary-500 border-stone-300"
                  />
                  <div className="flex items-start space-x-2">
                    <Building className="h-5 w-5 text-stone-500 mt-0.5" />
                    <div>
                      <span className="font-semibold text-stone-900 text-sm">Direct Bank Transfer</span>
                      <p className="text-xs text-stone-500 font-light mt-0.5">Transfer directly to our Commercial Bank of Ethiopia (CBE) or Awash account.</p>
                    </div>
                  </div>
                </label>

              </div>
            )}

          </div>

        </div>

        {/* Cart items totals sidebar */}
        <div className="bg-stone-50 p-6 sm:p-8 rounded-3xl border border-stone-200 h-fit space-y-6">
          <h3 className="text-lg font-bold text-stone-900 font-display flex items-center space-x-2 border-b border-stone-200/50 pb-3">
            <ShoppingBag className="h-5 w-5 text-stone-600" />
            <span>{t('cart.summary')}</span>
          </h3>

          {/* Items display */}
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs pb-2 border-b border-stone-150">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="font-bold text-stone-950 truncate">{lang === 'am' ? item.name_am : item.name_en}</p>
                  <p className="text-stone-400 font-light">Qty: {item.quantity} x {formatPrice(item.price_usd, item.price_etb, lang)}</p>
                </div>
                <span className="font-semibold text-stone-800 shrink-0">
                  {formatPrice(item.price_usd * item.quantity, item.price_etb * item.quantity, lang)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing calculations */}
          <div className="space-y-2 text-sm pt-2">
            <div className="flex justify-between text-stone-500">
              <span>{t('cart.subtotal')}:</span>
              <span>{formatPrice(getCartTotalUSD(), getCartTotalETB(), lang)}</span>
            </div>
            <div className="flex justify-between text-stone-500 text-xs">
              <span>{t('cart.shipping')}:</span>
              <span className="text-green-600 font-semibold">{t('cart.shipping_free')}</span>
            </div>
            <hr className="border-stone-200 my-2" />
            <div className="flex justify-between font-bold text-stone-950 text-base">
              <span>{t('cart.total')}:</span>
              <span className="text-primary-600 font-display">{formatPrice(currency === 'USD' ? totalAmount : 0, currency === 'ETB' ? totalAmount : 0, lang)}</span>
            </div>
          </div>

          {token ? (
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="h-5 w-5" />
              <span>{loading ? t('checkout.processing') : t('checkout.place_order')}</span>
            </button>
          ) : (
            <div className="text-center pt-2 space-y-3">
              <p className="text-xs text-stone-500">You must be logged in to place an order.</p>
              <Link to="/login" className="w-full btn-outline block text-center text-xs py-2">
                Login / Register
              </Link>
            </div>
          )}

        </div>

      </form>

    </div>
  );
};

export default Checkout;
