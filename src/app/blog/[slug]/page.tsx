import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleShareButtons } from "@/components/blog/article-share-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHero, Section } from "@/components/layout/sections";
import { articleFeaturedImageUrl } from "@/lib/article-image";
import { getPublishedArticleBySlug } from "@/lib/articles";
import { formatDate } from "@/lib/utils";

function articlePublicUrl(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sobrapsi.org.br";
  return `${baseUrl.replace(/\/$/, "")}/blog/${slug}`;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  const keywords = article?.seoKeywords
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    title: article?.seoTitle ?? article?.title ?? "Artigo",
    description: article?.seoDescription ?? article?.excerpt ?? undefined,
    keywords: keywords?.length ? keywords : undefined,
  };
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const authorName = article.author?.person?.fullName ?? "SOBRAPSI";
  const imageUrl = articleFeaturedImageUrl(article.featuredImageUrl);
  const primaryCategory = article.categories[0] ?? "Blog";

  return (
    <>
      <PageHero
        eyebrow={primaryCategory}
        title={article.title}
        subtitle={
          article.excerpt ??
          `Publicado em ${formatDate(article.publishedAt ?? article.createdAt)}`
        }
      />

      <Section>
        <div className="space-y-8">
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={article.title}
              className="w-full rounded-2xl border border-white/10 object-cover"
            />
          )}

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
            {article.categories.map((category) => (
              <Badge key={category} variant="outline">
                {category}
              </Badge>
            ))}
            <span>{formatDate(article.publishedAt ?? article.createdAt)}</span>
            <span>Por {authorName}</span>
          </div>

          <article
            className="article-content leading-relaxed text-muted"
            dangerouslySetInnerHTML={{ __html: article.body }}
          />

          <ArticleShareButtons url={articlePublicUrl(slug)} title={article.title} />

          <Button variant="outline" asChild>
            <Link href="/blog">Voltar ao blog</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
