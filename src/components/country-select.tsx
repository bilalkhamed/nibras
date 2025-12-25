'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
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

import labels from '@/lib/labels.json';

export default function CountrySelect() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('اختر');

  return (
    <div dir="rtl">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-9 w-full justify-between rounded-xl bg-input/30  border-border text-foreground"
          >
            {value || 'اختر'}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className="w-[var(--radix-popover-trigger-width)] p-0 bg-card text-foreground border border-border rounded-xl shadow-lg"
        >
          <Command
            className="w-full bg-card text-foreground rounded-xl"
            dir="rtl"
          >
            <CommandInput
              placeholder="ابحث عن الدولة..."
              className="h-9 text-right"
            />
            <CommandList>
              <CommandEmpty>لم يتم العثور على دولة.</CommandEmpty>
              <CommandGroup>
                {Object.keys(labels.countries).map((country) => {
                  const countryKey = country as keyof typeof labels.countries;
                  return (
                    <CommandItem
                      key={country}
                      value={labels.countries[countryKey]}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? '' : currentValue);
                        setOpen(false);
                      }}
                      className="cursor-pointer text-right"
                    >
                      {labels.countries[countryKey]}
                      <Check
                        className={cn(
                          'mr-auto h-4 w-4 text-primary',
                          value === country ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
