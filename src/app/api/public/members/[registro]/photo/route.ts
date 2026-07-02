import { readFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

async function getMemberPhotoPath(registro: string) {
  const member = await prisma.member.findFirst({
    where: {
      registrationNumber: {
        equals: registro,
        mode: "insensitive",
      },
    },
    include: {
      publicProfile: true,
      application: { include: { publicProfileDraft: true } },
    },
  });

  if (!member) return null;

  const photoPath =
    member.publicProfile?.publicPhotoUrl ??
    member.application?.publicProfileDraft?.profilePhotoPath ??
    null;

  return {
    photoPath,
    publishPhoto: member.publicProfile?.publishPhoto ?? false,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ registro: string }> }
) {
  const { registro } = await params;
  const scope = request.nextUrl.searchParams.get("scope");

  const member = await getMemberPhotoPath(registro);
  if (!member?.photoPath) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  if (scope !== "validation") {
    if (!member.publishPhoto) {
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    }
  }

  const relativePath = member.photoPath;
  if (relativePath.startsWith("http")) {
    return NextResponse.redirect(relativePath);
  }

  const segments = relativePath.split("/");
  const absolutePath = path.resolve(process.cwd(), ...segments);
  const uploadsRoot = path.resolve(process.cwd(), "uploads");
  if (!absolutePath.startsWith(uploadsRoot)) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  try {
    const buffer = await readFile(absolutePath);
    const ext = path.extname(absolutePath).toLowerCase();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
}
