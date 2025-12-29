import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProgressItem {
  label: string;
  current: number;
  total: number;
  color?: string;
}

interface ProgressCardProps {
  title: string;
  items: ProgressItem[];
}

export function ProgressCard({ title, items }: ProgressCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => {
          const percentage = Math.round((item.current / item.total) * 100);
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.label}</span>
                <span className="text-muted-foreground">
                  {item.current} / {item.total}
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
              <p className="text-xs text-muted-foreground text-left">
                {percentage}% مكتمل
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
