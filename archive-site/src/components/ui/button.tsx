import Link from "next/link";
import { clsx } from "clsx";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost" | "subtle";

const variants: Record<Variant, string> = {
  primary:
    "border-archive-violet bg-archive-violet text-white hover:bg-archive-violetDark hover:border-archive-violetDark",
  outline:
    "border-archive-line bg-white text-archive-ink hover:border-archive-violet hover:text-archive-violet hover:bg-white",
  ghost:
    "border-transparent bg-transparent text-archive-ink hover:bg-archive-paper",
  subtle:
    "border-archive-line bg-white text-archive-ink hover:border-archive-violet hover:bg-white hover:text-archive-violet"
};

const base =
  "focus-ring inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition duration-150 ease-out";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return <button className={clsx(base, variants[variant], className)} {...props} />;
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
  variant?: Variant;
};

export function ButtonLink({
  className,
  variant = "primary",
  href,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={clsx(base, variants[variant], className)} href={href} {...props}>
      {children}
    </Link>
  );
}
