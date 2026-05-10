"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Calculator, FileSpreadsheet, LayoutDashboard, Mail, ShieldCheck, Users, Wallet } from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useLocale } from "@/components/providers/locale-provider";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/user-menu";
import { createClient } from "@/lib/supabase/client";
import { copy, localeHref } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const navIconClassName = "h-4 w-4";

export function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { locale, direction } = useLocale();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setAuthenticated(!!data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const navigation = [
    {
      href: localeHref(locale, ""),
      label: copy(locale, "Home", "الرئيسية"),
      icon: <ShieldCheck className={navIconClassName} />,
    },
    {
      href: localeHref(locale, "/dashboard"),
      label: copy(locale, "Dashboard", "لوحة التحكم"),
      icon: <LayoutDashboard className={navIconClassName} />,
    },
    {
      href: localeHref(locale, "/calculator"),
      label: copy(locale, "Calculator", "الحاسبة"),
      icon: <Calculator className={navIconClassName} />,
    },
    {
      href: localeHref(locale, "/companies"),
      label: copy(locale, "Companies", "الشركات"),
      icon: <Building2 className={navIconClassName} />,
    },
    {
      href: localeHref(locale, "/employees"),
      label: copy(locale, "Employees", "الموظفون"),
      icon: <Users className={navIconClassName} />,
    },
    {
      href: localeHref(locale, "/wps"),
      label: copy(locale, "WPS / SIF", "حماية الأجور"),
      icon: <FileSpreadsheet className={navIconClassName} />,
    },
    {
      href: localeHref(locale, "/settlements"),
      label: copy(locale, "Settlements", "التسويات"),
      icon: <Wallet className={navIconClassName} />,
    },
    {
      href: localeHref(locale, "/contact"),
      label: copy(locale, "Contact", "تواصل"),
      icon: <Mail className={navIconClassName} />,
    },
  ];

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] bg-gradient-to-b from-primary/10 via-accent/8 to-transparent" />
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href={localeHref(locale, "")}
            className="inline-flex items-center gap-3 rounded-full"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-strong text-base font-bold text-white shadow-lg shadow-primary/20">
              حق
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-foreground">Haqqi</span>
                <Badge>{copy(locale, "Built for GCC", "مصمم للخليج")}</Badge>
              </div>
              <p className="text-sm text-muted">
                {copy(locale, "Compliance workflows in AR/EN", "سير عمل امتثال باللغتين")}
              </p>
            </div>
          </Link>

          <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
            <nav className="hidden flex-wrap items-center gap-2 xl:flex">
              {navigation.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium",
                      isActive
                        ? "border-primary/30 bg-primary text-white"
                        : "border-border bg-card text-foreground hover:border-primary/30 hover:bg-card-strong",
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <LanguageSwitcher pathname={pathname} />
            <ThemeToggle />
            {authenticated ? (
              <UserMenu locale={locale} />
            ) : (
              <Link
                href={`/${locale}/auth/login`}
                className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
              >
                {copy(locale, "Sign in", "تسجيل الدخول")}
              </Link>
            )}
          </div>
        </div>
      </header>

      <main dir={direction} className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}