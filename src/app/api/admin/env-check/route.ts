import { NextResponse } from "next/server";

// TEMPORAL — borrar después del diagnóstico
export async function GET() {
  return NextResponse.json({
    ADMIN_SECRET_set:   !!process.env.ADMIN_SECRET,
    ADMIN_PASSWORD_set: !!process.env.ADMIN_PASSWORD,
    ANTHROPIC_KEY_set:  !!process.env.ANTHROPIC_API_KEY,
    NODE_ENV:           process.env.NODE_ENV,
  });
}
