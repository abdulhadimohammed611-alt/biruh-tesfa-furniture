import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'ETB');

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const toggleCurrency = () => {
    setCurrency((prev) => (prev === 'ETB' ? 'USD' : 'ETB'));
  };

  // Utility to format price based on selected currency and language
  const formatPrice = (usdPrice, etbPrice, lang = 'en') => {
    const value = currency === 'ETB' ? etbPrice : usdPrice;
    const formatted = new Intl.NumberFormat(lang === 'am' ? 'am-ET' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);

    if (currency === 'ETB') {
      return lang === 'am' ? `${formatted} ብር` : `${formatted} ETB`;
    } else {
      return `$${formatted}`;
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, toggleCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
