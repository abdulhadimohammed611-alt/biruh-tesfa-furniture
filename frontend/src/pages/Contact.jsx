import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { pageTransitionVariants } from '../animations/variants';

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate contact form submission
    setSent(true);
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16"
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-900">{t('contact.title')}</h1>
        <p className="text-stone-500 font-light">{t('contact.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Contact info details */}
        <div className="space-y-8 bg-stone-50 p-8 rounded-3xl border border-stone-200/50">
          <h2 className="text-2xl font-bold text-stone-900 font-display">{t('contact.showroom')}</h2>
          
          <div className="space-y-6">
            
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white text-primary-500 rounded-xl border border-stone-150 shadow-2xs mt-1 shrink-0">
                <MapPin className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-stone-850 text-sm">Addis Ababa Office</h4>
                <p className="text-stone-500 text-xs leading-relaxed max-w-xs">{t('contact.address')}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white text-primary-500 rounded-xl border border-stone-150 shadow-2xs shrink-0">
                <Phone className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-stone-850 text-sm">Phone Hotline</h4>
                <p className="text-stone-500 text-xs">+251 911 223344</p>
                <p className="text-stone-500 text-xs">+251 911 556677</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white text-primary-500 rounded-xl border border-stone-150 shadow-2xs shrink-0">
                <Mail className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-stone-850 text-sm">Email Support</h4>
                <p className="text-stone-500 text-xs">info@biruhtesfa.com</p>
                <p className="text-stone-500 text-xs">sales@biruhtesfa.com</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white text-primary-500 rounded-xl border border-stone-150 shadow-2xs shrink-0">
                <Clock className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-stone-850 text-sm">Working Hours</h4>
                <p className="text-stone-500 text-xs leading-relaxed">{t('contact.hours')}</p>
              </div>
            </div>

          </div>
        </div>

        {/* Form panel */}
        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <h2 className="text-2xl font-bold text-stone-900 font-display">
            {t('contact.title').includes('ያግኙን') ? 'መልዕክት ይላኩልን' : 'Send us a Message'}
          </h2>

          {sent ? (
            <div className="p-6 bg-green-50 rounded-2xl border border-green-200 text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
              <p className="text-sm font-semibold text-green-800">{t('contact.success')}</p>
              <button 
                onClick={() => setSent(false)}
                className="btn-outline !py-2 !px-4 text-xs font-semibold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{t('contact.name')}</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Abebe Kebede"
                  className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-stone-50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{t('contact.email')}</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@gmail.com"
                    className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-stone-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{t('contact.phone')}</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+251 9..."
                    className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-stone-50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{t('contact.message')}</label>
                <textarea
                  required
                  rows="5"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Write your details here..."
                  className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-stone-50"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>{t('contact.send')}</span>
              </button>

            </form>
          )}
        </div>

      </div>

    </motion.div>
  );
};

export default Contact;
