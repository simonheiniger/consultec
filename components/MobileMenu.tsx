"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { COMPANY } from "@/lib/site";

type Item = { href: string; label: string };

type Props = {
  items: Item[];
  emailHref: string;
  phoneHref: string;
};

export default function MobileMenu({ items, emailHref, phoneHref }: Props) {
  const t = useTranslations("nav");
  const tc = useTranslations("common.cta");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? t("close") : t("menu")}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[--color-line] text-[--color-ink] transition-colors hover:border-[--color-brand-red] hover:text-[--color-brand-red]"
      >
        <span className="sr-only">{open ? t("close") : t("menu")}</span>
        <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true">
          {open ? (
            <>
              <line x1="1" y1="1" x2="17" y2="11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <line x1="17" y1="1" x2="1" y2="11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </>
          ) : (
            <>
              <line x1="1" y1="1" x2="17" y2="1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <line x1="1" y1="6" x2="17" y2="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <line x1="1" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </>
          )}
        </svg>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[--color-ink] text-white"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <span className="font-[var(--font-space-grotesk)] tracking-tight text-[17px]">
              {COMPANY.name}
            </span>
            <button
              type="button"
              aria-label={t("close")}
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <nav className="px-6 py-8">
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block font-[var(--font-space-grotesk)] text-[28px] tracking-tight transition-colors hover:text-[--color-brand-red]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-10 grid gap-3">
              <a
                href={emailHref}
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-full bg-[--color-brand-red] px-6 py-3 text-[15px] font-medium"
              >
                {tc("email")}
              </a>
              <a
                href={phoneHref}
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-[15px]"
              >
                {tc("phone")}
              </a>
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
