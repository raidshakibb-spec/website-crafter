import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { LeftSidebar } from '@/components/LeftSidebar';
import { BannerCarousel } from '@/components/BannerCarousel';
import { ProductCard } from '@/components/ProductCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { MobileSidebar } from '@/components/MobileSidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/lib/language-context';
import type { Product } from '@shared/schema';

export default function Home() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    let filtered = products.filter(p => p.isActive);
    
    if (selectedCategory) {
      filtered = filtered.filter(p => p.categoryId === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.nameAr?.toLowerCase().includes(query) ||
        p.descriptionAr?.toLowerCase().includes(query)
      );
    }
    
    return filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background" data-testid="page-home">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} />
      
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-3 md:py-6">
        <div className="flex gap-6">
          <LeftSidebar />
          
          <main className="flex-1 min-w-0">
            {/* Banner Carousel */}
            <section className="mb-4 md:mb-8" data-testid="section-banners">
              <BannerCarousel />
            </section>

            {/* Category Filter */}
            <section className="mb-4 md:mb-6" data-testid="section-categories">
              <CategoryFilter
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </section>

            {/* Products Grid */}
            <section className="pb-24 lg:pb-0" data-testid="section-products">
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="aspect-square w-full rounded-lg" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div 
                  className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4"
                  data-testid="grid-products"
                >
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16" data-testid="empty-products">
                  <p className="text-muted-foreground text-lg">
                    {t('noProducts')}
                  </p>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>

      <MobileSidebar />
    </div>
  );
}
