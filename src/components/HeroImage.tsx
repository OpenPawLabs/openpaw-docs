import { cn } from "@heroui/react";

interface HeroImageProps {
  src?: string;
  alt?: string;
  /** Used to derive the placeholder initial when no image is set. */
  label: string;
  className?: string;
}

/**
 * Fills its (aspect-ratio) container with the hero image, or a branded gradient
 * placeholder bearing the guide's initial when no `heroImage` was authored.
 */
export function HeroImage({ src, alt, label, className }: HeroImageProps) {
  if (src) {
    return (
      <img
        alt={alt ?? ""}
        className={cn("size-full object-cover", className)}
        src={src}
      />
    );
  }

  const initial = label.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      aria-hidden
      className={cn(
        "flex size-full items-center justify-center bg-gradient-to-br from-primary-100 via-primary-50 to-accent-100",
        className,
      )}
    >
      <span className="text-5xl font-black tracking-tight text-primary-300 select-none">
        {initial}
      </span>
    </div>
  );
}
