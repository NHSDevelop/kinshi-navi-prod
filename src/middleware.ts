import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith("/help") || 
    pathname.startsWith("/store") || 
    pathname.startsWith("/pdf-documents") || 
    pathname === "/store-list" || 
    pathname.startsWith("/system-info") || 
    pathname === "/vote/result"
  ) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400'
    )
  }

  if (
    pathname === "/" || 
    pathname === "/attraction/wating-status" || 
    pathname === "/food/stock-status"
  ) {
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=5, stale-while-revalidate=10'
    )
  } 

  return response
}

export const config = {
  matcher: [
    "/",
    "/help/:path*",
    "/store/:path*",
    "/pdf-documents/:path*",
    "/store-list",
    "/system-info/:path*",
    "/vote/result",
    "/attraction/wating-status",
    "/food/stock-status"
  ]
};