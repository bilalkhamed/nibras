import { CardsListSkeleton } from '@/components/skeletons';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProgramsLoading() {
  return (
    <>
      <Skeleton className="h-8 w-1/4 mb-4 mt-4" />
      <CardsListSkeleton />
    </>
  );
}
