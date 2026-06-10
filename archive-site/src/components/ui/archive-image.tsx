import { clsx } from "clsx";
import type { ImgHTMLAttributes } from "react";

type ArchiveImageProps = {
  alt: string;
  className?: string;
  imageClassName?: string;
  loading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  src: string;
};

export function ArchiveImage({
  alt,
  className,
  imageClassName,
  loading = "lazy",
  src,
}: ArchiveImageProps) {
  return (
    <div className={clsx("relative overflow-hidden bg-archive-sand", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={alt}
        className={clsx("h-full w-full object-cover", imageClassName)}
        decoding="async"
        loading={loading}
        src={src}
      />
    </div>
  );
}
