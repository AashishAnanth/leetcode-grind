import { Link } from "react-router-dom";
import { useState } from "react";
import {
  useScheduleConfig,
  useScheduleStats,
  useTodayQueue,
  useUpdateScheduleConfig,
  useResetTodayQueue,
} from "@/hooks/useSchedule";
import { DifficultyBadge } from "@/components/problems/DifficultyBadge";
import { StatusBadge } from "@/components/problems/StatusBadge";
import { SolveLogModal } from "@/components/solve-log/SolveLogModal";
import type { QueueProblem, ScheduleConfig } from "@/types";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function WeekStrip({ activity }: { activity: Record<string, number> }) {
  const today = new Date();
  const dow = today.getDay();
  const diffToMon = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMon);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    return {
      key,
      label: DAY_LABELS[i],
      count: activity[key] ?? 0,
      isToday: key === today.toISOString().slice(0, 10),
    };
  });

  return (
    <div className="flex gap-2">
      {days.map((d) => (
        <div key={d.key} className="flex flex-col items-center gap-1 flex-1">
          <span className={`text-xs font-medium ${d.isToday ? "text-indigo-400" : "text-zinc-500"}`}>
            {d.label}
          </span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border
            ${d.isToday ? "border-indigo-500" : "border-zinc-700"}
            ${d.count > 0 ? "bg-indigo-900/60 text-indigo-300" : "bg-zinc-800 text-zinc-600"}`}>
            {d.count > 0 ? d.count : "·"}
          </div>
        </div>
      ))}
    </div>
  );
}

function QueueRow({ p, dim, onLog }: { p: QueueProblem; dim?: boolean; onLog?: (p: QueueProblem) => void }) {
  return (
    <div className={`flex items-center gap-3 rounded-lg px-4 py-2.5 transition-colors
      ${dim ? "opacity-50" : "bg-zinc-700/50"}`}>
      <span className="text-xs text-zinc-500 w-6 shrink-0">{p.neetcode_order}</span>
      <Link
        to={`/problems/${p.id}`}
        className={`text-sm flex-1 hover:underline underline-offset-2
          ${dim ? "line-through text-zinc-500" : "text-zinc-200 hover:text-white"}`}
      >
        {p.title}
      </Link>
      <DifficultyBadge difficulty={p.difficulty} />
      {!dim && <StatusBadge status={p.status} />}
      {dim && <span className="text-xs text-green-500 font-medium">Done</span>}
      {!dim && onLog && (
        <button
          onClick={() => onLog(p)}
          className="text-xs px-2.5 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:border-indigo-500 transition-colors shrink-0"
        >
          + Log
        </button>
      )}
    </div>
  );
}

function ConfigPanel({ config }: { config: ScheduleConfig }) {
  const update = useUpdateScheduleConfig();
  const reset = useResetTodayQueue();
  const [form, setForm] = useState({
    problems_per_week: config.problems_per_week,
    easy_pct: config.easy_pct,
    medium_pct: config.medium_pct,
    hard_pct: config.hard_pct,
    active_days: config.active_days,
  });

  const toggleDay = (day: string) => {
    const next = form.active_days.includes(day)
      ? form.active_days.filter((d) => d !== day)
      : [...form.active_days, day];
    setForm((f) => ({ ...f, active_days: next }));
  };

  const pctSum = form.easy_pct + form.medium_pct + form.hard_pct;

  const handleSave = async () => {
    await update.mutateAsync(form);
    // Reset today's queue so the new config takes effect immediately
    reset.mutate();
  };

  return (
    <div className="bg-zinc-800 rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-zinc-200">Schedule Settings</h3>

      <label className="block">
        <span className="text-xs text-zinc-400">Problems / week</span>
        <input
          type="number"
          min={1}
          max={50}
          value={form.problems_per_week}
          onChange={(e) => setForm((f) => ({ ...f, problems_per_week: +e.target.value }))}
          className="mt-1 w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </label>

      <div>
        <span className="text-xs text-zinc-400">Active days</span>
        <div className="flex gap-1.5 mt-1.5">
          {DAYS.map((d, i) => (
            <button
              key={d}
              onClick={() => toggleDay(d)}
              className={`w-8 h-8 rounded-lg text-xs font-bold border transition-colors
                ${form.active_days.includes(d)
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "bg-zinc-700 border-zinc-600 text-zinc-400 hover:border-zinc-500"}`}
            >
              {DAY_LABELS[i]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="text-xs text-zinc-400">Difficulty mix (must = 100)</span>
        <div className="grid grid-cols-3 gap-2 mt-1.5">
          {(["easy", "medium", "hard"] as const).map((diff) => (
            <label key={diff} className="block">
              <span className="text-xs text-zinc-500 capitalize">{diff} %</span>
              <input
                type="number"
                min={0}
                max={100}
                value={form[`${diff}_pct`]}
                onChange={(e) => setForm((f) => ({ ...f, [`${diff}_pct`]: +e.target.value }))}
                className="mt-0.5 w-full bg-zinc-700 border border-zinc-600 rounded-lg px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </label>
          ))}
        </div>
        {pctSum !== 100 && (
          <p className="text-xs text-red-400 mt-1">Must sum to 100 (currently {pctSum})</p>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={pctSum !== 100 || update.isPending || reset.isPending}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors"
      >
        {update.isPending || reset.isPending ? "Saving…" : "Save & Reset Queue"}
      </button>
    </div>
  );
}

export function Dashboard() {
  const { data: queue, isLoading } = useTodayQueue();
  const { data: stats } = useScheduleStats();
  const { data: config } = useScheduleConfig();
  const [logTarget, setLogTarget] = useState<QueueProblem | null>(null);

  const pending = (queue?.reviews.length ?? 0) + (queue?.new_problems.length ?? 0);
  const done = queue?.completed.length ?? 0;
  const total = pending + done;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        {stats && (
          <div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-5 py-3">
            <span className="text-2xl font-bold text-indigo-400">{stats.streak}</span>
            <div>
              <p className="text-xs text-zinc-400 leading-none">day</p>
              <p className="text-xs text-zinc-400 leading-none">streak</p>
            </div>
            <span className="text-xl ml-1">🔥</span>
          </div>
        )}
      </div>

      {/* Week strip */}
      {stats && (
        <div className="bg-zinc-800 rounded-xl p-5">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">This Week</h2>
          <WeekStrip activity={stats.activity} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's queue */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-zinc-200">Today's Queue</h2>
              {queue && (
                <div className="flex items-center gap-2">
                  {total > 0 && (
                    <span className="text-xs text-zinc-400">{done}/{total} done</span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${queue.is_active_day ? "bg-indigo-900 text-indigo-300" : "bg-zinc-700 text-zinc-400"}`}>
                    {queue.is_active_day ? `${queue.daily_target} target` : "Rest day"}
                  </span>
                </div>
              )}
            </div>

            {isLoading && <p className="text-sm text-zinc-500">Loading…</p>}

            {queue?.reviews.length ? (
              <div className="mb-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Reviews Due</p>
                <div className="space-y-1.5">
                  {queue.reviews.map((p) => <QueueRow key={p.id} p={p} onLog={setLogTarget} />)}
                </div>
              </div>
            ) : null}

            {queue?.new_problems.length ? (
              <div className="mb-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">New Problems</p>
                <div className="space-y-1.5">
                  {queue.new_problems.map((p) => <QueueRow key={p.id} p={p} onLog={setLogTarget} />)}
                </div>
              </div>
            ) : null}

            {queue?.completed.length ? (
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Completed</p>
                <div className="space-y-1.5">
                  {queue.completed.map((p) => <QueueRow key={p.id} p={p} dim />)}
                </div>
              </div>
            ) : null}

            {queue && total === 0 && !isLoading && (
              <p className="text-sm text-zinc-500">
                {queue.is_active_day ? "No problems queued — check your schedule settings." : "Rest day. No reviews due either!"}
              </p>
            )}

            {queue && total > 0 && done === total && (
              <p className="text-sm text-green-500 font-medium mt-3">All done for today!</p>
            )}
          </div>
        </div>

        {/* Config */}
        <div>
          {config && <ConfigPanel config={config} />}
        </div>
      </div>

      <SolveLogModal
        problem={logTarget}
        onClose={() => setLogTarget(null)}
      />
    </div>
  );
}
