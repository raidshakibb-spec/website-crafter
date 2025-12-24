import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language-context';
import type { Banner } from '@shared/schema';

export function BannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { dir } = useLanguage();

  const { data: banners, isLoading } = useQuery<Banner[]>({
    queryKey: ['/api/banners'],
  });

  const activeBanners = banners?.filter(b => b.isActive) || [];

  useEffect(() => {
    if (activeBanners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [activeBanners.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  if (isLoading) {
    return (
      <div className="w-full aspect-[16/9] md:aspect-[21/8]">
        <Skeleton className="w-full h-full rounded-lg" />
      </div>
    );
  }

  if (activeBanners.length === 0) {
    return null;
  }

  return (
    <div 
      className="relative w-full aspect-[16/9] md:aspect-[21/8] rounded-lg overflow-hidden group"
      data-testid="banner-carousel"
    >
      {activeBanners.map((banner, index) => (
        <a
          key={banner.id}
          href={banner.linkUrl || '#'}
          target={banner.linkUrl ? '_blank' : undefined}
          rel={banner.linkUrl ? 'noopener noreferrer' : undefined}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          data-testid={`banner-${banner.id}`}
        >
          <img
            src={banner.imageUrl}
            alt="Banner"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            loading={index === 0 ? 'eager' : 'lazy'}
          />
        </a>
      ))}

      {/* Navigation Arrows */}
      {activeBanners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity`}
            onClick={(e) => {
              e.preventDefault();
              dir === 'rtl' ? goToNext() : goToPrevious();
            }}
            data-testid="button-banner-prev"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`absolute ${dir === 'rtl' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity`}
            onClick={(e) => {
              e.preventDefault();
              dir === 'rtl' ? goToPrevious() : goToNext();
            }}
            data-testid="button-banner-next"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2" data-testid="banner-dots">
          {activeBanners.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-white w-6' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              data-testid={`button-banner-dot-${index}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
