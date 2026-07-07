import Image from "next/image";
import { Fish } from "lucide-react";

/** Species photo with graceful fallback when no image has resolved yet. */
export function FishImage({
  src,
  alt,
  className = "",
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
}: {
  src: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!src) {
    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-tide-800 to-tide-950 flex items-center justify-center ${className}`}
      >
        <Fish className="size-10 text-tide-500/70" aria-hidden />
        <span className="sr-only">{alt}</span>
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden bg-tide-950 ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  );
}
