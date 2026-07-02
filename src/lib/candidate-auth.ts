import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { normalizeCpf } from "@/lib/application-shared";

const COOKIE_NAME = "sobrapsi_candidate";

export interface CandidateSessionPayload {
  applicationId?: string;
  pendingCpf?: string;
  pendingCategory?: string;
}

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET não configurado");
  return new TextEncoder().encode(secret);
}

export async function createPendingCandidateSession(
  cpf: string,
  extras?: { category?: string }
) {
  const token = await new SignJWT({
    pendingCpf: normalizeCpf(cpf),
    ...(extras?.category ? { pendingCategory: extras.category } : {}),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function updatePendingCandidateCategory(category: string) {
  const session = await getCandidateSession();
  if (!session?.pendingCpf) return;
  await createPendingCandidateSession(session.pendingCpf, { category });
}

export async function createCandidateSession(applicationId: string) {
  const token = await new SignJWT({ applicationId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroyCandidateSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCandidateSession(): Promise<CandidateSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as CandidateSessionPayload;
  } catch {
    return null;
  }
}
