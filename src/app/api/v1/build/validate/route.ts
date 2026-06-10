import { NextRequest, NextResponse } from "next/server";
import { validateToken, DEFAULT_TESTING } from "@/lib/apk-store";

// GET /api/v1/build/validate?t={token}
// Called by Android StartupValidator on every launch.
// Returns: { ok, status, daysRemaining, warningActive, message }
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("t")?.trim();

  if (!token) {
    return NextResponse.json({ ok: false, message: "token requerido" }, { status: 400 });
  }

  const result = await validateToken(token);

  const warningActive =
    result.ok &&
    result.daysRemaining !== null &&
    result.daysRemaining <= DEFAULT_TESTING.warning_days_before;

  return NextResponse.json({
    ...result,
    warningActive,
    warningDaysBefore: DEFAULT_TESTING.warning_days_before,
    gracePeriodHours:  DEFAULT_TESTING.grace_period_offline_hours,
  });
}
