
import { Outlet } from "react-router-dom";

import AdminSidebar from "../admin/AdminSideBar.jsx";
import AdminHeader from "../admin/AdminHeader.jsx";

function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main area */}
      <div className="min-h-screen pl-64.5">
        {/* Header */}
        <AdminHeader />

        {/* Page content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
