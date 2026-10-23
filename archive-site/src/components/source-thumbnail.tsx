import { clsx } from "clsx";
import {
  AudioLines,
  BookOpen,
  Clapperboard,
  FileText,
  Landmark,
  Mail,
  Mic,
  Newspaper,
  NotebookPen,
  ScrollText,
  Shapes,
  Stethoscope,
  type LucideIcon
} from "lucide-react";
import type { ArchiveSource, SourceType } from "@/lib/types";

type SourceThumbnailProps = {
  tone: ArchiveSource["imageTone"];
  title: string;
  type?: SourceType;
  className?: string;
};

const toneClasses: Record<ArchiveSource["imageTone"], string> = {
  paper: "from-[#F3E8D5] via-[#FFF9ED] to-[#C8B28D]",
  portrait: "from-[#3B332A] via-[#BFAE92] to-[#F0D6AE]",
  botanical: "from-[#EADCB9] via-[#D7C875] to-[#8F9652]",
  clinical: "from-[#E8E2DA] via-[#BFB7AA] to-[#6E655A]",
  letter: "from-[#F8F2E8] via-[#EEE0CF] to-[#BBA98E]"
};

const typeIcons: Partial<Record<SourceType, LucideIcon>> = {
  Book: BookOpen,
  "Ancient Text": ScrollText,
  Manuscript: ScrollText,
  Letter: Mail,
  "Field Notes": NotebookPen,
  "Newspaper Article": Newspaper,
  "Audio/Video": AudioLines,
  Film: Clapperboard,
  Testimony: Mic,
  "Patient Report": Stethoscope,
  "Medical Report": Stethoscope,
  "Archaeological Site": Landmark,
  "Architectural Site": Landmark,
  "Material Artifact": Shapes,
  Iconography: Shapes
};

// Stand-in for sources without a scan: a paper card marked with the source's medium.
export function SourceThumbnail({ tone, title, type, className }: SourceThumbnailProps) {
  const Icon = (type && typeIcons[type]) || FileText;

  return (
    <div
      aria-label={type ? `${type}: ${title}` : title}
      className={clsx(
        "relative overflow-hidden rounded-sm border border-archive-line bg-gradient-to-br shadow-sm",
        toneClasses[tone],
        className
      )}
      role="img"
    >
      <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(0deg,rgba(23,20,23,.14)_1px,transparent_1px)] [background-size:100%_13px]" />
      <div className="absolute inset-0 grid place-items-center">
        <Icon aria-hidden className="h-[34%] max-h-10 w-[34%] max-w-10 text-archive-ink/45" strokeWidth={1.4} />
      </div>
    </div>
  );
}
