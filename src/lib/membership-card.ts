import "server-only";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABELS, SOBRAPSI_CNPJ } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function getValidationUrl(registrationNumber: string, qrToken: string) {
  return `${getAppUrl()}/validar/${registrationNumber}?token=${qrToken}`;
}

export async function getMemberCardByUserId(userId: string) {
  const member = await prisma.member.findUnique({
    where: { userId },
    include: {
      membershipCard: true,
      user: { include: { person: true } },
    },
  });

  if (!member?.membershipCard) return null;

  const validationUrl = getValidationUrl(
    member.registrationNumber,
    member.membershipCard.qrToken
  );

  const qrDataUrl = await QRCode.toDataURL(validationUrl, {
    width: 280,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });

  return {
    memberId: member.id,
    name: member.user.person?.fullName ?? "Associado",
    registrationNumber: member.registrationNumber,
    category: member.category,
    categoryLabel: CATEGORY_LABELS[member.category],
    status: member.status,
    validUntil: member.validUntil,
    issuedAt: member.membershipCard.issuedAt,
    qrToken: member.membershipCard.qrToken,
    validationUrl,
    qrDataUrl,
    pdfPath: member.membershipCard.pdfPath,
    hasPdf: !!member.membershipCard.pdfPath,
  };
}

export async function generateMembershipCardPdf(memberId: string) {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: {
      membershipCard: true,
      user: { include: { person: true } },
    },
  });

  if (!member?.membershipCard) {
    throw new Error("Carteira não encontrada");
  }

  const name = member.user.person?.fullName ?? "Associado";
  const categoryLabel = CATEGORY_LABELS[member.category];
  const validationUrl = getValidationUrl(
    member.registrationNumber,
    member.membershipCard.qrToken
  );

  const qrDataUrl = await QRCode.toDataURL(validationUrl, {
    width: 200,
    margin: 1,
  });

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [85.6, 53.98] });

  // Fundo escuro
  doc.setFillColor(24, 24, 27);
  doc.rect(0, 0, 85.6, 53.98, "F");

  // Faixa roxa
  doc.setFillColor(138, 92, 245);
  doc.rect(0, 0, 85.6, 12, "F");

  // Logo / título
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("SOBRAPSI", 4, 8);
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.text("Sociedade Brasileira de Psicanálise", 4, 11);

  // Dados do associado
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(name, 4, 20);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 200, 200);
  doc.text(`Registro: ${member.registrationNumber}`, 4, 26);
  doc.text(`Categoria: ${categoryLabel}`, 4, 31);
  doc.text(`Validade: ${formatDate(member.validUntil)}`, 4, 36);
  doc.text(`CNPJ: ${SOBRAPSI_CNPJ}`, 4, 41);

  // QR code
  doc.addImage(qrDataUrl, "PNG", 62, 16, 20, 20);

  doc.setFontSize(5);
  doc.text("Validar", 67, 39);

  const cardsDir = path.join(process.cwd(), "uploads", "cards");
  await mkdir(cardsDir, { recursive: true });

  const fileName = `${member.registrationNumber.replace(/[^a-zA-Z0-9-]/g, "_")}.pdf`;
  const relativePath = `uploads/cards/${fileName}`;
  const absolutePath = path.join(process.cwd(), relativePath);

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  await writeFile(absolutePath, pdfBuffer);

  await prisma.membershipCard.update({
    where: { id: member.membershipCard.id },
    data: { pdfPath: relativePath },
  });

  return { relativePath, absolutePath, pdfBuffer };
}

export async function ensureCardPdf(memberId: string) {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: { membershipCard: true },
  });

  if (!member?.membershipCard) return null;

  if (member.membershipCard.pdfPath) {
    const absolutePath = path.join(process.cwd(), member.membershipCard.pdfPath);
    try {
      const { readFile } = await import("fs/promises");
      const pdfBuffer = await readFile(absolutePath);
      return { pdfBuffer, relativePath: member.membershipCard.pdfPath };
    } catch {
      // regenerate if file missing
    }
  }

  return generateMembershipCardPdf(memberId);
}
