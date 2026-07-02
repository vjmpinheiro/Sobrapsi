import { cn } from "@/lib/utils";

interface MemberAvatarProps {
  photoUrl?: string | null;
  name: string;
  variant?: "validation" | "profile";
  className?: string;
}

export function MemberAvatar({
  photoUrl,
  name,
  variant = "profile",
  className,
}: MemberAvatarProps) {
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={`Foto de ${name}`}
        className={cn(
          "shrink-0 object-cover",
          variant === "validation"
            ? "h-32 w-32 rounded-full border-2 border-primary/40"
            : "h-40 w-40 rounded-full border-2 border-primary/40",
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center bg-primary font-bold text-white",
        variant === "validation"
          ? "h-32 w-32 rounded-full border-2 border-primary/40 text-3xl"
          : "h-40 w-40 rounded-full text-4xl",
        className
      )}
      aria-hidden
    >
      SB
    </div>
  );
}
