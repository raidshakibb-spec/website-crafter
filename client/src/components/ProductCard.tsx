import { Link } from 'wouter';
import { Card } from '@/components/ui/card';
import { Eye } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import type { Product } from '@shared/schema';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { t, language } = useLanguage();
  
  const displayName = language === 'ar' ? product.nameAr : (product.nameEn || product.nameAr);

  return (
    <Link href={`/product/${product.id}`}>
      <Card 
        className="overflow-hidden group cursor-pointer hover-elevate active-elevate-2 h-full"
        data-testid={`card-product-${product.id}`}
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={displayName || 'Product'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs md:text-sm">
              {language === 'ar' ? 'لا توجد صورة' : 'No image'}
            </div>
          )}
          
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:inset-x-0 md:translate-x-0">
            <div className="flex items-center justify-center gap-1.5 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs md:text-sm md:opacity-0 md:group-hover:opacity-100 transition-opacity md:mx-auto md:w-fit">
              <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span>{t('viewProduct')}</span>
            </div>
          </div>
        </div>
        
        <div className="p-2 md:p-4">
          <h3 
            className="font-medium md:font-semibold text-foreground line-clamp-2 text-sm md:text-base leading-tight"
            data-testid={`text-product-name-${product.id}`}
          >
            {displayName || (language === 'ar' ? 'منتج بدون اسم' : 'Unnamed product')}
          </h3>
        </div>
      </Card>
    </Link>
  );
}
