import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, verifySessionToken } from "@/lib/admin-session";

export async function proxy(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    // No secret configured — block access entirely
    return new NextResponse("admin no configurado", { status: 503 });
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const valid = token ? await verifySessionToken(token, secret) : false;

  if (!valid) {
    // Redirect to login page, preserving the intended destination
    const loginUrl = new URL("/admin", req.url);
    loginUrl.searchParams.set("redirect", req.nextUrl.pathname);
    const response = NextResponse.redirect(loginUrl);
    // Clear stale cookie if present
    if (token) response.cookies.delete(COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  // Protect all /admin routes EXCEPT the page itself (which handles the login form)
  // and the login API endpoint
  matcher: ["/admin/dashboard/:path*"],
};
