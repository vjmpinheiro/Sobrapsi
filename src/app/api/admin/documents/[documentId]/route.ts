import { readFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

import { requireStaffPermission, staffAuthErrorResponse } from "@/lib/admin-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    await requireStaffPermission(request, "secretariat");
  } catch (error) {
    return staffAuthErrorResponse(error);
  }

  const { documentId } = await params;

  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document?.filePath) {
    return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });
  }

  try {
    const absolutePath = path.resolve(process.cwd(), document.filePath);
    const uploadsRoot = path.resolve(process.cwd(), "uploads");
    if (!absolutePath.startsWith(uploadsRoot)) {
      return NextResponse.json({ error: "Caminho inválido" }, { status: 400 });
    }

    const buffer = await readFile(absolutePath);
    const ext = path.extname(absolutePath).toLowerCase();
    const disposition =
      document.mimeType === "application/pdf" || ext === ".pdf" ? "inline" : "inline";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": document.mimeType || MIME[ext] || "application/octet-stream",
        "Content-Disposition": `${disposition}; filename="${document.fileName}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
  }
}
