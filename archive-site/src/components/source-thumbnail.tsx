import { clsx } from "clsx";
import type { ArchiveSource } from "@/lib/types";

type SourceThumbnailProps = {
  tone: ArchiveSource["imageTone"];
  title: string;
  className?: string;
};

const toneClasses: Record<ArchiveSource["imageTone"], string> = {
  paper: "from-[#F3E8D5] via-[#FFF9ED] to-[#C8B28D]",
  portrait: "from-[#3B332A] via-[#BFAE92] to-[#F0D6AE]",
  botanical: "from-[#EADCB9] via-[#D7C875] to-[#8F9652]",
  clinical: "from-[#E8E2DA] via-[#BFB7AA] to-[#6E655A]",
  letter: "from-[#F8F2E8] via-[#EEE0CF] to-[#BBA98E]"
};

export function SourceThumbnail({ tone, title, className }: SourceThumbnailProps) {
  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div
      aria-label={`Thumbnail for ${title}`}
      className={clsx(
        "relative overflow-hidden rounded-sm border border-black/10 bg-gradient-to-br shadow-sm",
        toneClasses[tone],
        className
      )}
      role="img"
    >
      <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(0deg,rgba(23,20,23,.14)_1px,transparent_1px)] [background-size:100%_13px]" />
      <div className="absolute left-[18%] top-[14%] h-[72%] w-[64%] rounded-[2px] border border-black/15 bg-white/45" />
      <div className="absolute inset-x-0 top-[34%] text-center font-display text-[clamp(1.1rem,4vw,2.8rem)] font-semibold tracking-normal text-black/55">
        {initials}
      </div>
    </div>
  );
}
