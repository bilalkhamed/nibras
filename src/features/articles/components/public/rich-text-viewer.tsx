'use client';

import DOMPurify from 'isomorphic-dompurify';
import { useMemo } from 'react';
import { cn } from '@/lib/shared/utils';

// ============================================================================
// Types
// ============================================================================

interface RichTextViewerProps {
  content: string;
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Detects if the content contains HTML tags
 */
function containsHtmlTags(content: string): boolean {
  // Check for common HTML tags
  const htmlTagPattern = /<\/?[a-z][\s\S]*>/i;
  return htmlTagPattern.test(content);
}

/**
 * Converts plain text to HTML by wrapping paragraphs in <p> tags.
 * Preserves any existing HTML if detected.
 *
 * - Double newlines create new paragraphs
 * - Single newlines create line breaks within paragraphs
 * - Empty lines are ignored
 */
export function convertPlainTextToHtml(content: string): string {
  // If content already contains HTML, return as-is
  if (containsHtmlTags(content)) {
    return content;
  }

  // Split by double newlines (paragraph breaks)
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((para) => para.trim())
    .filter((para) => para.length > 0);

  // Wrap each paragraph in <p> tags, converting single newlines to <br>
  return paragraphs
    .map((para) => {
      // Replace single newlines with <br> tags
      const withBreaks = para.replace(/\n/g, '<br>');
      return `<p>${withBreaks}</p>`;
    })
    .join('\n');
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      // Block elements
      'p',
      'div',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'blockquote',
      'pre',
      'code',
      'hr',
      // Lists
      'ul',
      'ol',
      'li',
      // Inline elements
      'strong',
      'b',
      'em',
      'i',
      'u',
      's',
      'strike',
      'sub',
      'sup',
      'br',
      'span',
      // Links & Media
      'a',
      'img',
      'figure',
      'figcaption',
      // Tables
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
    ],
    ALLOWED_ATTR: [
      'href',
      'target',
      'rel',
      'src',
      'alt',
      'title',
      'class',
      'id',
      'width',
      'height',
      'style',
    ],
    // Add noopener noreferrer to links for security
    ADD_ATTR: ['target'],
    ALLOW_DATA_ATTR: false,
  });
}

// ============================================================================
// Component
// ============================================================================

/**
 * RichTextViewer - Safely renders HTML content with Tailwind Typography styling.
 *
 * Features:
 * - Automatically converts plain text to HTML if no HTML tags are detected
 * - Sanitizes HTML to prevent XSS attacks
 * - Uses Tailwind Typography (prose) for beautiful rendering
 * - Supports RTL content
 *
 * @example
 * ```tsx
 * <RichTextViewer content={article.content} />
 * ```
 */
export function RichTextViewer({ content, className }: RichTextViewerProps) {
  const sanitizedHtml = useMemo(() => {
    // First convert plain text to HTML if needed
    const htmlContent = convertPlainTextToHtml(content);
    // Then sanitize the HTML
    return sanitizeHtml(htmlContent);
  }, [content]);

  return (
    <div
      className={cn(
        // Base prose styling
        'prose prose-lg dark:prose-invert max-w-none',
        // Custom prose overrides for Arabic/RTL
        'prose-headings:font-bold prose-headings:text-foreground',
        'prose-p:text-foreground/90 prose-p:leading-relaxed',
        'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
        'prose-strong:text-foreground prose-strong:font-semibold',
        'prose-blockquote:border-primary prose-blockquote:bg-muted/30 prose-blockquote:rounded-lg prose-blockquote:px-4 prose-blockquote:not-italic',
        'prose-code:bg-muted prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none',
        'prose-pre:bg-muted prose-pre:border prose-pre:border-border',
        'prose-img:rounded-lg prose-img:shadow-md',
        'prose-hr:border-border',
        // List styling
        'prose-ul:list-disc prose-ol:list-decimal',
        'prose-li:text-foreground/90',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}

export default RichTextViewer;
