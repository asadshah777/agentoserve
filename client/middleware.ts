import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_ROUTES = new Set(["/auth/login", "/auth/create"]);
const PROTECTED_ROUTES = ["/dashboard"]; // add more if needed

const ROOT_PATH = "/";
const LOGIN_PATH = "/auth/login";
const PROJECTS_PATH = "/dashboard";
const COOKIE_NAME = "jwtToken";

const secret = process.env.JWT_SECRET;
const secretKey = secret ? new TextEncoder().encode(secret) : undefined;

async function isJwtValid(token?: string) {
  if (!token || !secretKey) return false;

  try {
    await jwtVerify(token, secretKey);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const isValid = await isJwtValid(token);

  // ================================
  // ROOT ROUTE HANDLING
  // ================================
  if (pathname === ROOT_PATH) {
    // 🚨 If you later want a public static website on "/",
    // remove this entire block and let NextResponse.next() handle it.

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = isValid ? PROJECTS_PATH : LOGIN_PATH;
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  // ================================
  // PROTECTED ROUTES
  // ================================
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isValid) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = LOGIN_PATH;
      loginUrl.search = "";
      return NextResponse.redirect(loginUrl);
    }
  }

  // ================================
  // AUTH ROUTES (prevent logged-in access)
  // ================================
  if (AUTH_ROUTES.has(pathname) && isValid) {
    const projectsUrl = request.nextUrl.clone();
    projectsUrl.pathname = PROJECTS_PATH;
    projectsUrl.search = "";
    return NextResponse.redirect(projectsUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/", // handle root redirects
    "/dashboard/:path*",
    "/auth/:path*",
  ],
};
