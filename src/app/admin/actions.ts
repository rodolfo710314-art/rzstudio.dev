"use server";

import { timingSafeEqual, createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionToken, COOKIE_NAME } from "@/lib/admin-session";

export interface LoginState {
  error?: string;
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = (formData.get("password") as string) ?? "";

  if (!password) return { error: "contraseña requerida" };

  const adminSecret  = process.env.ADMIN_SECRET;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminSecret || !adminPassword) {
    return { error: "configuración incompleta — revisa .env" };
  }

  // Timing-safe comparison
  const keyA = createHmac("sha256", "rz").update(password.trim()).digest();
  const keyB = createHmac("sha256", "rz").update(adminPassword.trim()).digest();

  if (!timingSafeEqual(keyA, keyB)) {
    await new Promise((r) => setTimeout(r, 600));
    return { error: "contraseña incorrecta" };
  }

  const token = await createSessionToken(adminSecret);
  const jar   = await cookies();

  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    path:     "/",
    maxAge:   8 * 60 * 60,
  });

  redirect("/admin/dashboard");
}

export async function logoutAction(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
  redirect("/admin");
}
