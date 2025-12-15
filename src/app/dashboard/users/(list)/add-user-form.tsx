import labels from '@/lib/labels.json';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CountrySelect from '@/components/country-select';

export function AddUserForm() {
  return (
    <Card className="border-border shadow-lg bg-card/90 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-lg font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
          {labels.dashboard.users.addUser}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1 md:col-span-2">
            <Label>{labels.dashboard.users.name}</Label>
            <div className="grid grid-cols-3 gap-2">
              <Input id="firstName" placeholder="الاسم الأول" />
              <Input id="middleName" placeholder="اسم الأب" />
              <Input id="lastName" placeholder="اسم العائلة" />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="age">{labels.dashboard.users.age}</Label>

            <Select dir="rtl">
              <SelectTrigger
                id="age"
                className="w-full border-border bg-card text-foreground focus:ring-primary"
              >
                <SelectValue placeholder="اختر العمر" />
              </SelectTrigger>

              <SelectContent className="bg-card text-foreground border border-border">
                {Array.from({ length: 6 }).map((_, i) => {
                  const age = i + 12; // generates 10–49
                  return (
                    <SelectItem
                      key={age}
                      value={String(age)}
                      className="cursor-pointer"
                    >
                      {age}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="cohort">{labels.dashboard.users.cohort}</Label>
            <Select dir="rtl">
              <SelectTrigger
                id="cohort"
                className="w-full border-border bg-card text-foreground focus:ring-primary"
              >
                <SelectValue placeholder="اختر السنة" />
              </SelectTrigger>

              <SelectContent className="bg-card text-foreground border border-border">
                {Array.from({ length: 4 }).map((_, i) => {
                  const age = i + 1;
                  return (
                    <SelectItem
                      key={age}
                      value={String(age)}
                      className="cursor-pointer"
                    >
                      {age}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="country">{labels.dashboard.users.country}</Label>
            <CountrySelect />
          </div>
          <div className="space-y-1">
            <Label htmlFor="role">{labels.dashboard.users.role}</Label>
            <Select dir="rtl">
              <SelectTrigger
                id="role"
                className="w-full border-border bg-card text-foreground focus:ring-primary"
              >
                <SelectValue placeholder="اختر الرتبة" />
              </SelectTrigger>

              <SelectContent className="bg-card text-foreground border border-border">
                <SelectItem value="student" className="cursor-pointer">
                  طالبة
                </SelectItem>
                <SelectItem value="teacher" className="cursor-pointer">
                  معلمة
                </SelectItem>
                <SelectItem value="admin" className="cursor-pointer">
                  مسؤولة
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" size={'md'}>
            {labels.dashboard.users.create}
          </Button>
          <br />
          <Button variant="outline" size={'md'}>
            {labels.dashboard.users.importCsv}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
