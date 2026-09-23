import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths targeted by automated bot vulnerability scanners
const BLOCKED_SCANNER_PATHS = [
  "/.env",
  "/.git",
  "/wp-admin",
  "/wp-login.php",
  "/xmlrpc.php",
  "/.aws",
  "/phpmyadmin",
  "/.svn",
  "/.DS_Store",
  "/server-status",
  "/eval-stdin.php",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Block common malicious scanner probes immediately
  const lowerPath = pathname.toLowerCase();
  for (const blocked of BLOCKED_SCANNER_PATHS) {
    if (lowerPath.startsWith(blocked) || lowerPath.includes(blocked)) {
      return new NextResponse(null, { status: 404 });
    }
  }

  // 2. Early gate for admin routes: check session cookie presence
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin-login")) {
    const sessionCookie = req.cookies.get("prepai_session")?.value;
    if (!sessionCookie) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith("/api/admin")) {
    const sessionCookie = req.cookies.get("prepai_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }
  }

  // 3. CSRF Protection on mutating requests (POST, PUT, DELETE, PATCH)
  // Skip external webhook endpoints (e.g. /api/webhooks/paystack) which use HMAC signatures
  const isWebhook = pathname.startsWith("/api/webhooks");
  const isMutating = ["POST", "PUT", "DELETE", "PATCH"].includes(req.method);

  if (isMutating && !isWebhook) {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    const forwardedHost = req.headers.get("x-forwarded-host");
    const expectedHost = forwardedHost || host;

    if (origin && expectedHost) {
      try {
        const originUrl = new URL(origin);
        // Allow same host or matching dev/e2b preview origins
        const isMatch =
          originUrl.host === expectedHost ||
          originUrl.hostname === "localhost" ||
          originUrl.hostname === "127.0.0.1" ||
          originUrl.hostname.endsWith(".e2b.app") ||
          originUrl.hostname.endsWith(".app.github.dev");

        if (!isMatch) {
          console.warn(`[Security] CSRF blocked request to ${pathname} from origin ${origin}`);
          return NextResponse.json({ error: "Cross-site request blocked." }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
      }
    }
  }

  const res = NextResponse.next();

  // 4. Content Security Policy & Security headers
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https: wss:",
    "frame-src 'self' https://checkout.paystack.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  res.headers.set("Content-Security-Policy", cspHeader);
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
