export function articleFeaturedImageUrl(featuredImageUrl: string | null | undefined): string | null {
  if (!featuredImageUrl) return null;
  if (featuredImageUrl.startsWith("http")) return featuredImageUrl;
  return `/api/public/blog/images/${featuredImageUrl.replace(/^uploads\/blog\//, "")}`;
}
