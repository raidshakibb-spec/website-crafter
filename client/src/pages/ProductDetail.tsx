import { useRoute, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { SiTelegram, SiWhatsapp } from 'react-icons/si';
import { useLanguage } from '@/lib/language-context';
import { MobileSidebar } from '@/components/MobileSidebar';
import type { Product, SiteSetting } from '@shared/schema';

export default function ProductDetail() {
  const [, params] = useRoute('/product/:id');
  const { t, language, dir } = useLanguage();

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ['/api/products', params?.id],
    enabled: !!params?.id,
  });

  const { data: settings } = useQuery<SiteSetting[]>({
    queryKey: ['/api/settings'],
  });

  const telegramUsername = settings?.find(s => s.key === 'telegramUsername')?.value || '';
  const whatsappNumber = settings?.find(s => s.key === 'whatsappNumber')?.value || '';

  const displayName = language === 'ar' ? product?.nameAr : (product?.nameEn || product?.nameAr);
  const displayDescription = language === 'ar' ? product?.descriptionAr : (product?.descriptionEn || product?.descriptionAr);
  const features = language === 'ar' ? (product?.featuresAr || []) : (product?.featuresEn || product?.featuresAr || []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-3">
              <Skeleton className="aspect-video w-full rounded-lg" />
            </div>
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="space-y-2 mt-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-16 text-center">
          <p className="text-muted-foreground text-lg mb-4">
            {language === 'ar' ? 'المنتج غير موجود' : 'Product not found'}
          </p>
          <Link href="/">
            <Button variant="default" className="gap-2">
              {dir === 'rtl' ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
              {t('backToHome')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="page-product-detail">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <Link href="/">
          <Button variant="ghost" className="gap-2 mb-6" data-testid="link-back-home">
            {dir === 'rtl' ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {t('backToHome')}
          </Button>
        </Link>

        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3">
            {product.videoUrl ? (
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-black" data-testid="product-video">
                <video
                  src={product.videoUrl}
                  controls
                  className="w-full h-full object-contain"
                  poster={product.imageUrl || undefined}
                >
                  <source src={product.videoUrl} type="video/mp4" />
                </video>
              </div>
            ) : product.imageUrl ? (
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted" data-testid="product-image">
                <img
                  src={product.imageUrl}
                  alt={displayName || 'Product'}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">
                  {language === 'ar' ? 'لا توجد صورة أو فيديو' : 'No image or video'}
                </p>
              </div>
            )}

            {(telegramUsername || whatsappNumber) && (
              <div className="flex flex-wrap gap-3 mt-4" data-testid="contact-buttons">
                {telegramUsername && (
                  <a
                    href={telegramUsername.startsWith('http') ? telegramUsername : `https://t.me/${telegramUsername.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="link-telegram-contact"
                  >
                    <Button variant="outline" className="gap-2">
                      <SiTelegram className="h-5 w-5 text-[#0088cc]" />
                      <span>{language === 'ar' ? 'تواصل عبر تيليجرام' : 'Contact on Telegram'}</span>
                    </Button>
                  </a>
                )}
                {whatsappNumber && (
                  <a
                    href={whatsappNumber.startsWith('http') ? whatsappNumber : `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="link-whatsapp-contact"
                  >
                    <Button variant="outline" className="gap-2">
                      <SiWhatsapp className="h-5 w-5 text-[#25D366]" />
                      <span>{language === 'ar' ? 'تواصل عبر واتساب' : 'Contact on WhatsApp'}</span>
                    </Button>
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <h1 
              className="text-2xl md:text-3xl font-bold text-foreground mb-4"
              data-testid="text-product-title"
            >
              {displayName || (language === 'ar' ? 'منتج بدون اسم' : 'Unnamed product')}
            </h1>

            {displayDescription && (
              <p 
                className="text-muted-foreground mb-6"
                data-testid="text-product-description"
              >
                {displayDescription}
              </p>
            )}

            {features.length > 0 && (
              <div className="space-y-2" data-testid="list-product-features">
                <h2 className="font-semibold text-foreground mb-3">
                  {t('features')}
                </h2>
                {features.map((feature, index) => (
                  <Card 
                    key={index} 
                    className="p-4 flex items-start gap-3"
                    data-testid={`feature-${index}`}
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-foreground">
                      {feature}
                    </span>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <MobileSidebar />
    </div>
  );
}
