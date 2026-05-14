import { clsx } from "clsx";
import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  className?: string;
  width?: "standard" | "narrow" | "wide";
};

const widths = {
  standard: "max-w-[1180px]",
  narrow: "max-w-[820px]",
  wide: "max-w-[1440px]"
};

export function PageShell({ children, className, width = "standard" }: PageShellProps) {
  return (
    <main className={clsx("mx-auto w-full px-4 py-8 sm:px-6 lg:px-10", widths[width], className)}>
      {children}
    </main>
  );
}
