import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth";
import { getCandidateSession } from "@/lib/candidate-auth";
import { convertImageBufferToWebp, isImageMimeType } from "@/lib/image-webp";
import { prisma } from "@/lib/prisma";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function POST(request: NextRequest) {
  try {
    const userSession = await getSession();
    const candidateSession = await getCandidateSession();
    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const applicationId = formData.get("applicationId") as string;
    const documentType = formData.get("documentType") as string;

    if (!file || !applicationId || !documentType) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Arquivo muito grande (máx. 10MB)" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de arquivo não permitido" }, { status: 400 });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application || !["draft", "awaiting_complement"].includes(application.status)) {
      return NextResponse.json({ error: "Candidatura inválida" }, { status: 400 });
    }

    if (application.userId) {
      if (!userSession || userSession.userId !== application.userId) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
      }
    } else if (candidateSession?.applicationId !== applicationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const storageKey = application.userId ?? application.id;
    const uploadDir = path.join(process.cwd(), "uploads", storageKey);
    await mkdir(uploadDir, { recursive: true });

    const input = Buffer.from(await file.arrayBuffer());
    const isProfilePhoto = documentType === "profile_photo";
    const shouldConvertToWebp = isProfilePhoto && isImageMimeType(file.type);

    const safeName = shouldConvertToWebp
      ? `${documentType}-${Date.now()}.webp`
      : `${documentType}-${Date.now()}${path.extname(file.name) || ".bin"}`;
    const filePath = path.join(uploadDir, safeName);
    const storedBuffer = shouldConvertToWebp
      ? await convertImageBufferToWebp(input, { maxWidth: 800, maxHeight: 800 })
      : input;
    await writeFile(filePath, storedBuffer);

    const relativePath = `uploads/${storageKey}/${safeName}`;
    const storedMimeType = shouldConvertToWebp ? "image/webp" : file.type;
    const storedSize = storedBuffer.byteLength;

    if (isProfilePhoto) {
      return NextResponse.json({ document: { filePath: relativePath } });
    }

    const existing = await prisma.document.findFirst({
      where: { applicationId, documentType },
    });

    const doc = existing
      ? await prisma.document.update({
          where: { id: existing.id },
          data: {
            filePath: relativePath,
            fileName: file.name,
            mimeType: storedMimeType,
            size: storedSize,
            status: "uploaded",
          },
        })
      : await prisma.document.create({
          data: {
            ownerUserId: application.userId,
            applicationId,
            documentType,
            filePath: relativePath,
            fileName: file.name,
            mimeType: storedMimeType,
            size: storedSize,
          },
        });

    await prisma.application.update({
      where: { id: applicationId },
      data: { currentStep: Math.max(application.currentStep, 6) },
    });

    return NextResponse.json({ document: doc });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro no upload" }, { status: 500 });
  }
}
