
import { NavLink} from "react-router-dom";
import {
  LayoutDashboard,
  Database,
  BookOpen,
  Search,
  BarChart3,
  List,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";
import civicIntelLogo from "../../assets/signup.logo.png";

const menuItems = [
  { name: "Dashboard", path: "/admin-preview", icon: LayoutDashboard },
  { name: "Data Ingest", path: "/admin-preview/data", icon: Database },
  { name: "Publish Queue", path: "/admin/publishing", icon: BookOpen },
  { name: "Q/A / Conflicts", path: "/admin/conflicts", icon: Search },
  { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  { name: "Polls management", path: "/admin/polls", icon: List },
  { name: "Content management", path: "/admin/content", icon: List },
];

function AdminSideBar() {
 
  const { user, logout } = useAuth();

  const displayName =
    user?.full_name ||
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
    "Administrator";

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-62.5 flex-col overflow-hidden bg-[#0B3C5D] text-white">
      {/* Logo */}
      <div className="flex h-30 items-center px-7">
        <img
          src={civicIntelLogo}
          alt="CivicIntel"
          className="w-30 object-contain"
        />
      </div>

      {/* Main menu */}
      <nav className="admin-sidebar-scroll min-h-0 flex-1 overflow-y-auto px-8 pt-7">
        <p className="mb-5 text-sm font-medium uppercase text-white">
          Menu
        </p>

        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin-preview"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${
                    isActive
                    ? "font-semibold text-white"
                    : "text-white/55 hover:text-white"
                  }`
                }
              >
                <Icon size={20} strokeWidth={1.7} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* General */}
        <div className="mt-10">
          <p className="mb-5 text-sm font-medium uppercase text-white">
            General
          </p>

          <div className="space-y-2">
            <NavLink
              to="/admin/settings"
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white/55 transition hover:text-white"
            >
              <Settings size={20} strokeWidth={1.7} />
              Settings
            </NavLink>

            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-white/55 transition hover:text-white"
            >
              <LogOut size={20} strokeWidth={1.7} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Admin profile */}
      <div className="shrink-0 px-8 pb-8 pt-4">
        <p className="text-lg font-medium">{displayName}</p>

        <div className="mt-3 flex items-center gap-2 pl-2 text-sm text-white/80">
          <span>Admin</span>
          <ChevronDown size={15} />
        </div>
      </div>
    </aside>
  );
}

export default AdminSideBar;
