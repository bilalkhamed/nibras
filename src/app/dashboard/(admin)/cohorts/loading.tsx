import { CardsListSkeleton } from '@/components/skeletons';

export default function LoadingCohorts() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        <div className="h-4 w-48 bg-muted animate-pulse rounded" />
      </div>
      <CardsListSkeleton numberOfCards={6} />
    </div>
  );
}
