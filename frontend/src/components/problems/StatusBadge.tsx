import { cn } from "@/lib/utils";
import type { Status } from "@/types";

const styles: Record<Status, string> = {
  todo: "text-zinc-400 bg-zinc-400/10",
  attempted: "text-blue-400 bg-blue-400/10",
  solved: "text-green-400 bg-green-400/10",
  "needs-review": "text-orange-400 bg-orange-400/10",
};

const labels: Record<Status, string> = {
  todo: "Todo",
  attempted: "Attempted",
  solved: "Solved",
  "needs-review": "Needs Review",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        styles[status]
      )}
    >
      {labels[status]}
    </span>
  );
}
