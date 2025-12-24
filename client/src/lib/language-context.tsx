import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: 'rtl' | 'ltr';
  t: (ar: string, en?: string) => string;
  translateText: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<string, Record<Language, string>> = {
  home: { ar: 'الرئيسية', en: 'Home' },
  products: { ar: 'المنتجات', en: 'Products' },
  about: { ar: 'من نحن', en: 'About Us' },
  contact: { ar: 'اتصل بنا', en: 'Contact' },
  search: { ar: 'بحث...', en: 'Search...' },
  allCategories: { ar: 'جميع الفئات', en: 'All Categories' },
  paymentMethods: { ar: 'طرق الدفع', en: 'Payment Methods' },
  telegramChannels: { ar: 'قنوات تيليجرام', en: 'Telegram Channels' },
  contactUs: { ar: 'تواصل معنا', en: 'Contact Us' },
  features: { ar: 'المميزات', en: 'Features' },
  noProducts: { ar: 'لا توجد منتجات', en: 'No products found' },
  loading: { ar: 'جاري التحميل...', en: 'Loading...' },
  admin: { ar: 'لوحة التحكم', en: 'Admin Panel' },
  login: { ar: 'تسجيل الدخول', en: 'Login' },
  logout: { ar: 'تسجيل الخروج', en: 'Logout' },
  username: { ar: 'اسم المستخدم', en: 'Username' },
  password: { ar: 'كلمة المرور', en: 'Password' },
  addProduct: { ar: 'إضافة منتج', en: 'Add Product' },
  editProduct: { ar: 'تعديل المنتج', en: 'Edit Product' },
  deleteProduct: { ar: 'حذف المنتج', en: 'Delete Product' },
  productName: { ar: 'اسم المنتج', en: 'Product Name' },
  productDescription: { ar: 'وصف المنتج', en: 'Product Description' },
  category: { ar: 'الفئة', en: 'Category' },
  imageUrl: { ar: 'رابط الصورة', en: 'Image URL' },
  videoUrl: { ar: 'رابط الفيديو', en: 'Video URL' },
  save: { ar: 'حفظ', en: 'Save' },
  cancel: { ar: 'إلغاء', en: 'Cancel' },
  delete: { ar: 'حذف', en: 'Delete' },
  edit: { ar: 'تعديل', en: 'Edit' },
  banners: { ar: 'البانرات', en: 'Banners' },
  categories: { ar: 'الفئات', en: 'Categories' },
  settings: { ar: 'الإعدادات', en: 'Settings' },
  telegramUsername: { ar: 'اسم مستخدم تيليجرام', en: 'Telegram Username' },
  whatsappNumber: { ar: 'رقم واتساب', en: 'WhatsApp Number' },
  aboutUsContent: { ar: 'محتوى من نحن', en: 'About Us Content' },
  addBanner: { ar: 'إضافة بانر', en: 'Add Banner' },
  addCategory: { ar: 'إضافة فئة', en: 'Add Category' },
  linkUrl: { ar: 'رابط التوجيه', en: 'Link URL' },
  active: { ar: 'نشط', en: 'Active' },
  addPaymentMethod: { ar: 'إضافة طريقة دفع', en: 'Add Payment Method' },
  addTelegramChannel: { ar: 'إضافة قناة تيليجرام', en: 'Add Telegram Channel' },
  welcomeMessage: { ar: 'مرحباً بكم في متجرنا', en: 'Welcome to our store' },
  discoverProducts: { ar: 'اكتشف أفضل منتجاتنا', en: 'Discover our best products' },
  viewProduct: { ar: 'عرض المنتج', en: 'View Product' },
  backToHome: { ar: 'العودة للرئيسية', en: 'Back to Home' },
  contactVia: { ar: 'تواصل عبر', en: 'Contact via' },
  aboutUsTitle: { ar: 'من نحن', en: 'About Us' },
  aboutUsDesc: { ar: 'نحن نقدم أفضل المنتجات بأعلى جودة وأفضل الأسعار. هدفنا هو إرضاء عملائنا وتقديم تجربة تسوق مميزة.', en: 'We offer the best products with the highest quality and best prices. Our goal is to satisfy our customers and provide a unique shopping experience.' },
};

function detectBrowserLanguage(): Language {
  const browserLang = navigator.language || (navigator as any).userLanguage;
  if (browserLang && browserLang.startsWith('ar')) {
    return 'ar';
  }
  return 'ar'; // Default to Arabic
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    if (saved === 'ar' || saved === 'en') return saved;
    return detectBrowserLanguage();
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  const t = (key: string, fallback?: string): string => {
    if (translations[key]) {
      return translations[key][language];
    }
    return fallback || key;
  };

  const translateText = (text: string): string => {
    if (language === 'ar' || !text) return text;
    // Simple translation - in production, you'd use a real translation API
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dir, t, translateText }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
