import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, Calendar, DollarSign, Edit3, ShoppingBag, Eye, RefreshCw } from 'lucide-react';

const Profile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, token, loading, orderHistory, updateProfile, refreshProfile } = useAuth();
  const { formatPrice } = useCurrency();
  const { lang } = useLanguage();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const [editSuccess, setEditSuccess] = useState('');
  const [editError, setEditError] = useState('');
  const [updating, setUpdating] = useState(false);
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [simulatingPayId, setSimulatingPayId] = useState(null);

  // Sync state values on user load
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
    }
  }, [user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !token) {
      navigate('/login');
    }
  }, [token, loading, navigate]);

  // Verify payment status from provider on redirection
  useEffect(() => {
    const successOrderId = searchParams.get('order_id');
    const orderSuccess = searchParams.get('order_success');
    const mockChapa = searchParams.get('mock_chapa');
    const mockTelebirr = searchParams.get('mock_telebirr');
    const mockStripe = searchParams.get('mock_stripe');
    
    if (successOrderId && (mockChapa || mockTelebirr || mockStripe)) {
      setSimulatingPayId(successOrderId);
    }

    if (successOrderId && orderSuccess === 'true' && token) {
      fetch(`http://localhost:5000/api/orders/verify-payment/${successOrderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          refreshProfile();
          navigate('/profile', { replace: true });
        })
        .catch(err => {
          console.error('Error verifying payment:', err);
        });
    }
  }, [searchParams, token]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setEditSuccess('');
    setEditError('');
    setUpdating(true);

    const res = await updateProfile(name, phone, password || null);
    if (res.success) {
      setEditSuccess('Profile details updated successfully.');
      setPassword('');
    } else {
      setEditError(res.message || 'Failed to update profile.');
    }
    setUpdating(false);
  };

  const handleSimulatePayment = async (orderId) => {
    try {
      const response = await fetch('http://localhost:5000/api/orders/simulate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ order_id: orderId, status: 'paid' })
      });
      const data = await response.json();
      if (response.ok) {
        setSimulatingPayId(null);
        refreshProfile();
        // Clear search params
        navigate('/profile', { replace: true });
      }
    } catch (err) {
      console.error('Simulate payment error:', err);
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setSelectedOrder(data);
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-stone-500">Loading profile data...</div>;
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-950 text-white rounded-3xl p-8 sm:p-12 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-2">
            <span className="text-primary-400 font-bold uppercase tracking-wider text-xs">{t('profile.welcome')}</span>
            <h1 className="text-3xl sm:text-4xl font-bold font-display">{user.name}</h1>
            <p className="text-stone-400 text-sm font-light">{user.email} | Member since {new Date(user.created_at).toLocaleDateString()}</p>
          </div>
          <div className="bg-primary-500/10 border border-primary-500/30 text-primary-400 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
            <ShieldCheck className="h-4 w-4" />
            <span>Customer Account</span>
          </div>
        </div>
      </div>

      {/* 2. Mock payment simulation panel */}
      {simulatingPayId && (
        <div className="p-6 bg-amber-50 text-amber-900 border border-amber-200 rounded-3xl space-y-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-base">🔧 Payments Sandbox Verification</h3>
            <p className="text-xs text-amber-700 leading-relaxed max-w-xl">
              You initialized a payment using **Chapa/Telebirr**. Click the button to simulate the successful webhook callback response from the payment network.
            </p>
          </div>
          <button
            onClick={() => handleSimulatePayment(simulatingPayId)}
            className="btn-primary !bg-amber-600 hover:bg-amber-700 font-semibold text-xs shrink-0 self-start md:self-center"
          >
            Simulate Payment Webhook (Pay order)
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 3. Order History Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center border-b border-stone-200 pb-4">
            <h2 className="text-2xl font-bold text-stone-900 font-display">{t('profile.orders')}</h2>
            <button onClick={refreshProfile} className="p-2 hover:bg-stone-100 rounded-full text-stone-600 transition-colors" title="Reload History">
              <RefreshCw className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="space-y-4">
            {orderHistory.length === 0 ? (
              <div className="p-12 text-center bg-stone-50 rounded-2xl border border-stone-200/50 space-y-4">
                <ShoppingBag className="h-10 w-10 text-stone-300 mx-auto" />
                <p className="text-stone-500 font-light">{t('profile.no_orders')}</p>
              </div>
            ) : (
              orderHistory.map((order) => (
                <div key={order.id} className="bg-white p-6 rounded-2xl border border-stone-200/50 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-stone-100 pb-3">
                    <span className="text-xs text-stone-400 font-semibold font-mono uppercase">ID: {order.id.slice(0,8)}...</span>
                    <span className="text-xs text-stone-400 font-light flex items-center space-x-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-stone-400 text-xs font-semibold uppercase">{t('profile.amount')}</p>
                      <p className="font-bold text-stone-900 mt-0.5">{formatPrice(order.currency === 'USD' ? order.total_amount : 0, order.currency === 'ETB' ? order.total_amount : 0, lang)}</p>
                    </div>
                    <div>
                      <p className="text-stone-400 text-xs font-semibold uppercase">Method</p>
                      <p className="font-medium text-stone-700 mt-0.5 uppercase">{order.payment_method.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-stone-400 text-xs font-semibold uppercase">{t('profile.payment')}</p>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase mt-1 ${
                        order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {order.payment_status}
                      </span>
                    </div>
                    <div>
                      <p className="text-stone-400 text-xs font-semibold uppercase">Delivery</p>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase mt-1 ${
                        order.order_status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {order.order_status}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    {order.payment_status === 'pending' && order.payment_method !== 'bank_transfer' && (
                      <button
                        onClick={() => handleSimulatePayment(order.id)}
                        className="btn-outline !py-1.5 !px-3.5 text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
                      >
                        Complete Sandbox Payment
                      </button>
                    )}
                    <button 
                      onClick={() => viewOrderDetails(order.id)}
                      className="btn-outline !py-1.5 !px-3.5 text-xs flex items-center space-x-1 hover:bg-stone-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View Items</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 4. Edit Profile Panel */}
        <div className="bg-stone-50 p-6 rounded-3xl border border-stone-200/50 h-fit space-y-4">
          <h3 className="text-lg font-bold text-stone-900 font-display flex items-center space-x-2 pb-2 border-b border-stone-200/50">
            <Edit3 className="h-4.5 w-4.5 text-stone-600" />
            <span>{t('profile.update_profile')}</span>
          </h3>

          {editSuccess && <p className="text-xs text-green-600 font-semibold bg-green-50 p-2.5 rounded-lg border border-green-200">{editSuccess}</p>}
          {editError && <p className="text-xs text-red-500 font-semibold bg-red-50 p-2.5 rounded-lg border border-red-200">{editError}</p>}

          <form onSubmit={handleUpdate} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Full Name</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">New Password (leave empty to keep current)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full btn-primary !py-2.5 text-sm"
            >
              {updating ? 'Saving...' : t('profile.save_changes')}
            </button>

          </form>
        </div>

      </div>

      {/* 5. Order Items Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs" onClick={() => setSelectedOrder(null)}></div>
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-bold text-lg text-stone-950 font-display">Order Items</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-stone-100 rounded-full">
                <span className="font-bold text-sm">Close</span>
              </button>
            </div>

            {/* Address */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/40 text-xs space-y-1">
              <p className="font-bold text-stone-700 uppercase">Shipping Address</p>
              <p className="font-semibold text-stone-900">{selectedOrder.shipping_address.name} ({selectedOrder.shipping_address.phone})</p>
              <p className="text-stone-500 font-light">{selectedOrder.shipping_address.street}, {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.country}</p>
            </div>

            {/* Items list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {selectedOrder.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm border-b border-stone-50 pb-2">
                  <div className="flex items-center space-x-3">
                    <img src={item.image} alt={item.name_en} className="w-10 h-10 object-cover rounded bg-stone-100" />
                    <div>
                      <p className="font-bold text-stone-900 line-clamp-1">{lang === 'am' ? item.name_am : item.name_en}</p>
                      <p className="text-stone-400 text-xs font-light">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-stone-850">
                    {formatPrice(selectedOrder.currency === 'USD' ? item.price : 0, selectedOrder.currency === 'ETB' ? item.price : 0, lang)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center font-bold text-stone-900 border-t border-stone-100 pt-3">
              <span>Total Amount:</span>
              <span className="text-lg text-primary-600">
                {formatPrice(
                  selectedOrder.currency === 'USD' ? selectedOrder.total_amount : 0,
                  selectedOrder.currency === 'ETB' ? selectedOrder.total_amount : 0,
                  lang
                )}
              </span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
