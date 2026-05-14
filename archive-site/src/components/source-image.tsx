import { clsx } from "clsx";
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
    <div
      className={clsx(
        "overflow-hidden rounded-sm border border-archive-line bg-archive-sand",
        className
      )}
    >
      <img
        alt={source.imageAlt ?? source.title}
        className={clsx("h-full w-full object-cover sepia-[.18]", imageClassName)}
        src={source.imagePath}
      />
    </div>
  );
}
