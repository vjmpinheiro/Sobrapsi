import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PageHero, Section } from "@/components/layout/sections";
import { ARTICLE_CATEGORIES } from "@/lib/article-constants";
import { articleFeaturedImageUrl } from "@/lib/article-image";
import { listPublishedArticles } from "@/lib/articles";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  description: "Artigos, textos e publicações da SOBRAPSI.",
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const articles = await listPublishedArticles();

  return (
    <>
      <PageHero
        eyebrow="Publicações"
        title="Blog SOBRAPSI"
        subtitle="Artigos institucionais, textos de referência e publicações da comunidade associativa."
        backgroundText="BLOG"
      />

      <Section>
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {ARTICLE_CATEGORIES.map((category) => (
            <span
              key={category}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300"
            >
              {category}
            </span>
          ))}
        </div>

        {articles.length === 0 ? (
          <p className="text-center text-muted">
            Novos artigos serão publicados em breve na biblioteca institucional.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => {
              const imageUrl = articleFeaturedImageUrl(article.featuredImageUrl);
              return (
                <Link
                  key={article.id}
                  href={`/blog/${article.slug}`}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 transition-colors hover:border-primary/40"
                >
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt={article.title}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-zinc-900 text-sm text-muted">
                      SOBRAPSI
                    </div>
                  )}
                  <div className="p-6">
                    <div className="mb-4 flex flex-wrap gap-2">
                      {article.categories.map((category) => (
                        <Badge key={category} variant="outline">
                          {category}
                        </Badge>
                      ))}
                    </div>
                    <h2 className="text-xl font-bold text-white group-hover:text-primary">
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted">
                        {article.excerpt}
                      </p>
                    )}
                    <p className="mt-4 text-xs text-muted">
                      {formatDate(article.publishedAt ?? article.createdAt)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Section>
    </>
  );
}
