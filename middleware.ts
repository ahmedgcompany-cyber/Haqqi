import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isLocale, locales } from "@/lib/i18n";

const PUBLIC_PATHS = ["/auth"] as const;
const ALWAYS_PUBLIC = ["/", "/calculator"] as const;

function isPublicPath(pathname: string, locale: string) {
  const prefix = `/${locale}`;

  for (const p of ALWAYS_PUBLIC) {
    if (pathname === `${prefix}${p}` || pathname === `${prefix}${p}/`) return true;
  }

  for (const p of PUBLIC_PATHS) {
    if (pathname.startsWith(`${prefix}${p}`)) return true;
  }

  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Locale extraction
  const firstSegment = pathname.split("/")[1];
  const locale = isLocale(firstSegment) ? firstSegment : null;

  // If no locale in path, let Next.js handle it (or redirect in route)
  if (!locale) {
    return updateSession(request);
  }

  const response = await updateSession(request);

  // Auth protection for non-public routes
  if (!isPublicPath(pathname, locale)) {
    // Check auth cookie quickly; full session validated by updateSession
    const authCookie = Array.from(request.cookies.getAll()).find((c) =>
      c.name.startsWith("sb-") && c.name.includes("auth-token"),
    );
    if (!authCookie) {
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
