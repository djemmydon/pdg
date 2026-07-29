interface LogoProps {
  variant?: "full" | "mark";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const MARK_SIZES: Record<NonNullable<LogoProps["size"]>, number> = {
  sm: 32,
  md: 40,
  lg: 56,
};

const TEXT_SIZES: Record<NonNullable<LogoProps["size"]>, string> = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
};

// Reusable "PDG" wordmark. Use variant="mark" for tight spaces (nav bars,
// favicons-adjacent contexts) and variant="full" wherever there is room to
// also show the "Private Delivery Go" tagline.
export function Logo({ variant = "full", size = "md", className = "" }: LogoProps) {
  const mark = MARK_SIZES[size];

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        width={mark}
        height={mark}
        viewBox="0 0 48 48"
        fill="none"
        role="img"
        aria-label="PDG logo"
      >
        <rect width="48" height="48" rx="12" fill="var(--color-brand-600)" />
        <text
          x="24"
          y="31"
          textAnchor="middle"
          fontFamily="var(--font-display, sans-serif)"
          fontWeight={800}
          fontSize="18"
          fill="#ffffff"
        >
          PDG
        </text>
      </svg>
      {variant === "full" && (
        <span className="flex flex-col leading-tight">
          <span className={`font-display font-extrabold text-foreground ${TEXT_SIZES[size]}`}>
            PDG
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            Private Delivery Go
          </span>
        </span>
      )}
    </span>
  );
}
