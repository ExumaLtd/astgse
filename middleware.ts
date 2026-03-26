import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isStudio = request.nextUrl.pathname.startsWith("/studio");

  if (isStudio) {
    // Sanity Studio requires unsafe-inline/unsafe-eval — no nonce here,
    // because a nonce alongside unsafe-inline causes browsers to ignore unsafe-inline.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.sanity.io https://*.sanity.io",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://cdn.sanity.io https://*.sanity.io",
      "font-src 'self' data: https://cdn.sanity.io",
      "connect-src 'self' https://*.sentry.io https://*.sanity.io wss://*.sanity.io",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    const response = NextResponse.next();
    response.headers.set("Content-Security-Policy", csp);
    return response;
  }

  // Generate a cryptographically random nonce for every request.
  // btoa(randomUUID()) is Edge-runtime safe (no Buffer dependency).
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const nonce = btoa(String.fromCharCode(...Array.from(array)));

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://challenges.cloudflare.com https://static.cloudflareinsights.com https://www.googletagmanager.com https://va.vercel-scripts.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://cdn.sanity.io https://*.sanity.io https://astgse.exuma.co.uk https://astgse.com",
    "font-src 'self' data:",
    "connect-src 'self' https://*.sentry.io https://challenges.cloudflare.com https://translate.googleapis.com https://vitals.vercel-insights.com https://va.vercel-scripts.com https://*.sanity.io wss://*.sanity.io",
    "frame-src https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  // Forward the nonce to the layout via a request header.
  // Next.js reads x-nonce automatically and applies it to its own inline scripts.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
