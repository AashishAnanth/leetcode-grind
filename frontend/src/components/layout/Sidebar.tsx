import { NavLink } from "react-router-dom";
import { LayoutDashboard, List, Calendar, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/problems", label: "Problems", icon: List },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/vault", label: "Vault", icon: BookOpen },
];

export function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-zinc-800 flex flex-col py-6 px-3 gap-1">
      <div className="px-3 mb-6">
        <span className="text-sm font-bold tracking-widest text-zinc-400 uppercase">
          LC Grind
        </span>
      </div>
      {nav.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              isActive
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
            )
          }
        >
          <Icon size={16} />
          {label}
        </NavLink>
      ))}
    </aside>
  );
}
