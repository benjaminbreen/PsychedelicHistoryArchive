import { clsx } from "clsx";
import { ArchiveImage } from "@/components/ui/archive-image";
import { SourceThumbnail } from "@/components/source-thumbnail";
import type { ArchiveSource } from "@/lib/types";

type SourceImageProps = {
  source: ArchiveSource;
  className?: string;
  imageClassName?: string;
};

export function SourceImage({ source, className, imageClassName }: SourceImageProps) {
  if (!source.imagePath) {
    return (
      <SourceThumbnail
        className={className}
        title={source.title}
        tone={source.imageTone}
      />
    );
  }

  return (
    <ArchiveImage
      alt={source.imageAlt ?? source.title}
      className={clsx("rounded-sm border border-archive-line", className)}
      imageClassName={clsx("sepia-[.18]", imageClassName)}
      src={source.imagePath}
    />
  );
}
