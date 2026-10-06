import { useState } from "react";

interface ProjectCoverImageProps {
  src?: string | null;
  alt: string;
  color?: string | null;
  className?: string;
  fallbackClassName?: string;
}

function isRenderableImageSource(value: string) {
  return value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/") || value.startsWith("data:image/");
}

export function ProjectCoverImage({
  src,
  alt,
  color,
  className = "h-12 w-12 rounded-lg object-cover",
  fallbackClassName = "h-12 w-2 rounded-full",
}: ProjectCoverImageProps) {
  const [failed, setFailed] = useState(false);
  const imageSource = typeof src === "string" && isRenderableImageSource(src.trim()) ? src.trim() : null;

  if (!imageSource || failed) {
    return <span className={fallbackClassName} style={{ backgroundColor: color || "#1abb9c" }} aria-label={`${alt} color`} />;
  }

  return <img src={imageSource} alt={alt} className={className} onError={() => setFailed(true)} />;
}
