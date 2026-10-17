import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, MessageSquare, Lightbulb, CreditCard, Moon, Sun, Play, LogOut } from "lucide-react";
import { usePalette } from "../lib/palette";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/interviews", label: "Interviews", icon: MessageSquare },
  { to: "/improvements", label: "Improvements", icon: Lightbulb },
  { to: "/payment", label: "Credits", icon: CreditCard },
];

// Shell for the signed-in pages: sticky navbar on top, page content below.
export function AppLayout() {
  const navigate = useNavigate();
  const p = usePalette();

  function logout() {
    localStorage.removeItem("authToken");
    navigate("/auth", { replace: true });
  }

  const navLinks = NAV_ITEMS.map(({ to, label, icon: Icon }) => (
    <NavLink
      key={to}
      to={to}
      className="nav-link flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium"
      style={({ isActive }) => ({
        background: isActive ? p.panelAlt : "transparent",
        color: isActive ? p.textPrimary : p.textMuted,
      })}
    >
      <Icon size={15} />
      {label}
    </NavLink>
  ));

  return (
    <div style={{ background: p.bg, color: p.textPrimary }} className="min-h-screen transition-colors duration-500">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) backwards; }
        .icon-btn { transition: opacity 0.15s ease; }
        .icon-btn:hover { opacity: 0.7; }
        .nav-link { transition: background-color 0.15s ease, color 0.15s ease; }
        .nav-link:hover { opacity: 0.85; }
        .row-btn { transition: background-color 0.15s ease, border-color 0.15s ease; }
        .range-btn { transition: background-color 0.15s ease, color 0.15s ease; }
        .start-btn { transition: opacity 0.15s ease, transform 0.1s ease; }
        .start-btn:hover { opacity: 0.88; }
        .start-btn:active { transform: scale(0.98); }
        .no-scrollbar { scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <header
        className="sticky top-0 z-40 backdrop-blur-md"
        style={{ background: p.isDark ? "rgba(10,10,12,0.8)" : "rgba(236,238,239,0.8)", borderBottom: `1px solid ${p.border}` }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate("/")} className="flex items-center gap-2.5" aria-label="Home">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg font-mono text-sm font-bold"
                style={{ background: p.solid, color: p.inverse }}
              >
                &gt;_
              </span>
              <span className="hidden font-mono text-base font-semibold sm:inline">InterviewAI</span>
            </button>

            <nav className="hidden items-center gap-1 md:flex">{navLinks}</nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={p.toggleTheme}
              aria-label="Toggle theme"
              className="icon-btn flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ color: p.textMuted }}
            >
              {p.isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button
              onClick={logout}
              aria-label="Log out"
              title="Log out"
              className="icon-btn flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ color: p.textMuted }}
            >
              <LogOut size={17} />
            </button>
            <button
              onClick={() => navigate("/information")}
              className="start-btn ml-1 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap"
              style={{ background: p.solid, color: p.inverse }}
            >
              <Play size={13} />
              <span className="hidden sm:inline">Start interview</span>
              <span className="sm:hidden">Start</span>
            </button>
          </div>
        </div>

        {/* Mobile nav: a scrollable row under the bar */}
        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-4 pb-2 md:hidden">{navLinks}</nav>
      </header>

      <Outlet />
    </div>
  );
}
