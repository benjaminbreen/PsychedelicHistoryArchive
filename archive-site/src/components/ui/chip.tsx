import Link from "next/link";
import { clsx } from "clsx";

type ChipProps = {
  children: React.ReactNode;
  tone?: "neutral" | "lavender" | "olive" | "sand" | "rose" | "success" | "warning";
  href?: string;
  className?: string;
};

const tones = {
  neutral: "hover:border-archive-faint hover:bg-archive-surface hover:text-archive-ink",
  lavender: "hover:border-archive-violet/30 hover:bg-archive-lavender2 hover:text-archive-violetDark",
  olive: "hover:border-archive-olive/35 hover:bg-archive-lavender2 hover:text-archive-olive",
  sand: "hover:border-archive-sand hover:bg-archive-sand hover:text-archive-ink",
  rose: "hover:border-rose-200 hover:bg-rose-50/70 hover:text-rose-800",
  success: "hover:border-green-200 hover:bg-archive-success hover:text-green-800",
  warning: "hover:border-yellow-200 hover:bg-archive-warning hover:text-yellow-900"
};

export function Chip({ children, tone = "neutral", href, className }: ChipProps) {
  const classes = clsx(
    "inline-flex min-h-7 items-center rounded-full border border-archive-line bg-archive-lavender2 px-3 py-1 text-xs font-medium leading-none text-archive-muted",
    tones[tone],
    href && "focus-ring transition duration-150 ease-out",
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return <span className={classes}>{children}</span>;
}
