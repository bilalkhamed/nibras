import { TriangleAlert } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function CustomAlert({
  title,
  description,
  variant = 'warning',
  Icon = TriangleAlert,
}: {
  title: string;
  description?: string;
  variant?: 'warning' | 'destructive' | 'default' | 'success';
  Icon?: React.JSXElementConstructor<React.SVGProps<SVGSVGElement>>;
}) {
  return (
    <Card className="border-border shadow-2xl backdrop-blur bg-card/90">
      <CardContent className="space-y-4">
        <Alert variant={variant}>
          <AlertTitle className="text-lg font-semibold flex justify-center items-center gap-2 mb-3">
            <Icon className="sc" />
            {title}
          </AlertTitle>
          {description && (
            <AlertDescription>
              <p>{description}</p>
            </AlertDescription>
          )}
        </Alert>
      </CardContent>
    </Card>
  );
}
