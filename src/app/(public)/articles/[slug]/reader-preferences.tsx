'use client';

import { useCallback, useSyncExternalStore } from 'react';
import {
  Type,
  Minus,
  Plus,
  AlignJustify,
  Maximize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/shared/utils';

// ============================================================================
// Types
// ============================================================================

type FontSize = 'small' | 'default' | 'large' | 'xl';
type LineHeight = 'compact' | 'default' | 'airy';
type ContentWidth = 'narrow' | 'default';

interface ReaderPreferences {
  fontSize: FontSize;
  lineHeight: LineHeight;
  contentWidth: ContentWidth;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'nibras-reader-preferences';

const FONT_SIZE_LABELS: Record<FontSize, string> = {
  small: 'صغير',
  default: 'عادي',
  large: 'كبير',
  xl: 'كبير جداً',
};

const FONT_SIZE_VALUES: FontSize[] = ['small', 'default', 'large', 'xl'];

const LINE_HEIGHT_LABELS: Record<LineHeight, string> = {
  compact: 'مضغوط',
  default: 'عادي',
  airy: 'مريح',
};

const WIDTH_LABELS: Record<ContentWidth, string> = {
  narrow: 'ضيق (تركيز)',
  default: 'كامل',
};

// ============================================================================
// CSS Class Mappings
// ============================================================================

export const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  small: 'text-base',
  default: 'text-lg',
  large: 'text-xl',
  xl: 'text-2xl',
};

export const LINE_HEIGHT_CLASSES: Record<LineHeight, string> = {
  compact: 'leading-relaxed',
  default: 'leading-loose',
  airy: '[&_p]:leading-[2.2] [&_li]:leading-[2.2]',
};

export const WIDTH_CLASSES: Record<ContentWidth, string> = {
  narrow: 'max-w-3xl',
  default: 'max-w-6xl',
};

// ============================================================================
// Helper Functions
// ============================================================================

function getDefaultPreferences(): ReaderPreferences {
  return {
    fontSize: 'default',
    lineHeight: 'default',
    contentWidth: 'default',
  };
}

// ============================================================================
// External Store for localStorage (useSyncExternalStore pattern)
// ============================================================================

let listeners: Array<() => void> = [];

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? JSON.stringify(getDefaultPreferences());
  } catch {
    return JSON.stringify(getDefaultPreferences());
  }
}

function getServerSnapshot(): string {
  return JSON.stringify(getDefaultPreferences());
}

function setPreferencesStorage(prefs: ReaderPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    emitChange();
  } catch {
    // Ignore storage errors
  }
}

// ============================================================================
// Hook
// ============================================================================

export function useReaderPreferences() {
  const storedString = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const preferences: ReaderPreferences = JSON.parse(storedString);

  const updatePreference = useCallback(
    <K extends keyof ReaderPreferences>(
      key: K,
      value: ReaderPreferences[K],
    ) => {
      const currentPrefs = JSON.parse(getSnapshot());
      const newPrefs = { ...currentPrefs, [key]: value };
      setPreferencesStorage(newPrefs);
    },
    [],
  );

  // isLoaded is always true since useSyncExternalStore handles hydration properly
  const isLoaded = true;

  return { preferences, updatePreference, isLoaded };
}

// ============================================================================
// Component
// ============================================================================

interface ReaderPreferencesMenuProps {
  preferences: ReaderPreferences;
  onPreferenceChange: <K extends keyof ReaderPreferences>(
    key: K,
    value: ReaderPreferences[K],
  ) => void;
}

export function ReaderPreferencesMenu({
  preferences,
  onPreferenceChange,
}: ReaderPreferencesMenuProps) {
  const currentFontIndex = FONT_SIZE_VALUES.indexOf(preferences.fontSize);

  const decreaseFontSize = () => {
    if (currentFontIndex > 0) {
      onPreferenceChange('fontSize', FONT_SIZE_VALUES[currentFontIndex - 1]);
    }
  };

  const increaseFontSize = () => {
    if (currentFontIndex < FONT_SIZE_VALUES.length - 1) {
      onPreferenceChange('fontSize', FONT_SIZE_VALUES[currentFontIndex + 1]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground"
          aria-label="إعدادات القراءة"
        >
          <Type className="size-4" />
          <span className="hidden sm:inline text-xs">عرض</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0" sideOffset={8}>
        <div className="p-4 space-y-5 bg-card rounded-2xl">
          {/* Header */}
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Type className="size-4 text-primary" />
            <span className="font-medium text-sm">إعدادات القراءة</span>
          </div>

          {/* Font Size */}
          <div className="space-y-2.5">
            <label className="text-xs font-medium text-muted-foreground">
              حجم الخط
            </label>
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={decreaseFontSize}
                disabled={currentFontIndex === 0}
                aria-label="تصغير الخط"
              >
                <Minus className="size-3.5" />
              </Button>
              <span className="flex-1 text-center text-sm font-medium">
                {FONT_SIZE_LABELS[preferences.fontSize]}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={increaseFontSize}
                disabled={currentFontIndex === FONT_SIZE_VALUES.length - 1}
                aria-label="تكبير الخط"
              >
                <Plus className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* Line Height */}
          <div className="space-y-2.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <AlignJustify className="size-3.5" />
              تباعد الأسطر
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(Object.keys(LINE_HEIGHT_LABELS) as LineHeight[]).map(
                (value) => (
                  <button
                    key={value}
                    onClick={() => onPreferenceChange('lineHeight', value)}
                    className={cn(
                      'px-2.5 py-1.5 text-xs rounded-md border transition-all',
                      'hover:bg-accent hover:text-accent-foreground',
                      preferences.lineHeight === value
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border bg-background',
                    )}
                  >
                    {LINE_HEIGHT_LABELS[value]}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Content Width */}
          <div className="space-y-2.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Maximize2 className="size-3.5" />
              عرض المحتوى
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(WIDTH_LABELS) as ContentWidth[]).map((value) => (
                <button
                  key={value}
                  onClick={() => onPreferenceChange('contentWidth', value)}
                  className={cn(
                    'px-2.5 py-1.5 text-xs rounded-md border transition-all',
                    'hover:bg-accent hover:text-accent-foreground',
                    preferences.contentWidth === value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border bg-background',
                  )}
                >
                  {WIDTH_LABELS[value]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
