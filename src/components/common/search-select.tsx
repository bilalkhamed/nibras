'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/shared/utils';
import { Button } from '@/components/ui/button';
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

export interface SearchSelectOption {
  id: string;
  label: string;
}

interface SearchSelectProps {
  options: SearchSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  name?: string;
  onBlur?: () => void;
}

export default function SearchSelect({
  options,
  value,
  onChange,
  placeholder = 'اختر',
  searchPlaceholder = 'ابحث...',
  emptyMessage = 'لم يتم العثور على نتائج.',
  disabled = false,
  name,
  onBlur,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedLabel =
    options.find((opt) => opt.id === value)?.label || placeholder;

  return (
    <div dir="rtl">
      <Popover
        open={open}
        onOpenChange={(next) => {
          if (open && !next) {
            onBlur?.(); // 👈 HERE
          }
          setOpen(next);
        }}
      >
        <PopoverTrigger asChild name={name}>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="h-9 w-full justify-between rounded-xl bg-card border-border text-foreground"
          >
            {selectedLabel}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className="w-[var(--radix-popover-trigger-width)] p-0 bg-card text-foreground border border-border rounded-xl shadow-lg "
        >
          <Command
            className="w-full bg-card text-foreground rounded-xl"
            dir="rtl"
          >
            <CommandInput
              placeholder={searchPlaceholder}
              className="h-9 text-right"
            />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup className="max-h-60 overflow-y-auto">
                {options.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.label}
                    onSelect={() => {
                      onChange(value === option.id ? '' : option.id);
                      onBlur?.();
                      setOpen(false);
                    }}
                    className="cursor-pointer text-right"
                  >
                    {option.label}
                    <Check
                      className={cn(
                        'mr-auto h-4 w-4 text-primary',
                        value === option.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
