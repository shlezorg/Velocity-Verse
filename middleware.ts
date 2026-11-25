import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_SECRET = process.env.AUTH_SECRET || (process.env.NODE_ENV === "production" ? "" : "velocity-verse-local-dev-only");
const SESSION_COOKIE_NAME = "vv_session";

// Edge-compatible HMAC-SHA256 verification using Web Crypto API
async function verifyToken(token: string): Promise<boolean> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return false;
    const [payloadB64, signature] = parts;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(AUTH_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(payloadB64));
    const expectedSig = Buffer.from(sigBuffer).toString("base64url");

    if (signature !== expectedSig) return false;

    // Check expiration
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
    if (payload.exp && Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip login page and static assets
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return NextResponse.next();
  }

  // 2. Protect Admin Pages
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie || !(await verifyToken(sessionCookie))) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Protect Admin Analytics API
  if (pathname === "/api/analytics" || pathname.startsWith("/api/analytics/")) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionCookie || !(await verifyToken(sessionCookie))) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/admin", "/api/analytics/:path*", "/api/analytics"],
};
