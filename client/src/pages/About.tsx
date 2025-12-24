import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/lib/language-context';
import { useQuery } from '@tanstack/react-query';
import { MobileSidebar } from '@/components/MobileSidebar';
import type { SiteSetting } from '@shared/schema';

export default function About() {
  const { t, language } = useLanguage();

  const { data: settings } = useQuery<SiteSetting[]>({
    queryKey: ['/api/settings'],
  });

  const aboutContent = settings?.find(s => s.key === 'aboutUsContent')?.value || '';
  
  const defaultContent = language === 'ar' 
    ? 'نحن نقدم أفضل المنتجات بأعلى جودة وأفضل الأسعار. هدفنا هو إرضاء عملائنا وتقديم تجربة تسوق مميزة. نسعى دائماً لتوفير منتجات متنوعة تلبي احتياجات جميع عملائنا.'
    : 'We offer the best products with the highest quality and best prices. Our goal is to satisfy our customers and provide a unique shopping experience. We always strive to provide diverse products that meet the needs of all our customers.';

  return (
    <div className="min-h-screen bg-background" data-testid="page-about">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <Card className="p-6 md:p-8">
          <h1 
            className="text-3xl md:text-4xl font-bold text-foreground mb-6"
            data-testid="text-about-title"
          >
            {t('aboutUsTitle')}
          </h1>
          
          <div 
            className="prose prose-lg dark:prose-invert max-w-none"
            data-testid="text-about-content"
          >
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {aboutContent || defaultContent}
            </p>
          </div>
        </Card>
      </div>

      <MobileSidebar />
    </div>
  );
}
