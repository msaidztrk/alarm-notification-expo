import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { i18n, initializeLocale, setLocale } from './i18n';

// Language Context
interface LanguageContextType {
  language: string;
  isReady: boolean;
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
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeLocale().then(() => {
      setLanguageState(i18n.locale);
      setIsReady(true);
    });
  }, []);

  const setLanguage = useCallback(async (locale: string) => {
    await setLocale(locale);
    setLanguageState(locale);
  }, []);

  // t fonksiyonu her language değiştiğinde yeni referans alır
  // Bu sayede bileşenler yeniden render edilir
  const t = useCallback((key: string, params?: any): string => {
    return i18n.t(key, params);
  }, [language]); // language değiştiğinde t fonksiyonu yenilenir

  return (
    <LanguageContext.Provider value={{ language, isReady, setLanguage, t }}>
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