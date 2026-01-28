'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import SearchSelect from '@/components/common/search-select';
import { Plus, Loader2, CheckIcon, Loader2Icon } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SUPERVISOR_ROLE } from '@/types/types';
import { createGroupAction } from '../../actions';

const cohorts = ['2025', '2024', '2023'];

interface Supervisor {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
}

export function CreateGroupDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [cohort, setCohort] = useState('');
  const [supervisorId, setSupervisorId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success] = useState<boolean>(false);

  const router = useRouter();

  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [dataFetched, setDataFetched] = useState(false);

  // Lazy load supervisors when dialog opens
  useEffect(() => {
    if (!open || dataFetched) return;

    const fetchSupervisors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const searchParams = new URLSearchParams({
          role: SUPERVISOR_ROLE,
          nameOnly: 'true',
        });
        const response = await fetch(`/api/users?${searchParams.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch supervisors');
        }

        const data = await response.json();
        setSupervisors(data.users);
        setDataFetched(true);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load supervisors',
        );
        console.error('Error fetching supervisors:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupervisors();
  }, [open, dataFetched]);

  const handleReset = () => {
    setName('');
    setCohort('');
    setSupervisorId('');
    setError(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      handleReset();
    }
  };

  const handleSubmit = () => {
    startTransition(async () => {
      setError(null);
      try {
        const result = await createGroupAction({
          name,
          cohortId: cohort,
          supervisorId,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        router.refresh();
        setOpen(false);
        handleReset();
        toast.success('تم إنشاء المجموعة بنجاح!', {
          duration: 2000,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    });
  };

  // Transform supervisors to SearchSelect format
  const supervisorOptions = supervisors.map((s) => ({
    id: s.id,
    label: `${s.firstName} ${s.middleName} ${s.lastName}`,
  }));

  const supervisorName = supervisorOptions.find(
    (s) => s.id === supervisorId,
  )?.label;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 ml-2" />
          إنشاء مجموعة جديدة
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle className="text-right">إنشاء مجموعة جديدة</DialogTitle>
          <DialogDescription className="text-right text-muted-foreground">
            أضيفي معلومات المجموعة الجديدة وحددي المشرفة المسؤولة.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2Icon className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">جاري التحميل...</span>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-right">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid gap-4">
            {/* Name Field */}
            <div className="grid gap-2">
              <Label htmlFor="group-name" className="text-right">
                اسم المجموعة
              </Label>
              <Input
                id="group-name"
                placeholder="مثال: مجموعة النور"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-right"
              />
            </div>

            {/* Cohort Select */}
            <div className="grid gap-2">
              <Label htmlFor="cohort" className="text-right">
                الدفعة
              </Label>
              <Select dir="rtl" value={cohort} onValueChange={setCohort}>
                <SelectTrigger id="cohort" className="w-full">
                  <SelectValue placeholder="اختر الدفعة" />
                </SelectTrigger>
                <SelectContent className="bg-card text-foreground border border-border">
                  {cohorts.map((c) => (
                    <SelectItem key={c} value={c} className="cursor-pointer">
                      دفعة {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Supervisor SearchSelect */}
            <div className="grid gap-2">
              <Label htmlFor="supervisor" className="text-right">
                المشرفة
              </Label>
              <SearchSelect
                options={supervisorOptions}
                value={supervisorId}
                onChange={setSupervisorId}
                placeholder="اختر المشرفة"
                searchPlaceholder="ابحثي عن المشرفة..."
              />
            </div>

            {success && (
              <Alert variant="success" className="max-w-2xl mx-auto">
                <CheckIcon className="h-5 w-5 text-success" />
                <AlertTitle>تم إنشاء المجموعة بنجاح!</AlertTitle>
              </Alert>
            )}

            {/* Confirmation Message */}
            {name && cohort && supervisorName && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-right">
                <p className="text-sm text-foreground/90">
                  <span className="font-semibold">سيتم إضافة:</span>
                  <br />
                  <span className="text-primary font-medium">{name}</span>
                  <br />
                  الدفعة <span className="font-medium">دفعة {cohort}</span> •
                  المشرفة <span className="font-medium">{supervisorName}</span>
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={isPending}>
              إلغاء
            </Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={
              !name ||
              !cohort ||
              !supervisorId ||
              isPending ||
              isLoading ||
              !dataFetched
            }
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جاري الإنشاء...
              </>
            ) : (
              'إنشاء المجموعة'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
