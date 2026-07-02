import { NextRequest, NextResponse } from "next/server";
import { requireStaffPermission, staffAuthErrorResponse } from "@/lib/admin-auth";
import { articleSchema, articleValidationErrorResponse } from "@/lib/article-validation";
import { deleteArticle, updateArticle } from "@/lib/articles";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireStaffPermission(request, "editorial");
    const { id } = await params;
    const article = await prisma.article.findUnique({
      where: { id },
      include: { author: { include: { person: true } } },
    });
    if (!article) {
      return NextResponse.json({ error: "Artigo não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ article });
  } catch (error) {
    return staffAuthErrorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireStaffPermission(request, "editorial");
    const { id } = await params;
    const body = await request.json();
    const data = articleSchema.parse(body);
    const article = await updateArticle(id, data);
    if (!article) {
      return NextResponse.json({ error: "Artigo não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ article });
  } catch (error) {
    const validation = articleValidationErrorResponse(error);
    if (validation) {
      return NextResponse.json(validation.body, { status: validation.status });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Já existe um artigo com este slug." }, { status: 409 });
    }
    console.error("[articles PATCH]", error);
    return staffAuthErrorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireStaffPermission(request, "editorial");
    const { id } = await params;
    await deleteArticle(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return staffAuthErrorResponse(error);
  }
}
