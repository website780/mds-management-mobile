// layout.jsx
"use client";
import AvatarDropdown from "@/components/AvatarDropdown";
import { getAllProperties } from "@/redux/features/property/propertySlice";
import Link, { usePathname } from "expo-router";
import {
  Building,
  ChartColumnStacked,
  CirclePlus,
  List,
  MapPinHouse,
  Menu,
  NotebookPen,
  Search,
  UsersRound,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

export default function HotelDashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pathname = usePathname();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllProperties());
    // Load selected property from localStorage on mount
    const saved = localStorage.getItem("selectedProperty");
    // if (saved) {
    //   setSelectedProperty(JSON.parse(saved))
    // }
  }, [dispatch]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-[#1035ac] text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <Link href="/admin">
            {" "}
            <div className="flex items-center gap-2 font-bold text-xl">
              <Building className="h-6 w-6" />
              <span>MDS</span>
            </div>
          </Link>
          <button
            className="rounded-md p-1 hover:bg-blue-800 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="space-y-1 px-2">
          <NavItem
            icon={<MapPinHouse className="h-5 w-5" />}
            label="Properties"
          />
          <NavItem icon={<UsersRound className="h-5 w-5" />} label="users" />
          <NavItem icon={<CirclePlus className="h-5 w-5" />} label="add-blog" />
          <NavItem icon={<List className="h-5 w-5" />} label="bloglist" />
          <NavItem
            icon={<ChartColumnStacked className="h-5 w-5" />}
            label="categories"
          />
          <NavItem
            icon={<NotebookPen className="h-5 w-5" />}
            label="allbookings"
          />
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              className="rounded-md p-1 hover:bg-gray-100 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            {pathname.includes("/bookings") && (
              <div className="relative w-64 max-w-xs lg:w-80">
                <input
                  type="text"
                  placeholder="Search bookings, guests..."
                  className="h-9 w-full rounded-md border border-gray-300 pl-9 pr-4 focus:border-[#1035ac] focus:outline-none focus:ring-1 focus:ring-[#1035ac]"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <AvatarDropdown />
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-1 md:p-4  lg:p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t bg-white p-4 text-center text-sm text-gray-500 lg:p-4">
          © 2026 PILGRIM CONNECT PVT. LTD
        </footer>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active }) {
  return (
    <Link
      href={`/admin/${label.toLowerCase()}`}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${active ? "bg-blue-800" : "hover:bg-blue-800"}`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
