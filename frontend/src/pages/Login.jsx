import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogIn, UserPlus } from 'lucide-react';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, register, user } = useAuth();

  const [isLoginView, setIsLoginView] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, redirect to profile
  React.useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    let res;
    if (isLoginView) {
      res = await login(formData.email, formData.password);
    } else {
      res = await register(formData.name, formData.email, formData.password, formData.phone);
    }

    if (res.success) {
      navigate('/profile');
    } else {
      setErrorMsg(res.message || 'Authentication failed. Please verify your credentials.');
    }
    setSubmitting(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-md mx-auto my-20 px-4 sm:px-6">
      <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
        
        {/* Header Title */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-stone-950 font-display">
            {isLoginView ? t('auth.login') : t('auth.register')}
          </h1>
          <p className="text-xs text-stone-500 font-light">
            {isLoginView 
              ? 'Enter email and password to access your dashboard' 
              : 'Fill in details to create a free customer account'}
          </p>
        </div>

        {/* Error panel */}
        {errorMsg && (
          <div className="p-3.5 bg-red-50 text-red-500 rounded-xl border border-red-200 text-xs font-semibold flex items-center space-x-2">
            <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name - only for Register */}
          {!isLoginView && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Full Name</label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Abebe Kebede"
                className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-stone-50"
              />
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{t('auth.email')}</label>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="example@gmail.com"
              className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-stone-50"
            />
          </div>

          {/* Phone - only for Register */}
          {!isLoginView && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+251 9..."
                className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-stone-50"
              />
            </div>
          )}

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{t('auth.password')}</label>
            <input
              required
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-stone-50"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            {isLoginView ? <LogIn className="h-4.5 w-4.5" /> : <UserPlus className="h-4.5 w-4.5" />}
            <span>
              {submitting 
                ? 'Processing...' 
                : (isLoginView ? t('auth.signin_btn') : t('auth.signup_btn'))}
            </span>
          </button>

        </form>

        {/* View Switch toggle */}
        <div className="text-center pt-2">
          <button
            onClick={() => {
              setIsLoginView(!isLoginView);
              setErrorMsg('');
            }}
            className="text-xs text-primary-600 hover:text-primary-700 font-semibold underline"
          >
            {isLoginView ? t('auth.no_account') : t('auth.has_account')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;
