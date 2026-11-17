
import { Search, Bell, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

function AdminHeader() {
  const { user } = useAuth();

  const displayName =
    user?.full_name ||
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
    "Administrator";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="flex h-23 w-full items-center justify-between border-b border-gray-100 bg-white px-8">
      {/* Search */}
      <div className="flex w-full max-w-105 items-center gap-3 rounded-lg border border-gray-200 bg-[#F8FAFC] px-4 py-3">
        <Search size={19} className="text-gray-400" />

        <input
          type="text"
          placeholder="Search..."
          className="w-full bg-transparent text-sm text-[#0B3C5D] outline-none placeholder:text-gray-400"
        />
      </div>

      {/* Right section */}
      <div className="ml-6 flex shrink-0 items-center gap-7">
        {/* Notifications */}
        <div className="relative">
          <Bell size={22} className="text-[#0B3C5D]" />

          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
        </div>

        {/* Admin profile */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E7ECEF] text-sm font-semibold text-[#0B3C5D]">
            {initials}
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-[#0B3C5D]">
              {displayName}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              Admin
            </p>
          </div>

          <ChevronDown size={17} className="text-gray-500" />
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
