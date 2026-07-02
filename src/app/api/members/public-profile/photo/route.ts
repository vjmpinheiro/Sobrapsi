import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth";
import { convertImageBufferToWebp, IMAGE_UPLOAD_MIME_TYPES } from "@/lib/image-webp";
import { memberPhotoDisplayUrl } from "@/lib/member-photo";
import { prisma } from "@/lib/prisma";
import { getUserById } from "@/lib/users";

const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const user = await getUserById(session.userId);
  if (!user?.member) {
    return NextResponse.json({ error: "Associado não encontrado" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Arquivo muito grande (máx. 5MB)" }, { status: 400 });
    }

    if (!IMAGE_UPLOAD_MIME_TYPES.includes(file.type as (typeof IMAGE_UPLOAD_MIME_TYPES)[number])) {
      return NextResponse.json({ error: "Tipo de arquivo não permitido" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "uploads", session.userId);
    await mkdir(uploadDir, { recursive: true });

    const safeName = `profile-photo-${Date.now()}.webp`;
    const filePath = path.join(uploadDir, safeName);
    const input = Buffer.from(await file.arrayBuffer());
    const webpBuffer = await convertImageBufferToWebp(input, {
      maxWidth: 800,
      maxHeight: 800,
    });
    await writeFile(filePath, webpBuffer);

    const relativePath = `uploads/${session.userId}/${safeName}`;

    await prisma.publicProfile.update({
      where: { memberId: user.member.id },
      data: { publicPhotoUrl: relativePath },
    });

    return NextResponse.json({
      publicPhotoUrl: relativePath,
      photoUrl: memberPhotoDisplayUrl(relativePath),
    });
  } catch {
    return NextResponse.json({ error: "Erro no upload" }, { status: 500 });
  }
}
