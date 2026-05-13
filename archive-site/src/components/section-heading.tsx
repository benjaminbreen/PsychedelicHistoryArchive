import Link from "next/link";

type SectionHeadingProps = {
  eyebrow?: string;
  title?: string;
  actionLabel?: string;
  actionHref?: string;
};

export function SectionHeading({ eyebrow, title, actionLabel, actionHref }: SectionHeadingProps) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="section-label text-[1.2rem]">
            {eyebrow}
          </div>
        )}
        {title && <h2 className="mt-1"><span className="display-title text-[2rem]">{title}</span></h2>}
      </div>
      {actionHref && actionLabel && (
        <Link className="focus-ring rounded-sm text-sm font-semibold text-archive-violet hover:text-archive-violetDark" href={actionHref}>
          {actionLabel} →
        </Link>
      )}
    </div>
  );
}
