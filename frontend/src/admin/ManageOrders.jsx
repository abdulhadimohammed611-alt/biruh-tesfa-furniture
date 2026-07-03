import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { ShoppingCart, Eye, Edit3, Calendar, DollarSign, RefreshCw } from 'lucide-react';

const ManageOrders = () => {
  const { token } = useAuth();
  const { formatPrice } = useCurrency();
  const { lang } = useLanguage();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/admin/orders', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOrderStatusChange = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ order_status: status })
      });

      if (response.ok) {
        fetchOrders();
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder({ ...selectedOrder, order_status: status });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePaymentChange = async (id, paymentStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/orders/${id}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ payment_status: paymentStatus })
      });

      if (response.ok) {
        fetchOrders();
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder({ ...selectedOrder, payment_status: paymentStatus });
        }
      }
    } catch (err) {
      console.error(err);
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

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-display">Manage Orders</h1>
          <p className="text-xs text-stone-500 font-light">Order verification, payments check, and logistics status pipeline.</p>
        </div>
        <button 
          onClick={fetchOrders}
          className="p-2 hover:bg-white border border-stone-200 bg-stone-50 rounded-lg text-stone-600 transition-colors"
          title="Reload Registry"
        >
          <RefreshCw className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-2xl border border-stone-200/50 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-stone-500">Loading orders...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-stone-50 text-stone-400 uppercase border-b border-stone-200/50">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4 text-right">Total Amount</th>
                  <th className="p-4 text-center">Payment Status</th>
                  <th className="p-4 text-center">Shipping Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="text-stone-700 hover:bg-stone-50/50">
                    <td className="p-4 font-semibold font-mono uppercase">{ord.id.slice(0, 8)}...</td>
                    <td className="p-4 space-y-0.5">
                      <p className="font-bold text-stone-900">{ord.user_name || 'Guest Customer'}</p>
                      <p className="text-[10px] text-stone-400">{ord.user_email}</p>
                    </td>
                    <td className="p-4 text-stone-500">{new Date(ord.created_at).toLocaleDateString()}</td>
                    <td className="p-4 uppercase font-mono">{ord.payment_method.replace('_', ' ')}</td>
                    <td className="p-4 text-right font-bold">
                      {formatPrice(
                        ord.currency === 'USD' ? ord.total_amount : 0,
                        ord.currency === 'ETB' ? ord.total_amount : 0,
                        lang
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <select
                        value={ord.payment_status}
                        onChange={(e) => handlePaymentChange(ord.id, e.target.value)}
                        className={`text-[10px] font-bold uppercase rounded-full px-2.5 py-0.5 border ${
                          ord.payment_status === 'paid' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                      </select>
                    </td>
                    <td className="p-4 text-center">
                      <select
                        value={ord.order_status}
                        onChange={(e) => handleOrderStatusChange(ord.id, e.target.value)}
                        className={`text-[10px] font-bold uppercase rounded-full px-2.5 py-1.5 border focus:outline-none transition-colors ${
                          ord.order_status === 'delivered' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : ord.order_status === 'cancelled'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : ord.order_status === 'shipped' || ord.order_status === 'out_for_delivery'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="processing">Processing</option>
                        <option value="packed">Packed</option>
                        <option value="ready_for_pickup">Ready for Pickup</option>
                        <option value="shipped">Shipped</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => viewOrderDetails(ord.id)}
                        className="btn-outline !py-1.5 !px-3 text-[10px] flex items-center space-x-1 hover:bg-stone-50 mx-auto"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs" onClick={() => setSelectedOrder(null)}></div>
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-sm">
            
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-bold text-lg text-stone-950 font-display">Order registry details</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-stone-100 rounded-full font-bold">
                Close
              </button>
            </div>

            {/* Address */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/40 space-y-1.5 text-xs">
              <p className="font-bold text-stone-700 uppercase">Customer Shipping details</p>
              <p className="font-semibold text-stone-900">{selectedOrder.shipping_address.name} ({selectedOrder.shipping_address.phone})</p>
              <p className="text-stone-500 font-light">{selectedOrder.shipping_address.street}, {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.country}</p>
            </div>

            {/* Items */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {selectedOrder.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center border-b border-stone-50 pb-2">
                  <div className="flex items-center space-x-3">
                    <img src={item.image} alt={item.name_en} className="w-10 h-10 object-cover rounded bg-stone-100" />
                    <div>
                      <p className="font-bold text-stone-900 line-clamp-1">{item.name_en}</p>
                      <p className="text-stone-400 text-xs">Quantity: {item.quantity}</p>
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

export default ManageOrders;
