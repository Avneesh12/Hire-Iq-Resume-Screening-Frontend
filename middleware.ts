import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Paths that don't require authentication */
const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/marketing",
  "/",
];

const AUTH_TOKEN_COOKIE = "hireiq_token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow static assets and API routes
  if (pathname.startsWith("/api/")) return NextResponse.next();

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (isPublic) return NextResponse.next();

  // Check for auth cookie (set this cookie on login alongside localStorage for SSR guard)
  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;

  if (!token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
