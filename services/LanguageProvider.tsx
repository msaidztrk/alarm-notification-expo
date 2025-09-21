import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { i18n, initializeLocale, setLocale } from './i18n';

// Language Context
interface LanguageContextType {
  language: string;
  setLanguage: (locale: string) => Promise<void>;
  t: (key: string, params?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Language Provider Component
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState(i18n.locale);

  useEffect(() => {
    initializeLocale().then(() => {
      setLanguageState(i18n.locale);
    });
  }, []);

  const setLanguage = async (locale: string) => {
    await setLocale(locale);
    setLanguageState(locale);
  };

  const t = (key: string, params?: any) => {
    return i18n.t(key, params);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use language context
export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};