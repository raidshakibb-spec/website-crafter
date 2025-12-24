import { useLanguage } from '@/lib/language-context';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SiTelegram } from 'react-icons/si';
import type { PaymentMethod, TelegramChannel, SiteSetting } from '@shared/schema';

export function LeftSidebar() {
  const { t, language } = useLanguage();

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
    <aside className="hidden lg:block w-72 flex-shrink-0">
      <div className="sticky top-20 space-y-6">
        {/* Payment Methods */}
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-4" data-testid="text-payment-title">
            {t('paymentMethods')}
          </h3>
          {loadingPayments ? (
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : paymentMethods && paymentMethods.length > 0 ? (
            <div className="grid grid-cols-3 gap-2" data-testid="grid-payment-methods">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="bg-muted rounded-md p-2 flex items-center justify-center"
                  data-testid={`payment-method-${method.id}`}
                >
                  <img
                    src={method.imageUrl}
                    alt={method.nameAr || 'Payment method'}
                    className="h-8 w-auto object-contain"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? 'لا توجد طرق دفع' : 'No payment methods'}
            </p>
          )}
        </Card>

        {/* Telegram Channels */}
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-4" data-testid="text-telegram-title">
            {t('telegramChannels')}
          </h3>
          {loadingChannels ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : telegramChannels && telegramChannels.length > 0 ? (
            <div className="space-y-3" data-testid="list-telegram-channels">
              {telegramChannels.map((channel) => (
                <a
                  key={channel.id}
                  href={channel.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-md overflow-hidden hover-elevate active-elevate-2"
                  data-testid={`link-telegram-channel-${channel.id}`}
                >
                  <img
                    src={channel.imageUrl}
                    alt={channel.nameAr || 'Telegram channel'}
                    className="w-full h-20 object-cover"
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? 'لا توجد قنوات' : 'No channels'}
            </p>
          )}

          {/* Telegram Contact Button */}
          {telegramUsername && (
            <div className="mt-4 pt-4 border-t border-border">
              <a
                href={`https://t.me/${telegramUsername.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-telegram-contact"
              >
                <Button className="w-full gap-2" variant="default">
                  <SiTelegram className="h-5 w-5" />
                  <span>{t('contactUs')}</span>
                </Button>
              </a>
            </div>
          )}
        </Card>
      </div>
    </aside>
  );
}
