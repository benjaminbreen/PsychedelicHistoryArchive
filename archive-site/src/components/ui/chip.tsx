import Link from "next/link";
import { clsx } from "clsx";

type ChipProps = {
  children: React.ReactNode;
  tone?: "neutral" | "lavender" | "olive" | "sand" | "rose" | "success" | "warning";
  href?: string;
  className?: string;
};

const tones = {
  neutral: "hover:border-archive-faint hover:bg-white hover:text-archive-ink",
  lavender: "hover:border-purple-200 hover:bg-archive-lavender2 hover:text-archive-violet",
  olive: "hover:border-[#D7D9BD] hover:bg-[#F8F8EF] hover:text-[#626735]",
  sand: "hover:border-[#E8DDC8] hover:bg-archive-sand hover:text-[#6B5530]",
  rose: "hover:border-rose-200 hover:bg-rose-50/70 hover:text-rose-800",
  success: "hover:border-green-200 hover:bg-archive-success hover:text-green-800",
  warning: "hover:border-yellow-200 hover:bg-archive-warning hover:text-yellow-900"
};

export function Chip({ children, tone = "neutral", href, className }: ChipProps) {
  const classes = clsx(
    "inline-flex min-h-7 items-center rounded-full border border-archive-line bg-[#F8F7F5] px-3 py-1 text-xs font-medium leading-none text-archive-muted",
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
