import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Trash2, Send, Zap } from "lucide-react";
import { useWhiteboardMessages, useSendMessage, useClearWhiteboard, useAnalyzeCode } from "@/hooks/useWhiteboard";
import type { WhiteboardMessage } from "@/types";

type Mode = "hint" | "explain";

function Message({ msg }: { msg: WhiteboardMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold
          ${isUser ? "bg-indigo-600 text-white" : "bg-zinc-700 text-zinc-300"}`}
      >
        {isUser ? "U" : "AI"}
      </div>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${isUser
            ? "bg-indigo-600 text-white rounded-tr-sm"
            : "bg-zinc-800 text-zinc-200 rounded-tl-sm"}`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-pre:bg-zinc-900 prose-code:text-indigo-300 prose-code:bg-zinc-900 prose-headings:text-zinc-100">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full shrink-0 bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">
        AI
      </div>
      <div className="bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function Whiteboard({ problemId }: { problemId: number }) {
  const [mode, setMode] = useState<Mode>("hint");
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: messages = [], isLoading } = useWhiteboardMessages(problemId);
  const send = useSendMessage(problemId);
  const clear = useClearWhiteboard(problemId);
  const analyze = useAnalyzeCode(problemId);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, send.isPending]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || send.isPending) return;
    send.mutate({ content: trimmed, mode });
    setInput("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isEmpty = messages.length === 0 && !isLoading;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-1">
          {(["hint", "explain"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors capitalize
                ${mode === m ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => analyze.mutate()}
            disabled={analyze.isPending}
            title="Analyze my code"
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white hover:border-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Zap size={12} />
            {analyze.isPending ? "Analyzing…" : "Analyze code"}
          </button>
          {messages.length > 0 && (
            <button
              onClick={() => clear.mutate()}
              disabled={clear.isPending}
              className="text-zinc-600 hover:text-zinc-400 transition-colors"
              title="Clear conversation"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {isEmpty && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3 pb-16">
            <div className="text-3xl">💬</div>
            <p className="text-sm text-zinc-400 font-medium">Ask your coach anything</p>
            <div className="text-xs text-zinc-600 space-y-1 max-w-xs">
              <p><span className="text-indigo-400 font-medium">Hint mode</span> — Socratic nudges, no giveaways</p>
              <p><span className="text-indigo-400 font-medium">Explain mode</span> — full breakdown of your code's gaps</p>
            </div>
            <div className="mt-2 space-y-1.5 w-full max-w-sm">
              {[
                "Why is my current approach wrong?",
                "What data structure should I use here?",
                "Walk me through the optimal solution",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="w-full text-left text-xs px-3 py-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <Message key={msg.id} msg={msg} />
        ))}

        {send.isPending && <TypingIndicator />}

        {send.isError && (
          <p className="text-xs text-red-400 text-center">
            {(send.error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Something went wrong. Is the API key set?"}
          </p>
        )}

        {analyze.isError && (
          <p className="text-xs text-red-400 text-center">
            {(analyze.error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Analysis failed."}
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 shrink-0">
        <div className="flex items-end gap-2 bg-zinc-800 rounded-xl border border-zinc-700 px-3 py-2 focus-within:border-indigo-500 transition-colors">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask something… (Enter to send, Shift+Enter for newline)"
            className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none max-h-32 leading-relaxed"
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || send.isPending}
            className="mb-0.5 text-indigo-400 hover:text-indigo-300 disabled:text-zinc-700 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
