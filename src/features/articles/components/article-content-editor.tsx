/**
 * ArticleContentEditor Component
 *
 * A text editor for article content.
 * Currently implemented as a simple textarea.
 *
 * FUTURE: Replace with Tiptap/Quill rich text editor.
 * This component is intentionally isolated to make the future
 * migration to a rich text editor straightforward.
 */

'use client';

import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/shared/utils';

type ArticleContentEditorProps = {
  /** Current content value */
  value: string;
  /** Callback when content changes */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the editor is disabled */
  disabled?: boolean;
  /** Error state */
  error?: boolean;
  /** Custom class name */
  className?: string;
  /** Label text */
  label?: string;
  /** Whether to show the label */
  showLabel?: boolean;
};

/**
 * Article content editor
 *
 * This component abstracts the content editing functionality.
 * Currently uses a simple textarea, but designed to be replaced
 * with a rich text editor (Tiptap/Quill) in the future.
 */
export function ArticleContentEditor({
  value,
  onChange,
  placeholder = 'اكتب محتوى المقال هنا...',
  disabled = false,
  error = false,
  className,
  label = 'المحتوى',
  showLabel = true,
}: ArticleContentEditorProps) {
  return (
    <div className="grid gap-2">
      {showLabel && <Label className="text-right font-medium">{label}</Label>}
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        dir="rtl"
        className={cn(
          'min-h-75 resize-y text-right leading-relaxed',
          'focus:ring-2 focus:ring-primary/20 transition-shadow',
          error && 'border-destructive focus:ring-destructive/20',
          className,
        )}
      />
      <p className="text-xs text-muted-foreground text-right">
        يدعم النص العادي حالياً. سيتم إضافة دعم التنسيق الغني قريباً.
      </p>
    </div>
  );
}
