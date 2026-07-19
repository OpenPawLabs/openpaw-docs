import { useEffect, useState } from "react";
import { cn } from "@heroui/react";
import { guideImageVariantUrl } from "@openpawlabs/diy-guides-ui";

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
 * Prefers the build-generated 480w AVIF when present, falling back to the
 * canonical source on error.
 */
export function HeroImage({ src, alt, label, className }: HeroImageProps) {
  const [useCanonical, setUseCanonical] = useState(false);

  useEffect(() => {
    setUseCanonical(false);
  }, [src]);

  if (src) {
    const displaySrc =
      useCanonical || !src ? src : guideImageVariantUrl(src, 800);
    return (
      <img
        alt={alt ?? ""}
        className={cn("size-full object-cover", className)}
        src={displaySrc}
        loading="lazy"
        decoding="async"
        onError={() => {
          if (!useCanonical) {
            setUseCanonical(true);
          }
        }}
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
