/**
 * ArticleForm Component
 *
 * Comprehensive form for creating and editing articles.
 * Includes slug generation, image upload, and category selection.
 */

'use client';

import {
  useCallback,
  useEffect,
  useState,
  useTransition,
  useMemo,
} from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Article } from '@prisma/client';
import {
  Loader2,
  Save,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Check,
  ChevronsUpDown,
  Plus,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { ErrorMessage } from '@/components/forms/error-message';
import { Separator } from '@/components/ui/separator';
import { cn, toArabicNumerals } from '@/lib/shared/utils';

import { ArticleContentEditor } from './article-content-editor';
import { ArticleCoverUploader } from './article-cover-uploader';
import {
  CreateArticleFormData,
  createArticleFormSchema,
  SUGGESTED_CATEGORIES,
} from '../types';
import {
  createArticleAction,
  updateArticleAction,
  toggleArticlePublishAction,
} from '../actions';

// ============================================================================
// Utils
// ============================================================================

/**
 * Format date with Arabic numerals
 */
function formatDateArabic(date: Date | string): string {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return toArabicNumerals(`${day}/${month}/${year}`);
}

/**
 * Generate a URL-friendly slug from Arabic/English text
 */
function generateSlug(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      // Replace Arabic characters with transliteration (simplified)
      .replace(/[\u0600-\u06FF]/g, (char) => {
        const map: Record<string, string> = {
          ا: 'a',
          أ: 'a',
          إ: 'e',
          آ: 'a',
          ب: 'b',
          ت: 't',
          ث: 'th',
          ج: 'j',
          ح: 'h',
          خ: 'kh',
          د: 'd',
          ذ: 'th',
          ر: 'r',
          ز: 'z',
          س: 's',
          ش: 'sh',
          ص: 's',
          ض: 'd',
          ط: 't',
          ظ: 'z',
          ع: 'a',
          غ: 'gh',
          ف: 'f',
          ق: 'q',
          ك: 'k',
          ل: 'l',
          م: 'm',
          ن: 'n',
          ه: 'h',
          و: 'w',
          ي: 'y',
          ى: 'a',
          ة: 'h',
          ء: '',
          ئ: 'y',
          ؤ: 'w',
        };
        return map[char] || '';
      })
      // Replace spaces and special characters with hyphens
      .replace(/[^a-z0-9]+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, '')
      // Limit length
      .slice(0, 60)
  );
}

// ============================================================================
// Types
// ============================================================================

type ArticleFormProps = {
  /** Existing article for editing */
  article?: Article;
  /** Mode - create or edit */
  mode: 'create' | 'edit';
};

// ============================================================================
// Component
// ============================================================================

export function ArticleForm({ article, mode }: ArticleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const isEditing = mode === 'edit' && article;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CreateArticleFormData>({
    mode: 'onTouched',
    resolver: zodResolver(createArticleFormSchema),
    defaultValues: isEditing
      ? {
          title: article.title,
          slug: article.slug,
          content: article.content,
          coverImageKey: article.coverImageKey,
          isPublished: article.isPublished,
          category: article.category,
        }
      : {
          title: '',
          slug: '',
          content: '',
          coverImageKey: null,
          isPublished: false,
          category: 'عام',
        },
  });

  const title = watch('title');
  const isPublished = watch('isPublished');
  const currentCategory = watch('category');

  // State for category combobox
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  // Combine suggested categories with current value if it's custom
  const availableCategories = useMemo(() => {
    const suggestedValues = SUGGESTED_CATEGORIES.map((c) => c.value);
    if (
      currentCategory &&
      !suggestedValues.includes(
        currentCategory as (typeof suggestedValues)[number],
      )
    ) {
      return [
        ...SUGGESTED_CATEGORIES,
        { value: currentCategory, label: currentCategory },
      ];
    }
    return [...SUGGESTED_CATEGORIES];
  }, [currentCategory]);

  // Auto-generate slug from title (only in create mode and if not manually edited)
  useEffect(() => {
    if (mode === 'create' && !isSlugManuallyEdited && title) {
      const slug = generateSlug(title);
      setValue('slug', slug, { shouldValidate: true });
    }
  }, [title, mode, isSlugManuallyEdited, setValue]);

  // Handle form submission
  const onSubmit: SubmitHandler<CreateArticleFormData> = useCallback(
    async (data) => {
      startTransition(async () => {
        try {
          const result = isEditing
            ? await updateArticleAction(article.id, data)
            : await createArticleAction(data);

          if (!result.success) {
            toast.error(result.error);
            return;
          }

          toast.success(
            isEditing ? 'تم تحديث المقال بنجاح' : 'تم إنشاء المقال بنجاح',
          );

          if (!isEditing) {
            router.push(`/dashboard/articles/editor/${result.articleId}`);
          }
        } catch {
          toast.error('حدث خطأ غير متوقع');
        }
      });
    },
    [isEditing, article?.id, router],
  );

  // Handle publish toggle
  const handlePublishToggle = useCallback(async () => {
    if (!isEditing || !article) return;

    setIsPublishing(true);
    try {
      const result = await toggleArticlePublishAction(article.id, !isPublished);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setValue('isPublished', !isPublished);
      toast.success(
        isPublished ? 'تم إلغاء نشر المقال' : 'تم نشر المقال بنجاح',
      );
    } catch {
      toast.error('حدث خطأ أثناء تغيير حالة النشر');
    } finally {
      setIsPublishing(false);
    }
  }, [isEditing, article, isPublished, setValue]);

  const isLoading = isSubmitting || isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/dashboard/articles')}
          className="gap-2"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للمقالات
        </Button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isEditing && (
            <Button
              type="button"
              variant={isPublished ? 'outline' : 'secondary'}
              onClick={handlePublishToggle}
              disabled={isPublishing || isLoading}
              className="gap-2"
            >
              {isPublishing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isPublished ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {isPublished ? 'إلغاء النشر' : 'نشر المقال'}
            </Button>
          )}

          <Button
            type="submit"
            disabled={isLoading || (!!isEditing && !isDirty)}
            className="gap-2 flex-1 sm:flex-none"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isEditing ? 'حفظ التغييرات' : 'إنشاء المقال'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Slug Card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">المعلومات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-right">
                  العنوان
                </Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="عنوان المقال..."
                  className="text-right"
                  disabled={isLoading}
                  dir="rtl"
                />
                <ErrorMessage message={errors.title?.message} />
              </div>

              {/* Slug */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between" dir="rtl">
                  <Label htmlFor="slug">الرابط (Slug)</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const slug = generateSlug(title);
                      setValue('slug', slug, { shouldValidate: true });
                      setIsSlugManuallyEdited(false);
                    }}
                    disabled={isLoading || !title}
                    className="gap-1 text-xs h-7 px-2"
                  >
                    <Sparkles className="h-3 w-3" />
                    توليد تلقائي
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="slug"
                    {...register('slug', {
                      onChange: () => setIsSlugManuallyEdited(true),
                    })}
                    placeholder="article-slug"
                    className="text-left font-mono text-sm ltr"
                    disabled={isLoading}
                    dir="ltr"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">
                  الرابط يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط
                </p>
                <ErrorMessage message={errors.slug?.message} />
              </div>
            </CardContent>
          </Card>

          {/* Content Card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">المحتوى</CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                control={control}
                name="content"
                render={({ field }) => (
                  <ArticleContentEditor
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading}
                    error={!!errors.content}
                    showLabel={false}
                  />
                )}
              />
              <ErrorMessage message={errors.content?.message} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Column (1/3) */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">الحالة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Publish Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {isPublished ? 'منشور' : 'مسودة'}
                </span>
                <Controller
                  control={control}
                  name="isPublished"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  )}
                />
              </div>

              <Separator />

              {/* Category */}
              <div className="grid gap-2">
                <Label className="text-right">الفئة</Label>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={categoryOpen}
                          className="w-full justify-between"
                          disabled={isLoading}
                          dir="rtl"
                        >
                          {field.value || 'اختر الفئة...'}
                          <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-full p-0 bg-card"
                        align="start"
                      >
                        <Command dir="rtl">
                          <CommandInput
                            placeholder="ابحث أو أضف فئة جديدة..."
                            value={categorySearch}
                            onValueChange={setCategorySearch}
                          />
                          <CommandList>
                            <CommandEmpty>
                              {categorySearch && (
                                <button
                                  type="button"
                                  className="flex w-full items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded-sm cursor-pointer"
                                  onClick={() => {
                                    field.onChange(categorySearch);
                                    setCategorySearch('');
                                    setCategoryOpen(false);
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                  إضافة &quot;{categorySearch}&quot;
                                </button>
                              )}
                            </CommandEmpty>
                            <CommandGroup>
                              {availableCategories.map((cat) => (
                                <CommandItem
                                  key={cat.value}
                                  value={cat.value}
                                  onSelect={(value) => {
                                    field.onChange(value);
                                    setCategoryOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'ml-2 h-4 w-4',
                                      field.value === cat.value
                                        ? 'opacity-100'
                                        : 'opacity-0',
                                    )}
                                  />
                                  {cat.label}
                                </CommandItem>
                              ))}
                              {categorySearch &&
                                !availableCategories.some(
                                  (c) =>
                                    c.value.toLowerCase() ===
                                    categorySearch.toLowerCase(),
                                ) && (
                                  <CommandItem
                                    value={categorySearch}
                                    onSelect={() => {
                                      field.onChange(categorySearch);
                                      setCategorySearch('');
                                      setCategoryOpen(false);
                                    }}
                                  >
                                    <Plus className="ml-2 h-4 w-4" />
                                    إضافة &quot;{categorySearch}&quot;
                                  </CommandItem>
                                )}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                />
                <ErrorMessage message={errors.category?.message} />
              </div>
            </CardContent>
          </Card>

          {/* Cover Image Card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">صورة الغلاف</CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                control={control}
                name="coverImageKey"
                render={({ field }) => (
                  <ArticleCoverUploader
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading}
                  />
                )}
              />
            </CardContent>
          </Card>

          {/* Meta Info (for editing) */}
          {isEditing && article && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">معلومات إضافية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between" dir="rtl">
                  <span className="text-muted-foreground">تاريخ الإنشاء</span>
                  <span className="font-medium">
                    {formatDateArabic(article.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between" dir="rtl">
                  <span className="text-muted-foreground">آخر تحديث</span>
                  <span className="font-medium">
                    {formatDateArabic(article.updatedAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </form>
  );
}
