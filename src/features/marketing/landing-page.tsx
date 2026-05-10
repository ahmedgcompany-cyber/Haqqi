import Link from "next/link";
import {
  ArrowRight,
  FileSpreadsheet,
  Globe2,
  MoonStar,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { copy, localeHref, type Locale } from "@/lib/i18n";

export function LandingPage({ locale }: { locale: Locale }) {
  const heroStats = [
    {
      label: copy(locale, "Countries covered", "الدول المشمولة"),
      value: "6",
    },
    {
      label: copy(locale, "Payroll-ready exports", "تصديرات جاهزة للرواتب"),
      value: "WPS + XLSX",
    },
    {
      label: copy(locale, "Languages", "اللغات"),
      value: copy(locale, "Arabic + English", "العربية + الإنجليزية"),
    },
  ];

  const features = [
    {
      icon: <WalletCards className="h-6 w-6 text-primary" />,
      title: copy(locale, "Gratuity engine", "محرك مكافآت"),
      description: copy(
        locale,
        "Handle GCC formulas with a CFO-friendly explanation trail.",
        "تعامل مع صيغ الخليج مع مسار شرح واضح يناسب المدير المالي.",
      ),
    },
    {
      icon: <FileSpreadsheet className="h-6 w-6 text-accent" />,
      title: copy(locale, "WPS / SIF exports", "تصدير حماية الأجور"),
      description: copy(
        locale,
        "Prepare UAE payroll files and accountant-ready exports in one place.",
        "جهز ملفات الرواتب الإماراتية وتصديرات المحاسبين من مكان واحد.",
      ),
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-success" />,
      title: copy(locale, "Audit trail", "سجل تدقيق"),
      description: copy(
        locale,
        "Track every sensitive compliance action across multiple companies.",
        "تتبع كل إجراء امتثال حساس عبر شركات متعددة.",
      ),
    },
    {
      icon: <Globe2 className="h-6 w-6 text-primary" />,
      title: copy(locale, "Bilingual UX", "تجربة ثنائية اللغة"),
      description: copy(
        locale,
        "Full RTL-ready Arabic and polished English from the same codebase.",
        "دعم كامل للعربية مع اتجاه RTL وإنجليزية مصقولة من نفس الشيفرة.",
      ),
    },
  ];

  const pricing = [
    {
      name: copy(locale, "Starter", "الأساسية"),
      price: copy(locale, "$19", "١٩$"),
      note: copy(locale, "1 company • 25 employees", "شركة واحدة • 25 موظفاً"),
    },
    {
      name: copy(locale, "Growth", "النمو"),
      price: copy(locale, "$59", "٥٩$"),
      note: copy(locale, "5 companies • WPS + settlements", "5 شركات • حماية أجور + تسويات"),
      highlighted: true,
    },
    {
      name: copy(locale, "Scale", "التوسع"),
      price: copy(locale, "Custom", "مخصص"),
      note: copy(locale, "Unlimited entities • audit controls", "كيانات غير محدودة • ضوابط تدقيق"),
    },
  ];

  return (
    <section className="grid gap-8">
      <Card className="overflow-hidden p-0">
        <div className="grid gap-8 px-6 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-12">
          <div className="relative">
            <Badge variant="gold">
              {copy(locale, "For GCC SMB operators", "للشركات الصغيرة والمتوسطة الخليجية")}
            </Badge>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-tight text-balance text-foreground md:text-6xl">
              {copy(
                locale,
                "A polished compliance workspace for WPS, gratuity, and final settlements.",
                "مساحة امتثال مصقولة لملفات حماية الأجور ومكافأة نهاية الخدمة والتسويات النهائية.",
              )}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">
              {copy(
                locale,
                "Haqqi gives founders, finance leads, and HR teams a bilingual system to calculate liabilities, generate payroll exports, track employees, and produce settlement PDFs without spreadsheet chaos.",
                "يمنح حقي المؤسسين ومديري المالية وفرق الموارد البشرية نظاماً ثنائي اللغة لحساب الالتزامات وإنشاء تصديرات الرواتب وتتبع الموظفين وإنتاج ملفات PDF للتسويات دون فوضى الجداول.",
              )}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href={localeHref(locale, "/dashboard")}>
                <Button size="lg">
                  {copy(locale, "Open dashboard", "افتح اللوحة")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={localeHref(locale, "/calculator")}>
                <Button variant="secondary" size="lg">
                  {copy(locale, "Try calculator", "جرّب الحاسبة")}
                </Button>
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[1.5rem] border border-border bg-card-strong p-5"
                >
                  <p className="text-sm text-muted">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[2rem] border border-primary/10 bg-gradient-to-br from-primary/12 via-primary/6 to-accent/10 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary p-3 text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted">
                    {copy(locale, "What you ship faster", "ما الذي تنجزه أسرع")}
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {copy(locale, "Compliance in one operating layer", "الامتثال ضمن طبقة تشغيل واحدة")}
                  </p>
                </div>
              </div>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-muted">
                <li>{copy(locale, "• Generate UAE WPS files from the employee roster", "• إنشاء ملفات حماية الأجور الإماراتية من سجل الموظفين")}</li>
                <li>{copy(locale, "• Estimate gratuity and settlement exposure live", "• تقدير التزامات المكافأة والتسوية بشكل مباشر")}</li>
                <li>{copy(locale, "• Export accountant-friendly Excel snapshots", "• تصدير لقطات إكسل مناسبة للمحاسبين")}</li>
                <li>{copy(locale, "• Toggle Arabic RTL and English instantly", "• التبديل الفوري بين العربية والإنجليزية")}</li>
              </ul>
            </div>

            <div className="rounded-[2rem] border border-border bg-card-strong p-6">
              <div className="flex items-center gap-3">
                <MoonStar className="h-5 w-5 text-primary" />
                <p className="text-sm font-medium text-foreground">
                  {copy(locale, "Premium UI touches", "لمسات واجهة متميزة")}
                </p>
              </div>
              <p className="mt-3 text-sm leading-7 text-muted">
                {copy(
                  locale,
                  "Dark mode, responsive cards, Arabic typography, and calm spacing are built in from day one for decision-makers who live in dashboards.",
                  "الوضع الداكن والبطاقات المتجاوبة والطباعة العربية المتميزة والمساحات الهادئة موجودة منذ اليوم الأول لصناع القرار الذين يعيشون داخل اللوحات.",
                )}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.title}>
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-card-strong p-3">{feature.icon}</div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">{feature.title}</h2>
                <p className="mt-2 text-sm leading-7 text-muted">{feature.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Badge>{copy(locale, "Pricing", "الأسعار")}</Badge>
            <h2 className="mt-4 text-3xl font-semibold text-foreground">
              {copy(locale, "Simple pricing for growing GCC teams.", "تسعير بسيط للفرق الخليجية المتنامية.")}
            </h2>
            <p className="mt-3 text-muted">
              {copy(
                locale,
                "Start with one entity and move up as your HR and finance workflows mature.",
                "ابدأ بكيان واحد ثم توسع مع نضج سير العمل لدى الموارد البشرية والمالية.",
              )}
            </p>
          </div>
          <Link href={localeHref(locale, "/dashboard")}>
            <Button variant="secondary">
              {copy(locale, "View live workspace", "عرض مساحة العمل")}
            </Button>
          </Link>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {pricing.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-[1.6rem] border p-6 ${
                plan.highlighted
                  ? "border-primary/30 bg-primary text-white shadow-xl shadow-primary/20"
                  : "border-border bg-card-strong"
              }`}
            >
              <p className={`text-sm ${plan.highlighted ? "text-white/70" : "text-muted"}`}>
                {plan.name}
              </p>
              <p className="mt-3 text-4xl font-semibold">{plan.price}</p>
              <p className={`mt-2 text-sm ${plan.highlighted ? "text-white/75" : "text-muted"}`}>
                {plan.note}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}