'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import labels from '@/lib/labels.json';
import { useState } from 'react';

export function AddItemDialog({
  program,
  level,
  week,
}: {
  program: string;
  level: number;
  week: number;
}) {
  const [name, setName] = useState('');
  const [sourceType, setSourceType] = useState<'file' | 'link'>('link');
  const [source, setSource] = useState('');

  const programLabels: Record<string, string> = {
    reading: labels.programs.reading.title,
    lectures: labels.programs.lecture.title,
    heart: labels.programs.heart.title,
  };

  return (
    <Dialog
      onOpenChange={() => {
        setName('');
        setSourceType('link');
        setSource('');
      }}
    >
      <DialogTrigger asChild>
        <Button variant="primary">{labels.dashboard.curriculum.addItem}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-right">
            {labels.dashboard.curriculum.addItem}
          </DialogTitle>
          <DialogDescription className="text-right text-muted-foreground">
            أضف عنصر جديد للمنهج
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          {/* Name Field */}
          <div className="grid gap-2">
            <Label htmlFor="item-name" className="text-right">
              اسم العنصر
            </Label>
            <Input
              id="item-name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: كتاب الأسبوع الأول"
              className="text-right"
            />
          </div>

          {/* Source Type */}
          <div className="grid gap-2">
            <Label htmlFor="source-type" className="text-right">
              نوع المصدر
            </Label>
            <Select
              dir="rtl"
              value={sourceType}
              onValueChange={(value) => setSourceType(value as 'file' | 'link')}
            >
              <SelectTrigger id="source-type" className="w-full">
                <SelectValue placeholder="اختر نوع المصدر" />
              </SelectTrigger>

              <SelectContent className="bg-card text-foreground border border-border">
                <SelectItem
                  value="link"
                  onSelect={() => setSourceType('link')}
                  className="cursor-pointer"
                >
                  رابط
                </SelectItem>
                <SelectItem
                  value="file"
                  onSelect={() => setSourceType('file')}
                  className="cursor-pointer"
                >
                  رفع ملف
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Source Input */}
          <div className="grid gap-2">
            <Label htmlFor="source" className="text-right">
              {sourceType === 'file' ? 'الملف' : 'الرابط'}
            </Label>
            {sourceType === 'link' ? (
              <Input
                id="source"
                name="source"
                type="url"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="https://example.com"
                className="text-right"
              />
            ) : (
              <Input
                id="source"
                name="source"
                type="file"
                onChange={(e) => setSource(e.target.files?.[0]?.name || '')}
                className="text-right cursor-pointer"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
              />
            )}
          </div>

          {/* Confirmation Message */}
          {name && source && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-right">
              <p className="text-sm text-foreground/90">
                <span className="font-semibold">سيتم إضافة:</span>
                <br />
                <span className="text-primary font-medium">{name}</span>
                <br />
                إلى{' '}
                <span className="font-medium">{programLabels[program]}</span> •
                المستوى {level + 1} • الأسبوع {week}
              </p>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline">{labels.common.cancel}</Button>
          </DialogClose>
          <Button type="submit" disabled={!name || !source}>
            إضافة العنصر
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
