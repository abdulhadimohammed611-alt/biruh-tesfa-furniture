import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { Camera, MapPin, Compass } from 'lucide-react';

const Gallery = () => {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/gallery')
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('API error fetching gallery. Showing local mock setups.', err);
        // Fallback mock setups
        setItems([
          {
            id: 'mock-g-1',
            title_en: 'Modern Addis Living Room Inspiration',
            title_am: 'ዘመናዊ አዲስ የሳሎን ክፍል መነሳሳት',
            image_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
            description_en: 'A fully furnished living space in Bole, Addis Ababa, combining our Emerald Chesterfield Sofa with ambient warm ceiling lights.',
            description_am: 'በቦሌ ፣ አዲስ አበባ የሚገኝ ሙሉ በሙሉ የታጠቁ የመኖሪያ ቦታ ፣ የእኛን ኤመራልድ ቼስተርፊልድ ሶፋ ከሞቃት የጣሪያ መብራቶች ጋር ያገናኘ።'
          },
          {
            id: 'mock-g-2',
            title_en: 'Luxury Suite Bedroom Makeover',
            title_am: 'የቅንጦት መኝታ ቤት ለውጥ',
            image_url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80',
            description_en: 'Featuring the King Size Canopy Bed and modern wood sliding wardrobe, completed with custom bedroom nightstands.',
            description_am: 'የኪንግ ሳይዝ ሮያል አልጋ እና ዘመናዊ የእንጨት ተንሸራታች ቁምሳጥን ፣ ከዘመናዊ የምሽት መደርደሪያዎች ጋር የተሠራ መኝታ ክፍል።'
          },
          {
            id: 'mock-g-3',
            title_en: 'Biruh Tesfa Showroom Display',
            title_am: 'ብሩህ ተስፋ የዕቃዎች ማሳያ',
            image_url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
            description_en: 'A peak into our main showroom layout, highlighting our premium wooden executive office tables and dining sets.',
            description_am: 'የእኛን ዋና የማሳያ ክፍል አቀማመጥ፣ የእንጨት አስፈፃሚ የቢሮ ጠረጴዛዎቻችንን እና የመመገቢያ ስብስቦችን የሚያሳይ።'
          }
        ]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-900">{t('gallery.title')}</h1>
        <p className="text-stone-500 font-light">{t('gallery.subtitle')}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-stone-100 rounded-3xl h-80"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item) => {
            const title = lang === 'am' ? item.title_am : item.title_en;
            const desc = lang === 'am' ? item.description_am : item.description_en;
            return (
              <div 
                key={item.id} 
                className="bg-white rounded-3xl overflow-hidden border border-stone-200/50 shadow-xs hover:shadow-md transition-shadow group"
              >
                
                {/* Image */}
                <div className="h-72 overflow-hidden relative">
                  <img 
                    src={item.image_url} 
                    alt={title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-stone-950/80 backdrop-blur-xs text-white text-xs px-3 py-1 rounded-full flex items-center space-x-1 border border-white/10">
                    <Camera className="h-3.5 w-3.5" />
                    <span>{t('gallery.setup')}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center space-x-2 text-stone-400 text-xs font-semibold">
                    <MapPin className="h-4 w-4 text-primary-500" />
                    <span>Addis Ababa, Ethiopia</span>
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 font-display">{title}</h3>
                  <p className="text-xs text-stone-500 font-light leading-relaxed">
                    {desc}
                  </p>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Gallery;
