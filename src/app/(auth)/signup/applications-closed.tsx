import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function ApplicationsClosed() {
  return (
    <div className="mt-10 w-full flex items-center justify-center">
      <Alert className="max-w-xl" variant="default">
        <AlertTitle className="text-center mb-1">
          التقديم مغلق حاليًا
        </AlertTitle>
        <AlertDescription className="justify-center">
          نعتذر، لكن الانضمام لنبراس عبر الموقع غير متاح حاليًا.
        </AlertDescription>
      </Alert>
    </div>
  );
}
