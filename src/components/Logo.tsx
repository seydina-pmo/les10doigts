const LOGO_URL = "/logo.png";

type LogoProps = {
  className?: string;
  variant?: "full" | "mark";
  alt?: string;
};

/**
 * Official brand logo — "La Méthode des 10 Doigts".
 * - `variant="full"` — full logo with "10" + "La Méthode des Dix Doigts" text (default)
 * - `variant="mark"` — just the "10" mark for tight spaces (favicons, small nav)
 */
export function Logo({ className, variant = "full", alt = "La Méthode des 10 Doigts" }: LogoProps) {
  if (variant === "mark") {
    // Show just the "10" portion — crop the bottom text
    return (
      <span
        className={"relative inline-block overflow-hidden " + (className ?? "h-9 w-9")}
        aria-label={alt}
        role="img"
      >
        <img
          src={LOGO_URL}
          alt=""
          aria-hidden="true"
          className="absolute left-1/2 top-0 h-[200%] w-[200%] max-w-none -translate-x-1/2 object-contain"
        />
      </span>
    );
  }
  // Full logo — "10" + subtitle text visible
  return (
    <img
      src={LOGO_URL}
      alt={alt}
      className={className ?? "h-14 w-auto"}
      loading="eager"
      decoding="async"
    />
  );
}

export const logoAsset = { url: LOGO_URL };
