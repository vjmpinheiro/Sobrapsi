import { EXPIRY_WARNING_DAYS } from "@/lib/constants";

export function daysUntilExpiry(validUntil: Date | null | undefined): number | null {
  if (!validUntil) return null;
  const diff = new Date(validUntil).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function needsRenewal(status: string, validUntil: Date | null | undefined): boolean {
  if (status === "expired" || status === "expiring") return true;
  const days = daysUntilExpiry(validUntil);
  return days !== null && days <= EXPIRY_WARNING_DAYS;
}
