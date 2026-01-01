import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Skeleton className="h-8 w-64 mb-6" />
      <Skeleton className="h-64 w-full md:w-1/2" />
    </div>
  );
}
