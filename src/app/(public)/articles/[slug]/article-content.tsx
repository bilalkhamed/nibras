'use client';

import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { cn } from '@/lib/shared/utils';
import {
  useReaderPreferences,
  ReaderPreferencesMenu,
  FONT_SIZE_CLASSES,
  LINE_HEIGHT_CLASSES,
  WIDTH_CLASSES,
} from './reader-preferences';
import { ReadingProgress } from './reading-progress';
import { convertPlainTextToHtml } from '@/features/articles/components/public/rich-text-viewer';

// ============================================================================
// Types
// ============================================================================

interface ArticleContentProps {
  content: string;
  slug: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
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
      'ul',
      'ol',
      'li',
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
      'a',
      'img',
      'figure',
      'figcaption',
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
    ADD_ATTR: ['target'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Process HTML content to add paragraph IDs for deep linking
 */
function addParagraphIds(html: string): string {
  let paragraphCount = 0;

  // Add IDs to <p> tags that don't have one
  return html.replace(/<p(?![^>]*\bid=)([^>]*)>/gi, (match, attrs) => {
    paragraphCount++;
    return `<p id="p-${paragraphCount}" data-paragraph="true"${attrs}>`;
  });
}

// ============================================================================
// Main Component
// ============================================================================

export function ArticleContent({ content, slug }: ArticleContentProps) {
  const { preferences, updatePreference, isLoaded } = useReaderPreferences();
  const contentRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Process and sanitize content
  const processedContent = useMemo(() => {
    const htmlContent = convertPlainTextToHtml(content);
    const withIds = addParagraphIds(htmlContent);
    return sanitizeHtml(withIds);
  }, [content]);

  // Handle anchor scroll on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.slice(1);
      const element = document.getElementById(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('highlight-paragraph');
          setTimeout(() => {
            element.classList.remove('highlight-paragraph');
          }, 2000);
        }, 500);
      }
    }
  }, []);

  // Handle paragraph anchor click
  const handleAnchorClick = useCallback(
    async (paragraphId: string) => {
      const url = `${window.location.origin}/articles/${slug}#${paragraphId}`;

      try {
        await navigator.clipboard.writeText(url);
        setCopiedId(paragraphId);
        setTimeout(() => setCopiedId(null), 2000);
      } catch {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedId(paragraphId);
        setTimeout(() => setCopiedId(null), 2000);
      }
    },
    [slug],
  );

  // Add click handlers to paragraphs after render
  useEffect(() => {
    if (!contentRef.current || !isLoaded) return;

    const paragraphs = contentRef.current.querySelectorAll(
      'p[data-paragraph="true"]',
    );

    paragraphs.forEach((p) => {
      const id = p.id;
      if (!id) return;

      // Create anchor button if not exists
      let anchor = p.querySelector(
        '.paragraph-anchor',
      ) as HTMLButtonElement | null;
      if (!anchor) {
        anchor = document.createElement('button');
        anchor.className = 'paragraph-anchor';
        anchor.setAttribute('aria-label', 'نسخ رابط الفقرة');
        anchor.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/><path d="M16 9v6"/><path d="M8 9v6"/></svg>';
        p.insertBefore(anchor, p.firstChild);
      }

      // Update click handler
      const clickHandler = () => handleAnchorClick(id);
      anchor.onclick = clickHandler;
    });
  }, [processedContent, isLoaded, handleAnchorClick, copiedId]);

  // Update copied state visual
  useEffect(() => {
    if (!contentRef.current) return;

    const paragraphs = contentRef.current.querySelectorAll(
      'p[data-paragraph="true"]',
    );
    paragraphs.forEach((p) => {
      const anchor = p.querySelector('.paragraph-anchor');
      if (anchor) {
        if (copiedId === p.id) {
          anchor.classList.add('copied');
          anchor.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        } else {
          anchor.classList.remove('copied');
          anchor.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>';
        }
      }
    });
  }, [copiedId]);

  // Get CSS classes based on preferences
  const fontSizeClass = FONT_SIZE_CLASSES[preferences.fontSize];
  const lineHeightClass = LINE_HEIGHT_CLASSES[preferences.lineHeight];
  const widthClass = WIDTH_CLASSES[preferences.contentWidth];

  return (
    <>
      {/* Reading Progress Bar */}
      <ReadingProgress />

      {/* Floating Toolbar */}
      <div className="sticky top-12 z-30 mb-6">
        <div className="container mx-auto px-4">
          <div
            className={cn(
              'mx-auto flex items-center justify-end gap-2',
              widthClass,
            )}
          >
            <div className="flex items-center gap-1 rounded-full border border-border bg-background/95 backdrop-blur-sm px-2 py-1 shadow-sm">
              <ReaderPreferencesMenu
                preferences={preferences}
                onPreferenceChange={updatePreference}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div
        ref={contentRef}
        className={cn(
          'mx-auto relative article-content',
          widthClass,
          'transition-all duration-300',
        )}
      >
        <div
          suppressHydrationWarning
          className={cn(
            // Base prose styling
            'prose dark:prose-invert max-w-none',
            fontSizeClass,
            lineHeightClass,
            // Custom prose overrides for Arabic/RTL
            'prose-headings:font-bold prose-headings:text-foreground',
            'prose-p:text-foreground/90',
            'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
            'prose-strong:text-foreground prose-strong:font-semibold',
            'prose-blockquote:border-primary prose-blockquote:bg-muted/30 prose-blockquote:rounded-lg prose-blockquote:px-4 prose-blockquote:not-italic',
            'prose-code:bg-muted prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none',
            'prose-pre:bg-muted prose-pre:border prose-pre:border-border',
            'prose-img:rounded-lg prose-img:shadow-md',
            'prose-hr:border-border',
            'prose-ul:list-disc prose-ol:list-decimal',
            'prose-li:text-foreground/90',
          )}
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
      </div>

      {/* Styles for paragraph anchors */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .article-content p[data-paragraph="true"] {
          position: relative;
          padding-right: 1.5rem;
          transition: background-color 0.3s ease;
          border-radius: 0.25rem;
          margin-right: -0.5rem;
          padding-left: 0.5rem;
        }
        
        .article-content p[data-paragraph="true"]:hover {
          background-color: hsl(var(--muted) / 0.5);
        }
        
        .article-content p[data-paragraph="true"].highlight-paragraph {
          background-color: hsl(var(--primary) / 0.15);
        }
        
        .paragraph-anchor {
          position: absolute;
          right: 0;
          top: 0.25rem;
          opacity: 0;
          padding: 0.25rem;
          border-radius: 0.25rem;
          color: hsl(var(--muted-foreground));
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .article-content p[data-paragraph="true"]:hover .paragraph-anchor,
        .paragraph-anchor:focus {
          opacity: 1;
        }
        
        .paragraph-anchor:hover {
          color: hsl(var(--primary));
          background-color: hsl(var(--primary) / 0.1);
        }
        
        .paragraph-anchor.copied {
          color: hsl(142.1 76.2% 36.3%);
        }
        
        @media (max-width: 640px) {
          .article-content p[data-paragraph="true"] {
            padding-right: 1.25rem;
          }
          
          .paragraph-anchor {
            opacity: 0.5;
          }
        }
      `,
        }}
      />
    </>
  );
}
