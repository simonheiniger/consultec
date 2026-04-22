import type { ReactNode } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-red] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-60 disabled:cursor-not-allowed";

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-[15px]",
  lg: "px-6 py-3.5 text-[16px]",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-[--color-brand-red] text-white hover:bg-[--color-brand-red-dark] shadow-[0_6px_24px_-10px_rgba(217,32,39,0.55)]",
  secondary:
    "bg-white text-[--color-ink] border border-[--color-line] hover:border-[--color-brand-blue] hover:text-[--color-brand-blue]",
  ghost:
    "text-[--color-ink] hover:text-[--color-brand-red]",
};

type Props = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  external?: boolean;
  ariaLabel?: string;
  className?: string;
};

export default function CTAButton({
  href,
  children,
  variant = "primary",
  size = "md",
  external,
  ariaLabel,
  className = "",
}: Props) {
  const cls = `${base} ${sizes[size]} ${variants[variant]} ${className}`.trim();

  const isAnchor =
    external ||
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#");

  if (isAnchor) {
    const rel = href.startsWith("http") ? "noopener noreferrer" : undefined;
    const target = href.startsWith("http") ? "_blank" : undefined;
    return (
      <a href={href} className={cls} aria-label={ariaLabel} rel={rel} target={target}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={cls} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
