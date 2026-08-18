import { FlaskConical } from "lucide-react";

export default function DemoBanner() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 border-b border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-center text-[11px] text-amber-300">
      <FlaskConical className="h-3 w-3 shrink-0" />
      <span>
        <strong className="font-medium">Live demo — synthetic data, read-only.</strong> Problem
        list is the public NeetCode 250; solve history and coaching are invented.
      </span>
      <a
        href="https://github.com/AashishAnanth/leetcode-grind"
        className="underline underline-offset-2 hover:text-amber-200"
      >
        Source &amp; setup &rarr;
      </a>
    </div>
  );
}
