import { cn } from "@/lib/utils";
import type { Difficulty } from "@/types";

const styles: Record<Difficulty, string> = {
  easy: "text-green-400 bg-green-400/10",
  medium: "text-amber-400 bg-amber-400/10",
  hard: "text-red-400 bg-red-400/10",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize",
        styles[difficulty]
      )}
    >
      {difficulty}
    </span>
  );
}
