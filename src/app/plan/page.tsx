import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle,
  CircleDot,
  Star,
  Users,
  BookOpen,
  Video,
  Heart,
} from 'lucide-react';

export default function PlanPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Main Title */}
        <div className="mb-12 text-center animate-in fade-in duration-500">
          <h1 className="leading-30 text-4xl sm:text-5xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            نبراس
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6">
            خطة البرنامج
          </h2>
        </div>

        {/* Programs Section */}
        <Card className="mb-8 border-border bg-card/60 backdrop-blur-sm shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Star className="h-6 w-6 text-primary" />
              البرامج الثلاثة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xl leading-relaxed text-foreground/90">
              هناك ثلاث برامج داخل نبراس وهي:
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
                <BookOpen className="h-5 w-5 text-primary shrink-0" />
                <span className="text-lg font-medium">برنامج القراءة</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
                <Video className="h-5 w-5 text-primary shrink-0" />
                <span className="text-lg font-medium">برنامج المحاضرات</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
                <Heart className="h-5 w-5 text-primary shrink-0" />
                <span className="text-lg font-medium">
                  برنامج &ldquo;ليطمئن قلبي&rdquo;
                </span>
              </div>
            </div>
            <p className="text-lg leading-relaxed text-foreground/80 pt-4">
              كل برنامج من هذه البرامج له منهجه وأنشطته الخاصة ولا يتعلق بأي من
              البرامج الأخرى.
            </p>
            <p className="text-lg leading-relaxed text-foreground/80 font-semibold">
              على جميع اليافعات الالتزام بهذه البرامج الثلاث.
            </p>
          </CardContent>
        </Card>

        {/* Weekly Structure Section */}
        <Card className="mb-12 border-border bg-card/60 backdrop-blur-sm shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground">
              هيكل البرنامج الأسبوعي
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-lg leading-relaxed text-foreground/90">
              البرنامج الواحد يتكون من عدد معين من الأسابيع:
            </p>
            <ul className="space-y-2 mr-6">
              <li className="flex items-start gap-3 text-lg leading-relaxed">
                <CircleDot className="h-5 w-5 text-primary mt-1 shrink-0" />
                <span>
                  يحتوي الأسبوع على ورد قراءة، أو محاضرة، أو أنشطة تفاعلية.
                </span>
              </li>
              <li className="flex items-start gap-3 text-lg leading-relaxed">
                <CircleDot className="h-5 w-5 text-primary mt-1 shrink-0" />
                <span>ينظم منهج البرامج بحسب الأسابيع</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Roles Divider */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-primary mb-2">
            الأدوار الرئيسية في النظام
          </h2>
          <p className="text-lg text-muted-foreground">
            هناك ثلاثة أدوار رئيسية في النظام:
          </p>
        </div>

        {/* Role Cards */}
        <div className="space-y-6">
          {/* Admin Role */}
          <Card className="border-border bg-card/60 backdrop-blur-sm shadow-lg pt-0">
            <CardHeader className="border-b border-border bg-linear-to-r from-primary/10 to-secondary/10">
              <CardTitle className="text-2xl font-bold text-primary flex items-center gap-3 pt-6">
                <Users className="h-9 w-7" />
                ١. الإدارة أو فريق البيانات
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Tasks */}
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  مهامه:
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-lg leading-relaxed">
                    <CheckCircle className="h-5 w-5 text-destructive mt-1 shrink-0" />
                    <span>تنظيم البرامج والأسابيع والخطط</span>
                  </li>
                  <li className="flex items-start gap-3 text-lg leading-relaxed">
                    <CheckCircle className="h-5 w-5 text-destructive mt-1 shrink-0" />
                    <span>
                      تحميل المناهج ورفع المصادر التعليمية والملفات والمرفقات
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-lg leading-relaxed">
                    <CheckCircle className="h-5 w-5 text-destructive mt-1 shrink-0" />
                    <span>
                      إنشاء حسابات المستخدمين سواء للمشرفات أو اليافعات
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-lg leading-relaxed">
                    <CheckCircle className="h-5 w-5 text-destructive mt-1 shrink-0" />
                    <span>توزيع الطالبات والمشرفات على مجموعات</span>
                  </li>
                </ul>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  المزايا:
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-lg leading-relaxed">
                    <Star className="h-5 w-5 text-accent mt-1 shrink-0" />
                    <span>تحميل التقارير</span>
                  </li>
                  <li className="flex items-start gap-3 text-lg leading-relaxed">
                    <Star className="h-5 w-5 text-accent mt-1 shrink-0" />
                    <span>إحصائيات عامة على مستويات مختلفة</span>
                  </li>
                  <li className="flex items-start gap-3 text-lg leading-relaxed">
                    <Star className="h-5 w-5 text-accent mt-1 shrink-0" />
                    <span>التحكم الكامل بالمنصة</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Supervisor Role */}
          <Card className="border-border bg-card/60 backdrop-blur-sm shadow-lg pt-0">
            <CardHeader className="border-b border-border bg-linear-to-r from-secondary/10 to-accent/10">
              <CardTitle className="text-2xl font-bold text-secondary flex items-center gap-3 pt-6">
                <Users className="h-9 w-7" />
                ٢. المشرفات
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Tasks */}
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  مهامهنّ:
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-lg leading-relaxed">
                    <CheckCircle className="h-5 w-5 text-destructive mt-1 shrink-0" />
                    <span>
                      متابعة تقدم الطالبات في القراءة والمحاضرات والأنشطة.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-lg leading-relaxed">
                    <CheckCircle className="h-5 w-5 text-destructive mt-1 shrink-0" />
                    <span>
                      رصد إنجاز الطالبات اللاتي يتعسر عليهن الدخول للمنصة.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-lg leading-relaxed">
                    <CheckCircle className="h-5 w-5 text-destructive mt-1 shrink-0" />
                    <span>
                      مراجعة إجابات الطالبات على الأنشطة المكتوبة والصور.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-lg leading-relaxed">
                    <CheckCircle className="h-5 w-5 text-destructive mt-1 shrink-0" />
                    <span>إرسال الملاحظات للطالبات داخل المنصة.</span>
                  </li>
                </ul>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  المزايا:
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-lg leading-relaxed">
                    <Star className="h-5 w-5 text-accent mt-1 shrink-0" />
                    <span>رؤية لوحة خاصة بمجموعاتها فقط.</span>
                  </li>
                  <li className="flex items-start gap-3 text-lg leading-relaxed">
                    <Star className="h-5 w-5 text-accent mt-1 shrink-0" />
                    <span>
                      سهولة وضع علامات الإنجاز بدون دفاتر أو جداول معقدة.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-lg leading-relaxed">
                    <Star className="h-5 w-5 text-accent mt-1 shrink-0" />
                    <span>تقارير جاهزة.</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Students Role */}
          <Card className="border-border bg-card/60 backdrop-blur-sm shadow-lg pt-0">
            <CardHeader className="border-b border-border bg-linear-to-r from-accent/10 to-primary/10">
              <CardTitle className="text-2xl font-bold text-accent flex items-center gap-3 pt-6">
                <Users className="h-9 w-7" />
                ٣. اليافعات
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Tasks */}
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  مهامهنّ:
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-lg leading-relaxed">
                    <CheckCircle className="h-5 w-5 text-destructive mt-1 shrink-0" />
                    <span>
                      قراءة الأوراد المطلوبة أسبوعيًا ودخول المحاضرات عن طريق
                      الروابط المرفوعة.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-lg leading-relaxed">
                    <CheckCircle className="h-5 w-5 text-destructive mt-1 shrink-0" />
                    <span>حل الأنشطة.</span>
                  </li>
                  <li className="flex items-start gap-3 text-lg leading-relaxed">
                    <CheckCircle className="h-5 w-5 text-destructive mt-1 shrink-0" />
                    <span>
                      متابعة تقدمها الأسبوعي ومعرفة المتبقي من المهام.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  المزايا:
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-lg leading-relaxed">
                    <Star className="h-5 w-5 text-accent mt-1 shrink-0" />
                    <span>واجهة بسيطة وسهلة تناسب العمر (12–17).</span>
                  </li>
                  <li className="flex items-start gap-3 text-lg leading-relaxed">
                    <Star className="h-5 w-5 text-accent mt-1 shrink-0" />
                    <span>
                      لوحة خاصة تُظهر إنجازاتها ونسب التقدم بألوان مريحة وواضحة.
                    </span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
