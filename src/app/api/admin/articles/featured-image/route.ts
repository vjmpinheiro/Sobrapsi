import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requireStaffPermission, staffAuthErrorResponse } from "@/lib/admin-auth";
import { articleFeaturedImageUrl } from "@/lib/article-image";
import { convertImageBufferToWebp, IMAGE_UPLOAD_MIME_TYPES } from "@/lib/image-webp";

const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    await requireStaffPermission(request, "editorial");

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const articleId = (formData.get("articleId") as string | null) ?? "draft";

    if (!file) {
      return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Arquivo muito grande (máx. 5MB)" }, { status: 400 });
    }
    if (!IMAGE_UPLOAD_MIME_TYPES.includes(file.type as (typeof IMAGE_UPLOAD_MIME_TYPES)[number])) {
      return NextResponse.json({ error: "Tipo de arquivo não permitido" }, { status: 400 });
    }

    const safeFolder = articleId.replace(/[^a-zA-Z0-9_-]/g, "");
    const uploadDir = path.join(process.cwd(), "uploads", "blog", safeFolder);
    await mkdir(uploadDir, { recursive: true });

    const safeName = `featured-${Date.now()}.webp`;
    const filePath = path.join(uploadDir, safeName);
    const input = Buffer.from(await file.arrayBuffer());
    const webpBuffer = await convertImageBufferToWebp(input, { maxWidth: 1920 });
    await writeFile(filePath, webpBuffer);

    const relativePath = `uploads/blog/${safeFolder}/${safeName}`;

    return NextResponse.json({
      featuredImageUrl: relativePath,
      imageUrl: articleFeaturedImageUrl(relativePath),
    });
  } catch (error) {
    return staffAuthErrorResponse(error);
  }
}
