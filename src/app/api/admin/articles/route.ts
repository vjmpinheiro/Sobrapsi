import { NextRequest, NextResponse } from "next/server";
import { requireStaffPermission, staffAuthErrorResponse } from "@/lib/admin-auth";
import { articleSchema, articleValidationErrorResponse } from "@/lib/article-validation";
import { createArticle, listArticlesForStaff } from "@/lib/articles";
import { Prisma } from "@prisma/client";

function resolveAuthorId(userId: string) {
  return userId === "legacy-admin" ? null : userId;
}

export async function GET(request: NextRequest) {
  try {
    await requireStaffPermission(request, "editorial");
    const articles = await listArticlesForStaff();
    return NextResponse.json({ articles });
  } catch (error) {
    return staffAuthErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireStaffPermission(request, "editorial");
    const body = await request.json();
    const data = articleSchema.parse(body);
    const article = await createArticle(resolveAuthorId(session.userId), data);
    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    const validation = articleValidationErrorResponse(error);
    if (validation) {
      return NextResponse.json(validation.body, { status: validation.status });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Já existe um artigo com este slug." }, { status: 409 });
    }
    console.error("[articles POST]", error);
    return staffAuthErrorResponse(error);
  }
}
