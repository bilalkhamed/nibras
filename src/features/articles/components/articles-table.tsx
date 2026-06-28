/**
 * ArticlesTable Component
 *
 * Data table for displaying and managing articles.
 * Includes filtering, sorting, and action buttons.
 */

'use client';

import { useState, useMemo, useTransition } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  ExternalLink,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toArabicNumerals } from '@/lib/shared/utils';

import { ArticleListDTO } from '../types';
import { deleteArticleAction, toggleArticlePublishAction } from '../actions';

// ============================================================================
// Types
// ============================================================================

type ArticlesTableProps = {
  articles: ArticleListDTO[];
  isDirector?: boolean;
};

type FilterState = {
  search: string;
  category: string;
  status: 'all' | 'published' | 'draft';
};

/**
 * Format date consistently with Arabic numerals
 */
function formatDate(date: Date | string): string {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return toArabicNumerals(`${day}/${month}/${year}`);
}

// ============================================================================
// Component
// ============================================================================

export function ArticlesTable({ articles, isDirector }: ArticlesTableProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    status: 'all',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<ArticleListDTO | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  // Get unique categories from articles
  const uniqueCategories = useMemo(() => {
    const categories = new Set(articles.map((a) => a.category));
    return Array.from(categories).sort();
  }, [articles]);

  // Filter articles
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = article.title.toLowerCase().includes(searchLower);
        const matchesSlug = article.slug.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesSlug) return false;
      }

      // Category filter
      if (filters.category !== 'all' && article.category !== filters.category) {
        return false;
      }

      // Status filter
      if (filters.status === 'published' && !article.isPublished) return false;
      if (filters.status === 'draft' && article.isPublished) return false;

      return true;
    });
  }, [articles, filters]);

  // Reset filters
  const resetFilters = () => {
    setFilters({ search: '', category: 'all', status: 'all' });
  };

  // Handle toggle publish
  const handleTogglePublish = async (article: ArticleListDTO) => {
    startTransition(async () => {
      const result = await toggleArticlePublishAction(
        article.id,
        !article.isPublished,
      );
      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success(
          article.isPublished ? 'تم إلغاء نشر المقال' : 'تم نشر المقال',
        );
      }
    });
  };

  // Handle delete
  const handleDelete = async () => {
    if (!articleToDelete) return;

    startTransition(async () => {
      const result = await deleteArticleAction(articleToDelete.id);
      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success('تم حذف المقال بنجاح');
      }
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
    });
  };

  const hasActiveFilters =
    filters.search || filters.category !== 'all' || filters.status !== 'all';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">المقالات</h1>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة مقالات الموقع والأخبار
          </p>
        </div>
        {!isDirector && (
          <Button asChild>
            <Link href="/dashboard/articles/editor/new">
              <Plus className="h-4 w-4 ml-2" />
              إنشاء مقال جديد
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="البحث في المقالات..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pr-10 text-right"
            dir="rtl"
          />
        </div>

        <Select
          value={filters.category}
          onValueChange={(v) => setFilters({ ...filters, category: v })}
          dir="rtl"
        >
          <SelectTrigger className="w-full sm:w-32">
            <Filter className="h-4 w-4 ml-2" />
            <SelectValue placeholder="الفئة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {uniqueCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(v) =>
            setFilters({
              ...filters,
              status: v as 'all' | 'published' | 'draft',
            })
          }
          dir="rtl"
        >
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="published">منشور</SelectItem>
            <SelectItem value="draft">مسودة</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" onClick={resetFilters} className="shrink-0">
            إعادة تعيين
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-card shadow-md">
        <Table>
          <TableHeader className="bg-linear-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-right font-semibold w-12">#</TableHead>
              <TableHead className="text-right font-semibold min-w-48">
                العنوان
              </TableHead>
              <TableHead className="text-right font-semibold">الفئة</TableHead>
              <TableHead className="text-right font-semibold">الحالة</TableHead>
              <TableHead className="text-right font-semibold">الكاتب</TableHead>
              <TableHead className="text-right font-semibold">
                التاريخ
              </TableHead>
              <TableHead className="text-right font-semibold w-20">
                الإجراءات
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredArticles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="text-muted-foreground">
                    {hasActiveFilters
                      ? 'لا توجد مقالات تطابق معايير البحث'
                      : 'لا توجد مقالات بعد'}
                  </div>
                  {!hasActiveFilters && !isDirector && (
                    <Button asChild variant="link" className="mt-2">
                      <Link href="/dashboard/articles/editor/new">
                        إنشاء مقال جديد
                      </Link>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredArticles.map((article, idx) => (
                <TableRow
                  key={article.id}
                  className="odd:bg-muted/40 even:bg-card dark:odd:bg-muted/25 dark:even:bg-card hover:bg-accent-soft/70 dark:hover:bg-accent-soft/30 transition-colors"
                >
                  <TableCell className="text-muted-foreground font-medium">
                    {toArabicNumerals(idx + 1)}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium line-clamp-1">
                      {article.title}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{article.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {article.isPublished ? (
                      <Badge variant="default" className="gap-1">
                        <Eye className="h-3 w-3" />
                        منشور
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <EyeOff className="h-3 w-3" />
                        مسودة
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {article.author.firstName} {article.author.lastName}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(article.createdAt)}
                  </TableCell>
                  <TableCell>
                    {isDirector ? (
                      article.isPublished ? (
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/articles/${article.slug}`} target="_blank">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null
                    ) : (
                      <DropdownMenu dir="rtl">
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card">
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/articles/editor/${article.id}`}
                              className="flex items-center gap-2"
                            >
                              <Pencil className="h-4 w-4" />
                              تعديل
                            </Link>
                          </DropdownMenuItem>
                          {article.isPublished && (
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/articles/${article.slug}`}
                                target="_blank"
                                className="flex items-center gap-2"
                              >
                                <ExternalLink className="h-4 w-4" />
                                عرض المقال
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleTogglePublish(article)}
                            disabled={isPending}
                          >
                            {article.isPublished ? (
                              <>
                                <EyeOff className="h-4 w-4 ml-2" />
                                إلغاء النشر
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 ml-2" />
                                نشر
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setArticleToDelete(article);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 ml-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results count */}
      {filteredArticles.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          عرض {toArabicNumerals(filteredArticles.length)} من{' '}
          {toArabicNumerals(articles.length)} مقال
        </p>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا المقال؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف المقال &quot;{articleToDelete?.title}&quot; نهائياً. لا
              يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isPending}
            >
              {isPending ? 'جاري الحذف...' : 'حذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
