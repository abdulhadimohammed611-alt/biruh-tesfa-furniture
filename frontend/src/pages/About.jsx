import React from 'react';
import { useTranslation } from 'react-i18next';
import { Award, Hammer, Compass, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { pageTransitionVariants } from '../animations/variants';

const About = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      className="pb-20 space-y-20"
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      
      {/* Header Banner */}
      <div className="relative bg-stone-900 text-white py-24 text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80" 
            alt="Showroom wood detailing" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold font-display">{t('about.title')}</h1>
          <p className="text-primary-400 font-medium tracking-wide">{t('about.subtitle')}</p>
        </div>
      </div>

      {/* Main Narrative */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-stone-900 font-display">
              {t('about.title').includes('ስለ') ? 'ታሪካችን' : 'Our Story'}
            </h2>
            <p className="text-stone-600 font-light leading-relaxed">
              {t('about.p1')}
            </p>
            <p className="text-stone-600 font-light leading-relaxed">
              {t('about.p2')}
            </p>
          </div>
          <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-lg border border-stone-200">
            <img 
              src="https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80" 
              alt="Artisan workshop" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Craftsmanship details */}
      <div className="bg-stone-100/70 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-bold text-stone-900 font-display">{t('about.craftsmanship')}</h2>
            <p className="text-stone-500 font-light">{t('about.craft_desc')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            <div className="bg-white p-6 rounded-2xl shadow-xs text-center space-y-3 border border-stone-200/50">
              <div className="p-3 bg-amber-50 text-primary-600 rounded-xl w-fit mx-auto">
                <Hammer className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-stone-900">Custom Joints</h3>
              <p className="text-xs text-stone-500 leading-relaxed">We employ mortise-and-tenon joints for furniture that lasts generations.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xs text-center space-y-3 border border-stone-200/50">
              <div className="p-3 bg-amber-50 text-primary-600 rounded-xl w-fit mx-auto">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-stone-900">Premium Woods</h3>
              <p className="text-xs text-stone-500 leading-relaxed">Sourcing high-quality local Wanza and Kerero alongside imported oak and walnut.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xs text-center space-y-3 border border-stone-200/50">
              <div className="p-3 bg-amber-50 text-primary-600 rounded-xl w-fit mx-auto">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-stone-900">Lighting Precision</h3>
              <p className="text-xs text-stone-500 leading-relaxed">Optically tested crystal arrays designed to diffuse light uniformly.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xs text-center space-y-3 border border-stone-200/50">
              <div className="p-3 bg-amber-50 text-primary-600 rounded-xl w-fit mx-auto">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-stone-900">Local Design</h3>
              <p className="text-xs text-stone-500 leading-relaxed">Supporting and training promising design graduates from Addis Ababa University.</p>
            </div>

          </div>
        </div>
      </div>

    </motion.div>
  );
};

export default About;
