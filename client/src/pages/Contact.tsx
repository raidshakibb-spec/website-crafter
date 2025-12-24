import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language-context';
import { useQuery } from '@tanstack/react-query';
import { MobileSidebar } from '@/components/MobileSidebar';
import { SiTelegram, SiWhatsapp } from 'react-icons/si';
import type { SiteSetting } from '@shared/schema';

export default function Contact() {
  const { t, language } = useLanguage();

  const { data: settings } = useQuery<SiteSetting[]>({
    queryKey: ['/api/settings'],
  });

  const telegramUsername = settings?.find(s => s.key === 'telegramUsername')?.value || '';
  const whatsappNumber = settings?.find(s => s.key === 'whatsappNumber')?.value || '';

  return (
    <div className="min-h-screen bg-background" data-testid="page-contact">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <Card className="p-6 md:p-8">
          <h1 
            className="text-3xl md:text-4xl font-bold text-foreground mb-6"
            data-testid="text-contact-title"
          >
            {t('contactUs')}
          </h1>
          
          <p className="text-muted-foreground mb-8">
            {language === 'ar' 
              ? 'يمكنك التواصل معنا من خلال القنوات التالية:'
              : 'You can contact us through the following channels:'}
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {telegramUsername && (
              <a
                href={`https://t.me/${telegramUsername.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-contact-telegram"
              >
                <Card className="p-6 hover-elevate active-elevate-2 cursor-pointer h-full">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#0088cc]/10 flex items-center justify-center">
                      <SiTelegram className="h-8 w-8 text-[#0088cc]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {t('contactVia')} Telegram
                      </h3>
                      <p className="text-sm text-muted-foreground">https://t.me/{telegramUsername.replace('@', '')}</p>
                    </div>
                  </div>
                </Card>
              </a>
            )}

            {whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-contact-whatsapp"
              >
                <Card className="p-6 hover-elevate active-elevate-2 cursor-pointer h-full">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                      <SiWhatsapp className="h-8 w-8 text-[#25D366]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {t('contactVia')} WhatsApp
                      </h3>
                      <p className="text-sm text-muted-foreground">{whatsappNumber}</p>
                    </div>
                  </div>
                </Card>
              </a>
            )}
          </div>

          {!telegramUsername && !whatsappNumber && (
            <p className="text-muted-foreground text-center py-8">
              {language === 'ar' 
                ? 'لم يتم تحديد معلومات التواصل بعد.'
                : 'Contact information has not been set up yet.'}
            </p>
          )}
        </Card>
      </div>

      <MobileSidebar />
    </div>
  );
}
