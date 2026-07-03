import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Sparkles } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-8 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center space-x-2 text-white">
              <Sparkles className="h-6 w-6 text-primary-500" />
              <span className="text-xl font-bold tracking-wider font-display">BIRUH TESFA</span>
            </Link>
            <p className="text-sm text-stone-400">
              "{t('home.hero_title')}"
            </p>
            <p className="text-xs text-stone-500 italic">
              ብሩህ ተስፋ - Brighten Your Home, Build Your Future.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-medium mb-4 text-lg">{t('products.categories')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products?category=sofas" className="hover:text-primary-500 transition-colors">
                  Sofas & Living
                </Link>
              </li>
              <li>
                <Link to="/products?category=bedroom" className="hover:text-primary-500 transition-colors">
                  Bedroom
                </Link>
              </li>
              <li>
                <Link to="/products?category=office" className="hover:text-primary-500 transition-colors">
                  Office
                </Link>
              </li>
              <li>
                <Link to="/products?category=dining" className="hover:text-primary-500 transition-colors">
                  Dining
                </Link>
              </li>
              <li>
                <Link to="/lighting" className="hover:text-primary-500 transition-colors text-primary-400 font-medium">
                  {t('nav.lighting')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-medium mb-4 text-lg">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-primary-500 transition-colors">{t('nav.home')}</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary-500 transition-colors">{t('nav.about')}</Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-primary-500 transition-colors">{t('nav.gallery')}</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary-500 transition-colors">{t('nav.contact')}</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="text-white font-medium mb-4 text-lg">{t('nav.contact')}</h3>
            <div className="flex items-start space-x-3 text-sm text-stone-400">
              <MapPin className="h-5 w-5 text-primary-500 shrink-0 mt-0.5" />
              <span>Bole Road, Addis Ababa, Ethiopia</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-stone-400">
              <Phone className="h-5 w-5 text-primary-500 shrink-0" />
              <span>+251 911 223344</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-stone-400">
              <Mail className="h-5 w-5 text-primary-500 shrink-0" />
              <span>info@biruhtesfa.com</span>
            </div>
          </div>
          
        </div>

        {/* Divider */}
        <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-stone-500">
          <p>&copy; {new Date().getFullYear()} BIRUH TESFA Furniture. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span className="text-stone-600 font-semibold font-display">Crafted in Ethiopia</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
