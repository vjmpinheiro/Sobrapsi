import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";

const PUBLIC_APP_PATHS = [
  "/app/login",
  "/app/registro",
  "/app/ativar-conta",
  "/app/alterar-senha",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_APP_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/app")) {
    const token = request.cookies.get("sobrapsi_session")?.value;
    if (!token) {
      const loginUrl = new URL("/app/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = await verifySessionToken(token);
    if (!session) {
      const loginUrl = new URL("/app/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.mustChangePassword && pathname !== "/app/alterar-senha") {
      return NextResponse.redirect(new URL("/app/alterar-senha", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
