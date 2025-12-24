import { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, MessageCircle } from 'lucide-react';
import { SiTelegram } from 'react-icons/si';
import type { PaymentMethod, TelegramChannel, SiteSetting } from '@shared/schema';

export function MobileSidebar() {
  const { t, language, dir } = useLanguage();

  const { data: paymentMethods, isLoading: loadingPayments } = useQuery<PaymentMethod[]>({
    queryKey: ['/api/payment-methods'],
  });

  const { data: telegramChannels, isLoading: loadingChannels } = useQuery<TelegramChannel[]>({
    queryKey: ['/api/telegram-channels'],
  });

  const { data: settings } = useQuery<SiteSetting[]>({
    queryKey: ['/api/settings'],
  });

  const telegramUsername = settings?.find(s => s.key === 'telegramUsername')?.value || '';

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border safe-area-bottom" data-testid="mobile-sidebar-buttons">
      <div className="flex gap-2 p-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="default" className="flex-1 gap-2 h-12 rounded-xl" data-testid="button-mobile-payments">
              <CreditCard className="h-5 w-5" />
              <span className="font-medium">{t('paymentMethods')}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side={dir === 'rtl' ? 'right' : 'left'} className="w-[85vw] max-w-sm">
            <SheetHeader>
              <SheetTitle>{t('paymentMethods')}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              {loadingPayments ? (
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : paymentMethods && paymentMethods.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="bg-muted rounded-lg p-3 flex items-center justify-center"
                    >
                      <img
                        src={method.imageUrl}
                        alt={method.nameAr || 'Payment method'}
                        className="h-10 w-auto object-contain"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {language === 'ar' ? 'لا توجد طرق دفع' : 'No payment methods'}
                </p>
              )}
            </div>
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="secondary" className="flex-1 gap-2 h-12 rounded-xl" data-testid="button-mobile-telegram">
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">{t('telegramChannels')}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side={dir === 'rtl' ? 'left' : 'right'} className="w-[85vw] max-w-sm">
            <SheetHeader>
              <SheetTitle>{t('telegramChannels')}</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              {loadingChannels ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                  ))}
                </div>
              ) : telegramChannels && telegramChannels.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {telegramChannels.map((channel) => (
                    <a
                      key={channel.id}
                      href={channel.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg overflow-hidden hover-elevate active-elevate-2"
                    >
                      <img
                        src={channel.imageUrl}
                        alt={channel.nameAr || 'Telegram channel'}
                        className="w-full h-14 object-cover"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {language === 'ar' ? 'لا توجد قنوات' : 'No channels'}
                </p>
              )}

              {telegramUsername && (
                <div className="pt-4 border-t border-border">
                  <a
                    href={`https://t.me/${telegramUsername.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full gap-2 h-12 rounded-xl" variant="default">
                      <SiTelegram className="h-5 w-5" />
                      <span>{t('contactUs')}</span>
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
