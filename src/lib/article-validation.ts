import { z } from "zod";
import { ARTICLE_CATEGORIES } from "@/lib/article-constants";

export const articleSchema = z.object({
  title: z.string().trim().min(3, "Título obrigatório (mín. 3 caracteres)"),
  slug: z.string().trim().optional(),
  excerpt: z.string().nullish(),
  body: z
    .string()
    .min(1)
    .refine((html) => html.replace(/<[^>]*>/g, "").trim().length > 0, {
      message: "Conteúdo obrigatório",
    }),
  categories: z.array(z.enum(ARTICLE_CATEGORIES)).default([]),
  featuredImageUrl: z.string().nullish(),
  status: z.enum(["draft", "published", "archived"]),
  seoTitle: z.string().nullish(),
  seoDescription: z.string().nullish(),
  seoKeywords: z.string().nullish(),
});

export function articleValidationErrorResponse(error: unknown) {
  if (error instanceof z.ZodError) {
    const message = error.issues[0]?.message ?? "Dados inválidos";
    return { status: 400 as const, body: { error: message } };
  }
  return null;
}
