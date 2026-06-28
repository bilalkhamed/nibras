import { CustomAlert } from '@/components/common/custom-alert';
import { getAllLevels } from '@/features/levels/service/queries';
import { LevelList, CreateLevelSheet } from '@/features/levels';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import getAuthSession from '@/lib/server/auth-session';

export default async function LevelsPage() {
  const session = await getAuthSession();
  const levelsResult = await getAllLevels();

  if (!levelsResult.success) {
    return (
      <CustomAlert
        title="عذراً، حدث خطأ أثناء تحميل المستويات"
        description={`رمز الخطأ: ${levelsResult.error.statusCode}`}
      />
    );
  }

  const levels = levelsResult.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">المستويات</h1>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة المستويات الدراسية للنظام
          </p>
        </div>
        {session?.role !== 'director' && (
          <CreateLevelSheet>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              إضافة مستوى جديد
            </Button>
          </CreateLevelSheet>
        )}
      </div>
      <LevelList levels={levels} isDirector={session?.role === 'director'} />
    </div>
  );
}
