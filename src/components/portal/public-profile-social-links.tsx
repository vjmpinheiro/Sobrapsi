import { Globe, Instagram, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";

function normalizeUrl(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

interface PublicProfileSocialLinksProps {
  website?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  className?: string;
}

export function PublicProfileSocialLinks({
  website,
  linkedin,
  instagram,
  className,
}: PublicProfileSocialLinksProps) {
  const links = [
    { href: website, icon: Globe, label: "Site" },
    { href: linkedin, icon: Linkedin, label: "LinkedIn" },
    { href: instagram, icon: Instagram, label: "Instagram" },
  ].filter((link) => link.href?.trim());

  if (links.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {links.map(({ href, icon: Icon, label }) => (
        <a
          key={label}
          href={normalizeUrl(href!.trim())}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className="rounded-lg border border-white/10 p-2.5 text-muted transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
        >
          <Icon className="h-5 w-5" />
        </a>
      ))}
    </div>
  );
}
