import { Card, CardContent } from '@/components/ui/card';

export function SettingsView() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">
          الإعدادات
        </h2>
        <Card className="border-border bg-card/80">
          <CardContent className="p-4 md:p-6">
            <p className="text-muted-foreground text-sm">
              هنا ستظهر إعدادات الحساب لاحقاً.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
