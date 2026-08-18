import { X } from "lucide-react";
import type { Problem } from "@/types";
import { SolveLogForm } from "./SolveLogForm";

interface Props {
  problem: Problem | null;
  onClose: () => void;
}

export function SolveLogModal({ problem, onClose }: Props) {
  if (!problem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">{problem.title}</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{problem.pattern}</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5">
          <SolveLogForm problem={problem} onSuccess={onClose} />
        </div>
      </div>
    </div>
  );
}
