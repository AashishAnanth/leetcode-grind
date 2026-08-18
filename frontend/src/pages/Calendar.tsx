import { useScheduleStats } from "@/hooks/useSchedule";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function heatColor(count: number): string {
  if (count === 0) return "bg-zinc-800";
  if (count === 1) return "bg-indigo-900";
  if (count <= 3) return "bg-indigo-700";
  if (count <= 6) return "bg-indigo-500";
  return "bg-indigo-400";
}

function MonthGrid({
  year,
  month,
  activity,
}: {
  year: number;
  month: number; // 0-indexed
  activity: Record<string, number>;
}) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // day-of-week offset for the 1st (0=Sun → shift to Mon-start)
  const startDow = (firstDay.getDay() + 6) % 7; // 0=Mon
  const daysInMonth = lastDay.getDate();

  const todayStr = new Date().toISOString().slice(0, 10);

  const cells: Array<{ key: string | null; date: number | null; count: number }> = [];

  // Empty leading cells
  for (let i = 0; i < startDow; i++) {
    cells.push({ key: null, date: null, count: 0 });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ key, date: d, count: activity[key] ?? 0 });
  }

  return (
    <div>
      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
        {MONTH_NAMES[month]} {year}
      </h3>
      {/* Day header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["M", "T", "W", "T", "F", "S", "S"].map((l, i) => (
          <div key={i} className="text-center text-xs text-zinc-600">{l}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) =>
          cell.key === null ? (
            <div key={`empty-${i}`} />
          ) : (
            <div
              key={cell.key}
              title={cell.count > 0 ? `${cell.count} solve${cell.count > 1 ? "s" : ""}` : ""}
              className={`aspect-square rounded flex items-center justify-center text-xs
                ${heatColor(cell.count)}
                ${cell.key === todayStr ? "ring-2 ring-indigo-400" : ""}
                ${cell.count > 0 ? "text-indigo-200 font-medium" : "text-zinc-600"}`}
            >
              {cell.date}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export function Calendar() {
  const { data: stats, isLoading } = useScheduleStats(365);

  // Show last 6 months + current
  const today = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const totalSolves = stats
    ? Object.values(stats.activity).reduce((a, b) => a + b, 0)
    : 0;
  const activeDays = stats
    ? Object.values(stats.activity).filter((v) => v > 0).length
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Calendar</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Solve activity over the past 6 months</p>
        </div>
        {stats && (
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-2xl font-bold text-indigo-400">{stats.streak}</p>
              <p className="text-xs text-zinc-500">day streak</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-zinc-100">{totalSolves}</p>
              <p className="text-xs text-zinc-500">total solves</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-zinc-100">{activeDays}</p>
              <p className="text-xs text-zinc-500">active days</p>
            </div>
          </div>
        )}
      </div>

      {isLoading && <p className="text-sm text-zinc-500">Loading…</p>}

      {stats && (
        <>
          {/* Heatmap legend */}
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>Less</span>
            {[0, 1, 3, 5, 7].map((n) => (
              <div key={n} className={`w-4 h-4 rounded ${heatColor(n)}`} />
            ))}
            <span>More</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {months.map(({ year, month }) => (
              <MonthGrid
                key={`${year}-${month}`}
                year={year}
                month={month}
                activity={stats.activity}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
