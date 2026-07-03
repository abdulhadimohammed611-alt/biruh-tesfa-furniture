import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { DollarSign, ShoppingBag, Users, Layers, TrendingUp, Calendar } from 'lucide-react';

const Dashboard = () => {
  const { token } = useAuth();
  const { formatPrice } = useCurrency();
  const { lang } = useLanguage();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching admin stats:', err);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return <div className="text-center py-20 text-stone-500 font-light">Loading analytical statistics...</div>;
  }

  if (!stats) return <div className="text-red-500 font-bold">Failed to load statistics.</div>;

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-display">Analytics Overview</h1>
        <p className="text-xs text-stone-500 font-light">Real-time performance details for BIRUH TESFA Furniture.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Revenue ETB */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/50 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Revenue (ETB)</span>
            <p className="text-2xl font-bold text-stone-900 font-display">{formatPrice(0, stats.revenue?.ETB || 0, 'en')}</p>
          </div>
          <div className="p-3 bg-amber-50 text-primary-500 rounded-xl">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        {/* Revenue USD */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/50 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Revenue (USD)</span>
            <p className="text-2xl font-bold text-stone-900 font-display">{formatPrice(stats.revenue?.USD || 0, 0, 'en')}</p>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        {/* Orders Count */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/50 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Total Orders</span>
            <p className="text-2xl font-bold text-stone-900 font-display">{stats.counts?.orders || 0}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
            <ShoppingBag className="h-6 w-6" />
          </div>
        </div>

        {/* Users Count */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/50 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Active Customers</span>
            <p className="text-2xl font-bold text-stone-900 font-display">{stats.counts?.users || 0}</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-500 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Categories Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/50 shadow-2xs space-y-4">
          <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wider flex items-center space-x-2 pb-3 border-b border-stone-100">
            <Layers className="h-4.5 w-4.5 text-stone-600" />
            <span>Category Mix</span>
          </h3>
          
          <div className="space-y-4.5">
            {Object.entries(stats.categories || {}).map(([cat, count]) => {
              const totalProds = stats.counts?.products || 1;
              const percent = Math.round((count / totalProds) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-stone-700">
                    <span className="capitalize">{cat}</span>
                    <span>{count} items ({percent}%)</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Trend Data */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-200/50 shadow-2xs space-y-4">
          <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wider flex items-center space-x-2 pb-3 border-b border-stone-100">
            <TrendingUp className="h-4.5 w-4.5 text-stone-600" />
            <span>Sales Trends (Last 6 Months)</span>
          </h3>

          <div className="space-y-4 overflow-x-auto">
            {stats.salesChart?.length === 0 ? (
              <p className="text-stone-400 text-xs italic py-8 text-center">No monthly historical sales completed yet.</p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-stone-400 uppercase border-b border-stone-100 pb-2">
                    <th className="py-2">Month</th>
                    <th className="py-2">Currency</th>
                    <th className="py-2 text-right">Volume Sold</th>
                    <th className="py-2 text-right">Paid Orders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {stats.salesChart?.map((row, idx) => (
                    <tr key={idx} className="text-stone-700 hover:bg-stone-50">
                      <td className="py-3 font-semibold">{row.month}</td>
                      <td className="py-3 uppercase font-mono">{row.currency}</td>
                      <td className="py-3 text-right font-bold">
                        {formatPrice(
                          row.currency === 'USD' ? row.sales : 0,
                          row.currency === 'ETB' ? row.sales : 0,
                          lang
                        )}
                      </td>
                      <td className="py-3 text-right font-semibold">{row.orders_count} completed</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

      {/* Recent Orders table */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/50 shadow-2xs space-y-4">
        <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wider flex items-center space-x-2 pb-3 border-b border-stone-100">
          <Calendar className="h-4.5 w-4.5 text-stone-600" />
          <span>Recent Transactions</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-stone-400 uppercase border-b border-stone-100 pb-2">
                <th className="py-2">Order ID</th>
                <th className="py-2">Customer</th>
                <th className="py-2">Date</th>
                <th className="py-2">Method</th>
                <th className="py-2 text-right">Total Amount</th>
                <th className="py-2 text-center">Payment</th>
                <th className="py-2 text-center">Shipping</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {stats.recentOrders?.map((ord) => (
                <tr key={ord.id} className="text-stone-700 hover:bg-stone-50">
                  <td className="py-3 font-semibold font-mono uppercase">{ord.id.slice(0, 8)}...</td>
                  <td className="py-3 font-medium">{ord.user_name || 'Guest User'}</td>
                  <td className="py-3 font-light">{new Date(ord.created_at).toLocaleDateString()}</td>
                  <td className="py-3 uppercase font-mono">{ord.payment_method.replace('_', ' ')}</td>
                  <td className="py-3 text-right font-bold">
                    {formatPrice(
                      ord.currency === 'USD' ? ord.total_amount : 0,
                      ord.currency === 'ETB' ? ord.total_amount : 0,
                      lang
                    )}
                  </td>
                  <td className="py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      ord.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {ord.payment_status}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      ord.order_status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {ord.order_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
