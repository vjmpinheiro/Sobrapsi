"use client";

import { useRef, useState } from "react";
import { ArticleCategoriesPicker } from "@/components/admin/article-categories-picker";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { articleFeaturedImageUrl } from "@/lib/article-image";
import { formatDate } from "@/lib/utils";

export interface BlogArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  categories: string[];
  featuredImageUrl: string | null;
  status: "draft" | "published" | "archived";
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  publishedAt: string | null;
  updatedAt: string;
}

interface BlogManagementProps {
  articles: BlogArticleItem[];
  loading: boolean;
  actionLoading: boolean;
  onRefresh: () => void;
}

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  categories: [] as string[],
  featuredImageUrl: "" as string | null,
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  status: "draft" as "draft" | "published" | "archived",
};

export function BlogManagement({
  articles,
  loading,
  actionLoading,
  onRefresh,
}: BlogManagementProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  function startCreate() {
    setEditingId("new");
    setForm(emptyForm);
    setError("");
  }

  function startEdit(article: BlogArticleItem) {
    setEditingId(article.id);
    setForm({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt ?? "",
      body: article.body,
      categories: article.categories ?? [],
      featuredImageUrl: article.featuredImageUrl,
      seoTitle: article.seoTitle ?? "",
      seoDescription: article.seoDescription ?? "",
      seoKeywords: article.seoKeywords ?? "",
      status: article.status,
    });
    setError("");
  }

  async function handleFeaturedImageUpload(file: File) {
    setUploadingImage(true);
    setError("");

    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("articleId", editingId && editingId !== "new" ? editingId : "draft");

    const res = await fetch("/api/admin/articles/featured-image", {
      method: "POST",
      credentials: "include",
      body: uploadData,
    });
    const data = await res.json().catch(() => ({}));
    setUploadingImage(false);

    if (!res.ok) {
      setError(data.error ?? "Não foi possível enviar a imagem.");
      return;
    }

    setForm((current) => ({ ...current, featuredImageUrl: data.featuredImageUrl }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const payload = {
      title: form.title,
      slug: form.slug || undefined,
      excerpt: form.excerpt || null,
      body: form.body,
      categories: form.categories,
      featuredImageUrl: form.featuredImageUrl || null,
      seoTitle: form.seoTitle || null,
      seoDescription: form.seoDescription || null,
      seoKeywords: form.seoKeywords || null,
      status: form.status,
    };

    const res = await fetch(
      editingId === "new" ? "/api/admin/articles" : `/api/admin/articles/${editingId}`,
      {
        method: editingId === "new" ? "POST" : "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? "Não foi possível salvar o artigo.");
      return;
    }

    setEditingId(null);
    setForm(emptyForm);
    onRefresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este artigo?")) return;
    const res = await fetch(`/api/admin/articles/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) onRefresh();
  }

  const previewImageUrl = articleFeaturedImageUrl(form.featuredImageUrl);

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button onClick={startCreate}>Novo artigo</Button>
      </div>

      {editingId && (
        <Card className="border-white/10 bg-zinc-900/50">
          <CardHeader>
            <CardTitle>{editingId === "new" ? "Novo artigo" : "Editar artigo"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="article-title">Título</Label>
                  <Input
                    id="article-title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="article-slug">Slug (opcional)</Label>
                  <Input
                    id="article-slug"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="titulo-do-artigo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="article-status">Status</Label>
                  <select
                    id="article-status"
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as "draft" | "published" | "archived",
                      })
                    }
                    className="flex h-11 w-full rounded-lg border border-border bg-zinc-900 px-4 text-sm text-white"
                  >
                    <option value="draft">Rascunho</option>
                    <option value="published">Publicado</option>
                    <option value="archived">Arquivado</option>
                  </select>
                </div>

                <ArticleCategoriesPicker
                  value={form.categories}
                  onChange={(categories) => setForm({ ...form, categories })}
                />

                <div className="space-y-2 md:col-span-2">
                  <Label>Imagem de destaque</Label>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    {previewImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewImageUrl}
                        alt="Prévia da imagem de destaque"
                        className="h-40 w-full max-w-xs rounded-xl border border-white/10 object-cover"
                      />
                    ) : (
                      <div className="flex h-40 w-full max-w-xs items-center justify-center rounded-xl border border-dashed border-white/20 text-sm text-muted">
                        Sem imagem
                      </div>
                    )}
                    <div className="space-y-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleFeaturedImageUpload(file);
                          e.target.value = "";
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {uploadingImage ? "Enviando..." : "Enviar imagem"}
                      </Button>
                      {form.featuredImageUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setForm({ ...form, featuredImageUrl: null })}
                        >
                          Remover imagem
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="article-excerpt">Resumo</Label>
                  <Textarea
                    id="article-excerpt"
                    value={form.excerpt}
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Conteúdo</Label>
                  <RichTextEditor
                    value={form.body}
                    onChange={(body) => setForm({ ...form, body })}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-white/10 p-4">
                <p className="mb-4 text-sm font-medium text-white">SEO</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="article-seo-title">Título SEO</Label>
                    <Input
                      id="article-seo-title"
                      value={form.seoTitle}
                      onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                      placeholder="Título exibido nos buscadores"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="article-seo-description">Descrição SEO</Label>
                    <Textarea
                      id="article-seo-description"
                      value={form.seoDescription}
                      onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                      rows={3}
                      placeholder="Resumo para Google e redes sociais"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="article-seo-keywords">Palavras-chave</Label>
                    <Input
                      id="article-seo-keywords"
                      value={form.seoKeywords}
                      onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })}
                      placeholder="psicanálise, formação, ética (separadas por vírgula)"
                    />
                  </div>
                </div>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={actionLoading || uploadingImage}>
                  Salvar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-white/10 bg-zinc-900/50">
        <CardHeader>
          <CardTitle>Artigos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted">Carregando...</p>
          ) : articles.length === 0 ? (
            <p className="text-muted">Nenhum artigo cadastrado.</p>
          ) : (
            <div className="space-y-3">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="flex flex-col gap-3 rounded-lg border border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-white">{article.title}</p>
                    <p className="text-sm text-muted">/blog/{article.slug}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant={article.status === "published" ? "success" : "outline"}>
                        {article.status === "published"
                          ? "Publicado"
                          : article.status === "draft"
                            ? "Rascunho"
                            : "Arquivado"}
                      </Badge>
                      {article.categories.map((category) => (
                        <Badge key={category} variant="outline">
                          {category}
                        </Badge>
                      ))}
                      {article.publishedAt && (
                        <span className="text-xs text-muted">
                          {formatDate(article.publishedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(article)}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actionLoading}
                      onClick={() => handleDelete(article.id)}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
