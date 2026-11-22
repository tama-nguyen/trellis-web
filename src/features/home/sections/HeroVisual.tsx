import {
  BarChart3,
  BookOpen,
  Globe,
  GraduationCap,
  MessageSquare,
  Sparkles,
  Target,
  Trophy,
} from "@/ui/icons/lucide";
import { cn } from "@/ui/lib/cn";
import { Icon } from "@astryxdesign/core/Icon";

const HERO_ICONS = [
  {
    icon: BookOpen,
    tile: "bg-tint-amber",
    position: "-top-7 -left-7",
    rotation: "-rotate-6",
    motion: "animate-drift-right-down",
    delay: "stagger-1",
  },
  {
    icon: Sparkles,
    tile: "bg-tint-mint",
    position: "-top-7 -right-7",
    rotation: "rotate-6",
    motion: "animate-drift-left-down",
    delay: "stagger-3",
  },
  {
    icon: GraduationCap,
    tile: "bg-tint-rose",
    position: "-bottom-7 -left-7",
    rotation: "rotate-6",
    motion: "animate-drift-right-up",
    delay: "stagger-5",
  },
  {
    icon: BarChart3,
    tile: "bg-info-subtle",
    position: "-right-7 -bottom-7",
    rotation: "-rotate-6",
    motion: "animate-drift-left-up",
    delay: "stagger-7",
  },
] as const;

const HERO_STICKERS = [
  {
    icon: Globe,
    tile: "bg-tint-mint",
    position: "top-1/3 left-20",
    rotation: "-rotate-6",
    motion: "animate-drift-center",
    delay: "stagger-2",
  },
  {
    icon: MessageSquare,
    tile: "bg-surface",
    position: "bottom-1/3 left-10",
    rotation: "rotate-6",
    motion: "animate-drift-right-up",
    delay: "stagger-4",
  },
  {
    icon: Trophy,
    tile: "bg-tint-amber",
    position: "top-1/3 right-10",
    rotation: "rotate-6",
    motion: "animate-drift-left-down",
    delay: "stagger-6",
  },
  {
    icon: Target,
    tile: "bg-tint-rose",
    position: "right-20 bottom-1/3",
    rotation: "-rotate-6",
    motion: "animate-drift-left-up",
    delay: "stagger-8",
  },
] as const;

/** Learning symbols frame the headline without the visual weight of extra photos. */
export function HeroVisual() {
  return (
    <ul aria-hidden className="pointer-events-none absolute inset-0 hidden xl:block">
      {HERO_ICONS.map(({ icon, tile, position, rotation, motion, delay }) => (
        <li
          key={position}
          className={cn("absolute grid size-24 place-items-center", position, motion, delay)}
        >
          <span
            className={cn(
              "grid size-24 place-items-center rounded-dialog border border-border text-fg-brand",
              tile,
              rotation,
            )}
          >
            <Icon icon={icon} size="lg" />
          </span>
        </li>
      ))}
      {HERO_STICKERS.map(({ icon, tile, position, rotation, motion, delay }) => (
        <li
          key={position}
          className={cn("absolute grid size-14 place-items-center", position, motion, delay)}
        >
          <span
            className={cn(
              "grid size-14 place-items-center rounded-full border border-border text-fg-brand",
              tile,
              rotation,
            )}
          >
            <Icon icon={icon} size="md" />
          </span>
        </li>
      ))}
    </ul>
  );
}
