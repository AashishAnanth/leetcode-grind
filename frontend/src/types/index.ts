export type Difficulty = "easy" | "medium" | "hard";
export type Status = "todo" | "attempted" | "solved" | "needs-review";
export type Language = "python" | "java" | "cpp" | "javascript" | "typescript" | "go" | "rust" | "other";
export type WBMode = "hint" | "explain";

export interface Problem {
  id: number;
  neetcode_order: number;
  title: string;
  slug: string;
  difficulty: Difficulty;
  pattern: string;
  status: Status;
  leetcode_number: number | null;
  concepts: string[];
}

export interface ProblemDetail extends Problem {
  solve_history: SolveLog[];
}

export interface SolveLog {
  id: number;
  problem_id: number;
  status: Status;
  time_minutes: number | null;
  perceived_difficulty: Difficulty | null;
  code: string | null;
  language: Language | null;
  notes: string | null;
  attempt_number: number;
  next_review_at: string | null;
  review_interval_days: number;
  created_at: string;
}

export interface SolveLogCreate {
  status: Status;
  time_minutes?: number;
  perceived_difficulty?: Difficulty;
  code?: string;
  language?: Language;
  notes?: string;
}

export interface ScheduleConfig {
  id: number;
  problems_per_week: number;
  easy_pct: number;
  medium_pct: number;
  hard_pct: number;
  active_days: string[];
  updated_at: string;
}

export interface VaultEntry {
  pattern: string;
  content: string;
  updated_at: string;
}

export interface WhiteboardMessage {
  id: number;
  problem_id: number;
  role: "user" | "assistant";
  content: string;
  mode: WBMode;
  created_at: string;
}

export interface ProblemFilters {
  pattern?: string;
  difficulty?: Difficulty | "";
  status?: Status | "";
  search?: string;
}

export interface QueueProblem extends Problem {
  completed: boolean;
}

export interface TodayQueue {
  date: string;
  is_active_day: boolean;
  daily_target: number;
  reviews: QueueProblem[];
  new_problems: QueueProblem[];
  completed: QueueProblem[];
}

export interface ScheduleStats {
  activity: Record<string, number>; // "YYYY-MM-DD" -> count
  streak: number;
}
