import { BRAND } from "@/lib/config/brand.js";

const SIZE = {
  sm: { box: "h-7 w-7 text-[10px]", name: "text-base" },
  md: { box: "h-8 w-8 text-xs", name: "text-lg" },
  lg: { box: "h-12 w-12 text-sm", name: "text-2xl" },
};

export function BrandLogo({ size = "md", showName = true, className = "" }) {
  const s = SIZE[size] ?? SIZE.md;

  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <span
        className={`brand-mark flex shrink-0 items-center justify-center rounded-lg font-bold tracking-tight text-white ${s.box}`}
        aria-hidden="true"
      >
        {BRAND.monogram}
      </span>
      {showName ? (
        <span className={`font-serif font-semibold tracking-tight ${s.name}`}>
          {BRAND.shortName}
          <span className="text-[hsl(var(--accent))]"> Atlas</span>
        </span>
      ) : null}
    </span>
  );
}

export default BrandLogo;
