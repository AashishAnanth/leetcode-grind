import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles } from "lucide-react";
import { useVaultEntries, useVaultEntry, useUpdateVaultEntry, useVaultLinkedProblems, useDraftVaultEntry } from "@/hooks/useVault";
import { DifficultyBadge } from "@/components/problems/DifficultyBadge";
import { StatusBadge } from "@/components/problems/StatusBadge";
import type { Difficulty, Status } from "@/types";

const DEFAULT_CONTENT: Record<string, string> = {
  "Arrays & Hashing": `# Arrays & Hashing\n\n## Core idea\nUse a hash map to trade space for O(1) lookups.\n\n## Common patterns\n- **Frequency count**: count occurrences, compare maps\n- **Two-sum style**: store complement → check map\n- **Prefix sum**: cumulative sum array for range queries\n\n## Gotchas\n- Remember to handle empty arrays\n- When using index as hash (e.g. First Missing Positive), watch out for negatives\n`,
};

function PatternList({
  patterns,
  selected,
  onSelect,
}: {
  patterns: string[];
  selected: string | null;
  onSelect: (p: string) => void;
}) {
  return (
    <nav className="w-56 shrink-0 border-r border-zinc-700 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Patterns</h2>
        <ul className="space-y-0.5">
          {patterns.map((p) => (
            <li key={p}>
              <button
                onClick={() => onSelect(p)}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors
                  ${selected === p
                    ? "bg-indigo-600 text-white font-medium"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"}`}
              >
                {p}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

function Editor({ pattern }: { pattern: string }) {
  const { data: entry, isLoading } = useVaultEntry(pattern);
  const { data: linkedProblems = [] } = useVaultLinkedProblems(pattern);
  const update = useUpdateVaultEntry();
  const draftMutation = useDraftVaultEntry();
  const [draft, setDraft] = useState<string>("");
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    if (entry) {
      const content = entry.content || DEFAULT_CONTENT[pattern] || `# ${pattern}\n\nStart writing your notes here…\n`;
      setDraft(content);
      setSaved(true);
    }
  }, [entry, pattern]);

  const handleChange = (val: string) => {
    setDraft(val);
    setSaved(false);
  };

  const handleSave = async () => {
    await update.mutateAsync({ pattern, content: draft });
    setSaved(true);
  };

  const handleDraft = async () => {
    const result = await draftMutation.mutateAsync(pattern);
    setDraft(result.content);
    setSaved(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      handleSave();
    }
    // Tab inserts spaces instead of leaving the field
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = draft.substring(0, start) + "  " + draft.substring(end);
      setDraft(newVal);
      setSaved(false);
      // restore cursor
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  };

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">Loading…</div>;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-700 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold text-zinc-100">{pattern}</h1>
          {!saved && <span className="text-xs text-zinc-500">Unsaved</span>}
          {saved && update.isSuccess && <span className="text-xs text-green-500">Saved</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDraft}
            disabled={draftMutation.isPending}
            title="Let AI draft notes for this pattern"
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Sparkles size={12} />
            {draftMutation.isPending ? "Drafting…" : "Draft with AI"}
          </button>
          <button
            onClick={() => setPreview((v) => !v)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors
              ${preview
                ? "bg-zinc-700 border-zinc-600 text-zinc-200"
                : "border-zinc-700 text-zinc-400 hover:text-zinc-200"}`}
          >
            {preview ? "Edit" : "Preview"}
          </button>
          <button
            onClick={handleSave}
            disabled={saved || update.isPending}
            className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
          >
            {update.isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {preview ? (
          <div className="h-full overflow-y-auto px-8 py-6 prose prose-invert prose-zinc max-w-none prose-headings:text-zinc-100 prose-p:text-zinc-300 prose-code:text-indigo-300 prose-code:bg-zinc-800 prose-pre:bg-zinc-800">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{draft}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            value={draft}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            className="w-full h-full bg-zinc-900 text-zinc-200 text-sm font-mono px-8 py-6 resize-none focus:outline-none leading-relaxed"
            placeholder={`# ${pattern}\n\nStart writing your notes…`}
          />
        )}
      </div>

      {/* Linked problems */}
      {linkedProblems.length > 0 && (
        <div className="shrink-0 border-t border-zinc-700 px-6 py-4">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Problems solved in this pattern
          </h2>
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
            {linkedProblems.map((p) => (
              <Link
                key={p.id}
                to={`/problems/${p.id}`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors group"
              >
                <span className="text-xs text-zinc-600 w-5 shrink-0">{p.neetcode_order}</span>
                <span className="text-sm text-zinc-300 group-hover:text-white flex-1">{p.title}</span>
                <DifficultyBadge difficulty={p.difficulty as Difficulty} />
                <StatusBadge status={p.status as Status} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Vault() {
  const { data: entries } = useVaultEntries();
  const [selected, setSelected] = useState<string | null>(null);

  const patterns = entries?.map((e) => e.pattern) ?? [];

  // Auto-select first on load
  useEffect(() => {
    if (patterns.length > 0 && !selected) {
      setSelected(patterns[0]);
    }
  }, [patterns.length]);

  return (
    <div className="flex h-full">
      <PatternList
        patterns={patterns}
        selected={selected}
        onSelect={setSelected}
      />
      {selected ? (
        <Editor pattern={selected} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm">
          Select a pattern to view your notes
        </div>
      )}
    </div>
  );
}
