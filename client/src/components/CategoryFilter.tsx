import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/lib/language-context';
import type { Category } from '@shared/schema';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const { t, language } = useLanguage();

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" data-testid="skeleton-categories">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-8 w-20 flex-shrink-0 rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <div 
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-3 px-3 md:mx-0 md:px-0 md:flex-wrap" 
      data-testid="filter-categories"
    >
      <Button
        variant={selectedCategory === null ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSelectCategory(null)}
        className="flex-shrink-0 rounded-full text-xs md:text-sm h-8"
        data-testid="button-category-all"
      >
        {t('allCategories')}
      </Button>
      {categories?.map((category) => {
        const displayName = language === 'ar' ? category.nameAr : (category.nameEn || category.nameAr);
        return (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelectCategory(category.id)}
            className="flex-shrink-0 rounded-full text-xs md:text-sm h-8"
            data-testid={`button-category-${category.id}`}
          >
            {displayName}
          </Button>
        );
      })}
    </div>
  );
}
