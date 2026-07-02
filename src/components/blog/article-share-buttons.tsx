"use client";

import { useState } from "react";
import { Check, Copy, Facebook, Linkedin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ArticleShareButtonsProps {
  url: string;
  title: string;
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const SHARE_LINKS = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: MessageCircle,
    href: (url: string, title: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: Facebook,
    href: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: "x",
    label: "X",
    icon: XIcon,
    href: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    href: (url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
] as const;

export function ArticleShareButtons({ url, title }: ArticleShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copie o link do artigo:", url);
    }
  }

  return (
    <div className="border-t border-white/10 pt-8">
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-primary">
        Compartilhar
      </p>
      <div className="flex flex-wrap gap-3">
        {SHARE_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Button key={item.id} variant="outline" size="sm" asChild>
              <a
                href={item.href(url, title)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Compartilhar no ${item.label}`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </a>
            </Button>
          );
        })}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          aria-label="Copiar link do artigo"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span className={cn(copied && "text-green-400")}>
            {copied ? "Link copiado" : "Copiar link"}
          </span>
        </Button>
      </div>
    </div>
  );
}
