import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLanguage } from '@/lib/language-context';
import { useTheme } from '@/lib/theme-context';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLocation, Link } from 'wouter';
import { 
  Plus, Trash2, Edit2, Save, X, Home, Sun, Moon, Globe, 
  Package, Image, FolderTree, CreditCard, MessageCircle, Settings, LogOut 
} from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';
import type { Product, Category, Banner, PaymentMethod, TelegramChannel, SiteSetting } from '@shared/schema';

export default function Admin() {
  const { t, language, setLanguage, dir } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('products');
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const sessionQuery = useQuery<{ isAdmin: boolean }>({
    queryKey: ['/api/admin/session'],
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/logout");
      return res.json();
    },
    onSuccess: () => {
      setLocation("/");
    },
  });

  useEffect(() => {
    if (sessionQuery.data) {
      if (!sessionQuery.data.isAdmin) {
        setLocation("/admin-login-x7k9m2");
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [sessionQuery.data, setLocation]);

  if (sessionQuery.isLoading || isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background" data-testid="page-admin">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            <h1 className="text-xl font-bold text-foreground" data-testid="text-admin-title">
              {t('admin')}
            </h1>
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="icon" data-testid="link-admin-home">
                  <Home className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}>
                <Globe className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => logoutMutation.mutate()}
                data-testid="button-admin-logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap h-auto gap-1 mb-6">
            <TabsTrigger value="products" className="gap-2" data-testid="tab-products">
              <Package className="h-4 w-4" />
              {t('products')}
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2" data-testid="tab-categories">
              <FolderTree className="h-4 w-4" />
              {t('categories')}
            </TabsTrigger>
            <TabsTrigger value="banners" className="gap-2" data-testid="tab-banners">
              <Image className="h-4 w-4" />
              {t('banners')}
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2" data-testid="tab-payments">
              <CreditCard className="h-4 w-4" />
              {t('paymentMethods')}
            </TabsTrigger>
            <TabsTrigger value="telegram" className="gap-2" data-testid="tab-telegram">
              <MessageCircle className="h-4 w-4" />
              {t('telegramChannels')}
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2" data-testid="tab-settings">
              <Settings className="h-4 w-4" />
              {t('settings')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductsTab />
          </TabsContent>
          <TabsContent value="categories">
            <CategoriesTab />
          </TabsContent>
          <TabsContent value="banners">
            <BannersTab />
          </TabsContent>
          <TabsContent value="payments">
            <PaymentsTab />
          </TabsContent>
          <TabsContent value="telegram">
            <TelegramTab />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ProductsTab() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    categoryId: '',
    imageUrl: '',
    videoUrl: '',
    featuresAr: '',
    featuresEn: '',
    isActive: true,
  });

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: language === 'ar' ? 'تم الإضافة بنجاح' : 'Added successfully' });
    },
    onError: () => {
      toast({ title: language === 'ar' ? 'حدث خطأ' : 'An error occurred', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest('PATCH', `/api/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsDialogOpen(false);
      setEditingProduct(null);
      resetForm();
      toast({ title: language === 'ar' ? 'تم التحديث بنجاح' : 'Updated successfully' });
    },
    onError: () => {
      toast({ title: language === 'ar' ? 'حدث خطأ' : 'An error occurred', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: language === 'ar' ? 'تم الحذف بنجاح' : 'Deleted successfully' });
    },
    onError: () => {
      toast({ title: language === 'ar' ? 'حدث خطأ' : 'An error occurred', variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      nameAr: '',
      nameEn: '',
      descriptionAr: '',
      descriptionEn: '',
      categoryId: '',
      imageUrl: '',
      videoUrl: '',
      featuresAr: '',
      featuresEn: '',
      isActive: true,
    });
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      nameAr: product.nameAr || '',
      nameEn: product.nameEn || '',
      descriptionAr: product.descriptionAr || '',
      descriptionEn: product.descriptionEn || '',
      categoryId: product.categoryId || '',
      imageUrl: product.imageUrl || '',
      videoUrl: product.videoUrl || '',
      featuresAr: product.featuresAr?.join('\n') || '',
      featuresEn: product.featuresEn?.join('\n') || '',
      isActive: product.isActive ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    const data = {
      ...formData,
      featuresAr: formData.featuresAr.split('\n').filter(f => f.trim()),
      featuresEn: formData.featuresEn.split('\n').filter(f => f.trim()),
      categoryId: formData.categoryId || null,
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-xl font-semibold">{t('products')}</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingProduct(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-add-product">
              <Plus className="h-4 w-4" />
              {t('addProduct')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? t('editProduct') : t('addProduct')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('productName')} (عربي)</Label>
                  <Input
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    data-testid="input-product-name-ar"
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label>{t('productName')} (English)</Label>
                  <Input
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    data-testid="input-product-name-en"
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('productDescription')} (عربي)</Label>
                  <Textarea
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    data-testid="input-product-description-ar"
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label>{t('productDescription')} (English)</Label>
                  <Textarea
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    data-testid="input-product-description-en"
                    dir="ltr"
                  />
                </div>
              </div>
              <div>
                <Label>{t('category')}</Label>
                <Select 
                  value={formData.categoryId} 
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger data-testid="select-product-category">
                    <SelectValue placeholder={language === 'ar' ? 'اختر فئة' : 'Select category'} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.nameAr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <FileUpload
                label={t('imageUrl')}
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                accept="image"
                testId="input-product-image"
              />
              <FileUpload
                label={t('videoUrl')}
                value={formData.videoUrl}
                onChange={(url) => setFormData({ ...formData, videoUrl: url })}
                accept="video"
                testId="input-product-video"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('features')} (عربي - سطر لكل ميزة)</Label>
                  <Textarea
                    value={formData.featuresAr}
                    onChange={(e) => setFormData({ ...formData, featuresAr: e.target.value })}
                    rows={4}
                    placeholder="ميزة 1\nميزة 2\nميزة 3"
                    data-testid="input-product-features-ar"
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label>{t('features')} (English - one per line)</Label>
                  <Textarea
                    value={formData.featuresEn}
                    onChange={(e) => setFormData({ ...formData, featuresEn: e.target.value })}
                    rows={4}
                    placeholder="Feature 1\nFeature 2\nFeature 3"
                    data-testid="input-product-features-en"
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  data-testid="switch-product-active"
                />
                <Label>{t('active')}</Label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-product"
                >
                  {t('save')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">{t('loading')}</div>
      ) : products && products.length > 0 ? (
        <div className="grid gap-4">
          {products.map((product) => (
            <Card key={product.id} className="p-4" data-testid={`card-admin-product-${product.id}`}>
              <div className="flex gap-4 items-start">
                {product.imageUrl && (
                  <img 
                    src={product.imageUrl} 
                    alt={product.nameAr || ''} 
                    className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{product.nameAr || 'No name'}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{product.descriptionAr}</p>
                  {!product.isActive && (
                    <span className="text-xs text-destructive">{language === 'ar' ? 'غير نشط' : 'Inactive'}</span>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => openEditDialog(product)}
                    data-testid={`button-edit-product-${product.id}`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => deleteMutation.mutate(product.id)}
                    data-testid={`button-delete-product-${product.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          {language === 'ar' ? 'لا توجد منتجات' : 'No products'}
        </div>
      )}
    </div>
  );
}

function CategoriesTab() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [newCategoryAr, setNewCategoryAr] = useState('');
  const [newCategoryEn, setNewCategoryEn] = useState('');

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setNewCategoryAr('');
      setNewCategoryEn('');
      toast({ title: language === 'ar' ? 'تم الإضافة بنجاح' : 'Added successfully' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({ title: language === 'ar' ? 'تم الحذف بنجاح' : 'Deleted successfully' });
    },
  });

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">{t('categories')}</h2>
      
      <div className="flex gap-2 mb-6 flex-wrap">
        <Input
          value={newCategoryAr}
          onChange={(e) => setNewCategoryAr(e.target.value)}
          placeholder={language === 'ar' ? 'اسم الفئة بالعربي' : 'Category name (Arabic)'}
          className="flex-1 min-w-[150px]"
          dir="rtl"
          data-testid="input-new-category-ar"
        />
        <Input
          value={newCategoryEn}
          onChange={(e) => setNewCategoryEn(e.target.value)}
          placeholder={language === 'ar' ? 'اسم الفئة بالإنجليزية' : 'Category name (English)'}
          className="flex-1 min-w-[150px]"
          dir="ltr"
          data-testid="input-new-category-en"
        />
        <Button 
          onClick={() => newCategoryAr && createMutation.mutate({ nameAr: newCategoryAr, nameEn: newCategoryEn })}
          disabled={!newCategoryAr || createMutation.isPending}
          data-testid="button-add-category"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">{t('loading')}</div>
      ) : categories && categories.length > 0 ? (
        <div className="space-y-2">
          {categories.map((category) => {
            const displayName = language === 'ar' ? category.nameAr : (category.nameEn || category.nameAr);
            return (
              <Card key={category.id} className="p-4 flex items-center justify-between gap-4" data-testid={`card-category-${category.id}`}>
                <div className="flex-1">
                  <span className="font-medium">{displayName}</span>
                  {category.nameEn && language === 'ar' && (
                    <span className="text-sm text-muted-foreground mr-2"> ({category.nameEn})</span>
                  )}
                  {category.nameAr && language === 'en' && (
                    <span className="text-sm text-muted-foreground ml-2"> ({category.nameAr})</span>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => deleteMutation.mutate(category.id)}
                  data-testid={`button-delete-category-${category.id}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          {language === 'ar' ? 'لا توجد فئات' : 'No categories'}
        </div>
      )}
    </div>
  );
}

function BannersTab() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ imageUrl: '', linkUrl: '', isActive: true });

  const { data: banners, isLoading } = useQuery<Banner[]>({
    queryKey: ['/api/banners'],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/banners', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/banners'] });
      setIsDialogOpen(false);
      setFormData({ imageUrl: '', linkUrl: '', isActive: true });
      toast({ title: language === 'ar' ? 'تم الإضافة بنجاح' : 'Added successfully' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/banners/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/banners'] });
      toast({ title: language === 'ar' ? 'تم الحذف بنجاح' : 'Deleted successfully' });
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{t('banners')}</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-add-banner">
              <Plus className="h-4 w-4" />
              {t('addBanner')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('addBanner')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <FileUpload
                label={t('imageUrl')}
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                accept="image"
                testId="input-banner-image"
              />
              <div>
                <Label>{t('linkUrl')}</Label>
                <Input
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="https://..."
                  data-testid="input-banner-link"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label>{t('active')}</Label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button 
                  onClick={() => createMutation.mutate(formData)}
                  disabled={!formData.imageUrl || createMutation.isPending}
                  data-testid="button-save-banner"
                >
                  {t('save')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">{t('loading')}</div>
      ) : banners && banners.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {banners.map((banner) => (
            <Card key={banner.id} className="overflow-hidden" data-testid={`card-banner-${banner.id}`}>
              <img src={banner.imageUrl} alt="Banner" className="w-full h-32 object-cover" />
              <div className="p-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground truncate flex-1">
                  {banner.linkUrl || (language === 'ar' ? 'بدون رابط' : 'No link')}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => deleteMutation.mutate(banner.id)}
                  data-testid={`button-delete-banner-${banner.id}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          {language === 'ar' ? 'لا توجد بانرات' : 'No banners'}
        </div>
      )}
    </div>
  );
}

function PaymentsTab() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ imageUrl: '', nameAr: '' });

  const { data: methods, isLoading } = useQuery<PaymentMethod[]>({
    queryKey: ['/api/payment-methods'],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/payment-methods', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods'] });
      setFormData({ imageUrl: '', nameAr: '' });
      toast({ title: language === 'ar' ? 'تم الإضافة بنجاح' : 'Added successfully' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/payment-methods/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods'] });
      toast({ title: language === 'ar' ? 'تم الحذف بنجاح' : 'Deleted successfully' });
    },
  });

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">{t('paymentMethods')}</h2>
      
      <Card className="p-4 mb-6">
        <div className="space-y-4">
          <FileUpload
            label={t('imageUrl')}
            value={formData.imageUrl}
            onChange={(url) => setFormData({ ...formData, imageUrl: url })}
            accept="image"
            testId="input-payment-image"
          />
          <div className="flex gap-2">
            <Input
              value={formData.nameAr}
              onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
              placeholder={language === 'ar' ? 'الاسم (اختياري)' : 'Name (optional)'}
              className="flex-1"
              data-testid="input-payment-name"
            />
            <Button 
              onClick={() => formData.imageUrl && createMutation.mutate(formData)}
              disabled={!formData.imageUrl || createMutation.isPending}
              data-testid="button-add-payment"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">{t('loading')}</div>
      ) : methods && methods.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {methods.map((method) => (
            <Card key={method.id} className="p-4 relative group" data-testid={`card-payment-${method.id}`}>
              <img src={method.imageUrl} alt={method.nameAr || ''} className="w-full h-16 object-contain" />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => deleteMutation.mutate(method.id)}
                data-testid={`button-delete-payment-${method.id}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          {language === 'ar' ? 'لا توجد طرق دفع' : 'No payment methods'}
        </div>
      )}
    </div>
  );
}

function TelegramTab() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ imageUrl: '', linkUrl: '', nameAr: '' });

  const { data: channels, isLoading } = useQuery<TelegramChannel[]>({
    queryKey: ['/api/telegram-channels'],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/telegram-channels', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/telegram-channels'] });
      setFormData({ imageUrl: '', linkUrl: '', nameAr: '' });
      toast({ title: language === 'ar' ? 'تم الإضافة بنجاح' : 'Added successfully' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/telegram-channels/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/telegram-channels'] });
      toast({ title: language === 'ar' ? 'تم الحذف بنجاح' : 'Deleted successfully' });
    },
  });

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">{t('telegramChannels')}</h2>
      
      <Card className="p-4 mb-6">
        <div className="space-y-4">
          <FileUpload
            label={t('imageUrl')}
            value={formData.imageUrl}
            onChange={(url) => setFormData({ ...formData, imageUrl: url })}
            accept="image"
            testId="input-telegram-image"
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              value={formData.linkUrl}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              placeholder="https://t.me/..."
              data-testid="input-telegram-link"
            />
            <div className="flex gap-2">
              <Input
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                placeholder={language === 'ar' ? 'الاسم (اختياري)' : 'Name (optional)'}
                data-testid="input-telegram-name"
              />
              <Button 
                onClick={() => formData.imageUrl && formData.linkUrl && createMutation.mutate(formData)}
                disabled={!formData.imageUrl || !formData.linkUrl || createMutation.isPending}
                data-testid="button-add-telegram"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">{t('loading')}</div>
      ) : channels && channels.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {channels.map((channel) => (
            <Card key={channel.id} className="overflow-hidden" data-testid={`card-telegram-${channel.id}`}>
              <img src={channel.imageUrl} alt={channel.nameAr || ''} className="w-full h-24 object-cover" />
              <div className="p-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground truncate flex-1">
                  {channel.linkUrl}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => deleteMutation.mutate(channel.id)}
                  data-testid={`button-delete-telegram-${channel.id}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          {language === 'ar' ? 'لا توجد قنوات' : 'No channels'}
        </div>
      )}
    </div>
  );
}

function SettingsTab() {
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<SiteSetting[]>({
    queryKey: ['/api/settings'],
  });

  const [formData, setFormData] = useState({
    telegramUsername: '',
    whatsappNumber: '',
    aboutUsContent: '',
  });

  const updateMutation = useMutation({
    mutationFn: (data: { key: string; value: string }) => 
      apiRequest('POST', '/api/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({ title: language === 'ar' ? 'تم الحفظ بنجاح' : 'Saved successfully' });
    },
  });

  const getSetting = (key: string) => settings?.find(s => s.key === key)?.value || '';

  const handleSave = (key: string, value: string) => {
    updateMutation.mutate({ key, value });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">{t('settings')}</h2>
      
      <div className="space-y-6">
        <Card className="p-4">
          <Label className="mb-2 block">{t('telegramUsername')}</Label>
          <div className="flex gap-2">
            <Input
              defaultValue={getSetting('telegramUsername')}
              placeholder="username"
              onBlur={(e) => handleSave('telegramUsername', e.target.value)}
              data-testid="input-setting-telegram"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {language === 'ar' ? 'اسم المستخدم بدون @' : 'Username without @'}
          </p>
        </Card>

        <Card className="p-4">
          <Label className="mb-2 block">{t('whatsappNumber')}</Label>
          <div className="flex gap-2">
            <Input
              defaultValue={getSetting('whatsappNumber')}
              placeholder="+966xxxxxxxxx"
              onBlur={(e) => handleSave('whatsappNumber', e.target.value)}
              data-testid="input-setting-whatsapp"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {language === 'ar' ? 'الرقم مع رمز الدولة' : 'Number with country code'}
          </p>
        </Card>

        <Card className="p-4">
          <Label className="mb-2 block">{t('aboutUsContent')} (عربي)</Label>
          <Textarea
            defaultValue={getSetting('aboutUsContent')}
            rows={6}
            onBlur={(e) => handleSave('aboutUsContent', e.target.value)}
            data-testid="input-setting-about"
          />
        </Card>
      </div>
    </div>
  );
}
