"use client";

import { Label } from "@/components/ui/label";
import { ARTICLE_CATEGORIES } from "@/lib/article-constants";

interface ArticleCategoriesPickerProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function ArticleCategoriesPicker({ value, onChange }: ArticleCategoriesPickerProps) {
  function toggleCategory(category: string) {
    if (value.includes(category)) {
      onChange(value.filter((item) => item !== category));
      return;
    }
    onChange([...value, category]);
  }

  return (
    <div className="space-y-2 md:col-span-2">
      <Label>Categorias</Label>
      <p className="text-xs text-muted">Selecione uma ou mais categorias para o artigo.</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {ARTICLE_CATEGORIES.map((category) => (
          <label
            key={category}
            className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm transition-colors ${
              value.includes(category)
                ? "border-primary bg-primary/10 text-white"
                : "border-white/10 text-muted hover:border-primary/30"
            }`}
          >
            <input
              type="checkbox"
              className="mt-0.5"
              checked={value.includes(category)}
              onChange={() => toggleCategory(category)}
            />
            <span>{category}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function ArticleCategoriesDisplay({ categories }: { categories: string[] }) {
  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <span
          key={category}
          className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300"
        >
          {category}
        </span>
      ))}
    </div>
  );
}
