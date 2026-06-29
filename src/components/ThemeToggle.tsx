import { cn, useIsHydrated, useTheme, type Theme } from "@heroui/react";
import type { ReactElement } from "react";

const THEME_OPTIONS: Theme[] = ["light", "dark", "system"];

function SunIcon() {
  return (
    <svg
      aria-hidden
      className="size-full"
      fill="currentColor"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden
      className="size-full"
      fill="currentColor"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg
      aria-hidden
      className="size-full"
      fill="currentColor"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1" />
      <path d="m12 15 5 6H7Z" />
    </svg>
  );
}

const THEME_ICONS: Record<(typeof THEME_OPTIONS)[number], () => ReactElement> = {
  light: SunIcon,
  dark: MoonIcon,
  system: SystemIcon,
};

function ThemeOption({
  active,
  label,
  onSelect,
}: {
  active: boolean;
  label: Theme;
  onSelect: () => void;
}) {
  const Icon = THEME_ICONS[label];

  return (
    <button
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "size-6.5 rounded-full p-1.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-300",
        active ? "bg-accent text-accent-foreground" : "text-muted",
      )}
      type="button"
      onClick={onSelect}
    >
      <Icon />
    </button>
  );
}

export function ThemeToggle() {
  const isHydrated = useIsHydrated();
  const { theme, setTheme } = useTheme();

  if (!isHydrated) {
    return <span aria-hidden className="inline-flex h-8.5 w-[5.625rem] shrink-0 rounded-full" />;
  }

  return (
    <div
      className="inline-flex cursor-(--cursor-interactive) items-center rounded-full border border-default-200 p-1"
      data-theme-toggle=""
    >
      {THEME_OPTIONS.map((option) => (
        <ThemeOption
          key={option}
          active={theme === option}
          label={option}
          onSelect={() => setTheme(option)}
        />
      ))}
    </div>
  );
}
