import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { UserRole } from "@prisma/client";
import { isStaffRole } from "@/lib/staff-permissions";
import {
  COOKIE_NAME,
  signSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/session";

export type { SessionPayload } from "@/lib/session";
export { verifySessionToken } from "@/lib/session";

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET não configurado");
  return new TextEncoder().encode(secret);
}

export async function createSession(payload: SessionPayload) {
  const token = await signSessionToken(payload);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export function isAdminRole(role: UserRole) {
  return role === "admin" || role === "superadmin";
}

export function isBackofficeRole(role: UserRole) {
  return isStaffRole(role);
}

export interface ActivationTokenPayload {
  userId: string;
  email: string;
  purpose: "activation";
}

export async function createActivationToken(userId: string, email: string) {
  return new SignJWT({ userId, email, purpose: "activation" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyActivationToken(
  token: string
): Promise<ActivationTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const data = payload as unknown as ActivationTokenPayload;
    if (data.purpose !== "activation") return null;
    return data;
  } catch {
    return null;
  }
}
