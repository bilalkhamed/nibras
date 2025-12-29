import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  badge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  action?: {
    label: string;
    href: string;
  };
}

interface ActivityCardProps {
  title: string;
  items: ActivityItem[];
  emptyMessage: string;
  icon?: LucideIcon;
  viewAllHref?: string;
}

export function ActivityCard({
  title,
  items,
  emptyMessage,
  icon: Icon,
  viewAllHref,
}: ActivityCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-primary" />}
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        {viewAllHref && items.length > 0 && (
          <Button asChild variant="ghost" size="sm">
            <Link href={viewAllHref}>عرض الكل</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {emptyMessage}
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{item.title}</p>
                    {item.badge && (
                      <Badge
                        variant={item.badge.variant || 'default'}
                        className="text-xs"
                      >
                        {item.badge.label}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.timestamp}
                  </p>
                </div>
                {item.action && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={item.action.href}>{item.action.label}</Link>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
