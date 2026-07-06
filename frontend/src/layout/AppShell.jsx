import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { LayoutDashboard, Activity, ClipboardList, Network, LineChart, Users, Bell, LogOut, ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true, tid: "nav-overview" },
  { to: "/motors", label: "Multi-Motor View", icon: Activity, tid: "nav-motors" },
  { to: "/maintenance", label: "Maintenance Log", icon: ClipboardList, tid: "nav-maintenance" },
  { to: "/grafana", label: "Grafana Insights", icon: LineChart, tid: "nav-grafana" },
  { to: "/users", label: "User Management", icon: Users, tid: "nav-users" },
  { to: "/hierarchy", label: "Plant Hierarchy", icon: Network, tid: "nav-hierarchy" },
];

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const doLogout = () => { logout(); nav("/login"); };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--vg-canvas)" }} data-testid="app-shell">
      {/* Header */}
      <header
        className="sticky top-0 z-40 h-20 flex items-center px-4 backdrop-blur-xl"
        style={{ background: "rgba(13,27,61,0.85)", borderBottom: "1px solid var(--vg-border)" }}
      >
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-2 rounded hover:bg-white/5 text-[#8799BA] hover:text-white mr-2"
          data-testid="sidebar-toggle"
        >
          <Menu size={18} />
        </button>
        <div className="flex items-center gap-2">
          <img
            src="https://cdn.phototourl.com/free/2026-07-06-b0e4955d-a8ab-447f-adcf-0c06c0afeac9.jpg"
            alt="VangateAI"
            className="w-16 h-16 rounded-md object-cover"
            data-testid="header-logo"
          />
          <div className="font-semibold tracking-wide text-white">VangateAI</div>
          <div className="hidden sm:block text-xs font-mono ml-2" style={{ color: "var(--vg-muted)" }}>
            / Vibration Portal
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button className="relative p-2 rounded hover:bg-white/5 text-[#8799BA] hover:text-white" data-testid="header-notifications">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "var(--vg-warn)" }} />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5" data-testid="header-user-menu">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                     style={{ background: "var(--vg-cyan)" }}>
                  {user?.username?.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-sm text-white hidden sm:block">{user?.full_name || user?.username}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0D1B3D] border-[#8799BA]/30 text-white">
              <DropdownMenuLabel className="font-mono text-xs text-[#8799BA]">{user?.role}</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#8799BA]/20" />
              <DropdownMenuItem onClick={doLogout} data-testid="header-logout" className="cursor-pointer">
                <LogOut size={14} className="mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside
          className={`${collapsed ? "w-16" : "w-60"} shrink-0 transition-all duration-200 hidden md:flex flex-col`}
          style={{ background: "#0A1932", borderRight: "1px solid var(--vg-border)" }}
          data-testid="sidebar"
        >
          <nav className="flex-1 p-2 space-y-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                data-testid={item.tid}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-[#095FDF]/20 text-white border-l-2 border-[#095FDF]"
                      : "text-[#8799BA] hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <item.icon size={16} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>
          <div className="p-2">
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="w-full flex items-center justify-center py-2 rounded text-[#8799BA] hover:text-white hover:bg-white/5"
              data-testid="sidebar-collapse"
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 overflow-auto" data-testid="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
