import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import labels from '@/lib/labels.json';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <Card className="border-border shadow-2xl backdrop-blur bg-card/90">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
          جاري التحقق من الدعوة
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          لحظات من فضلك…
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-full" />
      </CardContent>
    </Card>
  );
}
