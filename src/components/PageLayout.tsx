
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        language={language}
        setLanguage={setLanguage}
      />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PageLayout;
