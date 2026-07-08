import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, staggerItem, socialIconHoverProps, iconHoverProps } from '../animations/variants';

// Custom SVG Social Icons (since lucide-react brand icons are removed in this build)
const Facebook = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Instagram = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const Twitter = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);

const SocialIcon = ({ href, icon: Icon }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="p-2.5 bg-stone-800/80 text-stone-400 hover:text-primary-400 hover:bg-stone-800 rounded-full border border-stone-800/60 transition-colors"
    style={{ display: 'inline-flex' }}
    {...socialIconHoverProps}
  >
    <Icon className="h-4.5 w-4.5" />
  </motion.a>
);

const Footer = () => {
  const { t } = useTranslation();

  return (
    <motion.footer
      className="bg-stone-900 text-stone-300 pt-16 pb-8 border-t border-stone-850 relative overflow-hidden"
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Background Soft Glow */}
      <div className="absolute bottom-0 left-10 w-[300px] h-[300px] bg-radial-[circle_at_center,_rgba(217,138,27,0.03)_0%,_transparent_70%] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >

          {/* Brand Info & Social Icons */}
          <motion.div className="md:col-span-1 space-y-4" variants={staggerItem}>
            <Link to="/" className="flex items-center space-x-2 text-white group">
              <Sparkles className="h-6 w-6 text-primary-500 group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-xl font-bold tracking-wider font-display">BIRUH TESFA</span>
            </Link>
            <p className="text-sm text-stone-400 leading-relaxed">
              "{t('home.hero_title')}"
            </p>
            <p className="text-xs text-stone-500 italic">
              ብሩህ ተስፋ - Brighten Your Home, Build Your Future.
            </p>
            
            {/* Social Icons with rotation on hover */}
            <div className="flex space-x-2.5 pt-2">
              <SocialIcon href="https://facebook.com" icon={Facebook} />
              <SocialIcon href="https://instagram.com" icon={Instagram} />
              <SocialIcon href="https://twitter.com" icon={Twitter} />
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={staggerItem} className="space-y-4">
            <h3 className="text-white font-medium text-lg">{t('products.categories')}</h3>
            <ul className="space-y-2 text-sm">
              {[
                { to: "/products?category=sofas", label: "Sofas & Living" },
                { to: "/products?category=bedroom", label: "Bedroom" },
                { to: "/products?category=office", label: "Office" },
                { to: "/products?category=dining", label: "Dining" }
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="hover:text-primary-400 transition-colors duration-250 hover:pl-1 block transform">
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/lighting" className="hover:text-primary-400 transition-colors text-primary-400 font-medium hover:pl-1 block transform">
                  {t('nav.lighting')}
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div variants={staggerItem} className="space-y-4">
            <h3 className="text-white font-medium text-lg">Company</h3>
            <ul className="space-y-2 text-sm">
              {[
                { to: "/", label: t('nav.home') },
                { to: "/about", label: t('nav.about') },
                { to: "/gallery", label: t('nav.gallery') },
                { to: "/contact", label: t('nav.contact') }
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="hover:text-primary-400 transition-colors duration-250 hover:pl-1 block transform">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div className="space-y-4" variants={staggerItem}>
            <h3 className="text-white font-medium text-lg">{t('nav.contact')}</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 text-sm text-stone-400 group">
                <motion.div className="mt-0.5 shrink-0 text-primary-500" {...iconHoverProps}>
                  <MapPin className="h-5 w-5" />
                </motion.div>
                <span className="group-hover:text-stone-200 transition-colors">Bole Road, Addis Ababa, Ethiopia</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-stone-400 group">
                <motion.div className="shrink-0 text-primary-500" {...iconHoverProps}>
                  <Phone className="h-5 w-5" />
                </motion.div>
                <span className="group-hover:text-stone-200 transition-colors">+251 911 223344</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-stone-400 group">
                <motion.div className="shrink-0 text-primary-500" {...iconHoverProps}>
                  <Mail className="h-5 w-5" />
                </motion.div>
                <span className="group-hover:text-stone-200 transition-colors">info@biruhtesfa.com</span>
              </div>
            </div>
          </motion.div>

        </motion.div>

        {/* Bottom bar */}
        <div className="border-t border-stone-800 pt-8 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-stone-500">
            <p>&copy; {new Date().getFullYear()} BIRUH TESFA Furniture. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <span className="hover:underline cursor-pointer hover:text-stone-300 transition-colors">Privacy Policy</span>
              <span className="hover:underline cursor-pointer hover:text-stone-300 transition-colors">Terms of Service</span>
              <span className="text-stone-600 font-semibold font-display">Crafted in Ethiopia</span>
            </div>
          </div>

          {/* Developer credit */}
          <motion.p
            className="text-center text-[11px] text-stone-600 tracking-wide pb-1 select-none"
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
          >
            Powered by{' '}
            <span className="text-primary-400 font-semibold hover:text-primary-300 transition-colors duration-300 cursor-default">
              AL-MAHI Software
            </span>
          </motion.p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
