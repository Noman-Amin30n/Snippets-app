import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export { default } from "next-auth/middleware";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const path = request.nextUrl.pathname;

  const isAuth = !!token;
  const isAuthPage =
    path.startsWith("/login") || path.startsWith("/register") || path.startsWith("/verify") || path.startsWith("/reset-password");
  const isProtectedPage = path.startsWith("/snippets");

  // Redirect authenticated user away from login/register
  if (isAuth && isAuthPage) {
    return NextResponse.redirect(new URL("/snippets", request.url));
  }

  // Redirect unauthenticated user from protected routes
  if (!isAuth && isProtectedPage) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next(); // Let all others pass
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/snippets",
    "/snippets/:path*",
    "/verify",
    "/reset-password",
  ],
};
