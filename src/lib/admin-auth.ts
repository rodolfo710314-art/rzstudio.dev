// Helper compartido: verificación de sesión admin en rutas API (Node runtime).

import { cookies } from "next/headers";
import { verifySessionToken, COOKIE_NAME } from "./admin-session";

export async function verifyAdmin(): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const jar   = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifySessionToken(token, secret);
}
