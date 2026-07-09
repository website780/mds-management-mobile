// layout.jsx
"use client";
import AvatarDropdown from "@/components/AvatarDropdown";
import { getAllProperties } from "@/redux/features/property/propertySlice";
import Image from "expo-image";
import Link, { usePathname, useRouter } from "expo-router";
import {
  ArrowLeft,
  BedDouble,
  LayoutDashboard,
  MapPinHouse,
  MapPinPlus,
  Menu,
  NotebookText,
  Search,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function HotelDashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookingDropdownOpen, setBookingDropdownOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();

  const { properties, isLoading } = useSelector((state) => state.property);

  useEffect(() => {
    dispatch(getAllProperties());
    const saved = localStorage.getItem("selectedProperty");
    if (saved) {
      setSelectedProperty(JSON.parse(saved));
    }
  }, [dispatch]);

  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
    setBookingDropdownOpen(false);
    localStorage.setItem("selectedProperty", JSON.stringify(property));
    window.dispatchEvent(
      new CustomEvent("propertyChanged", { detail: property }),
    );
    router.push("/host/bookings ");
  };

  // Determine page title and whether to show back button
  const getPageInfo = () => {
    if (pathname === "/host" || pathname === "/host/dashboard")
      return { title: "Dashboard", showBack: false };
    if (pathname.includes("/host/properties"))
      return { title: "Properties", showBack: true };
    if (pathname.includes("/host/onboarding"))
      return { title: "Onboarding", showBack: true };
    if (
      pathname.includes("/host/all-bookings") ||
      pathname.includes("/host/allbookings")
    )
      return { title: "All Bookings", showBack: true };
    if (pathname.includes("/host/bookings"))
      return { title: "Bookings", showBack: true };
    if (pathname.includes("/host/occupancy"))
      return { title: "Occupancy", showBack: true };
    return { title: "Dashboard", showBack: true };
  };

  const pageInfo = getPageInfo();

  const navItems = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: "Dashboard",
      href: "/host",
    },
    {
      icon: <MapPinHouse className="h-5 w-5" />,
      label: "Properties",
      href: "/host/properties",
    },
    {
      icon: <MapPinPlus className="h-5 w-5" />,
      label: "Onboarding",
      href: "/host/onboarding",
    },
    {
      icon: <NotebookText className="h-5 w-5" />,
      label: "All Bookings",
      href: "/host/all-bookings",
    },
    {
      icon: <BedDouble className="h-5 w-5" />,
      label: "Occupancy",
      href: "/host/occupancy",
    },
  ];

  const isActive = (href) => {
    if (href === "/host")
      return pathname === "/host" || pathname === "/host/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white border-r border-gray-200 text-gray-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo Section */}
        <div
          className="flex items-center justify-between px-4 pt-2 border-b border-gray-100 overflow-hidden"
          style={{ height: "72px" }}
        >
          <Link
            href="/"
            className="flex items-center overflow-hidden"
            style={{ margin: "-16px 0" }}
          >
            <Image
              src="/mds.png"
              alt="MDS Logo"
              width={150}
              height={150}
              className="w-36 h-auto object-contain"
              priority
            />
          </Link>
          <button
            className="rounded-md p-1.5 hover:bg-gray-100 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-0.5 px-3 pt-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                isActive(item.href)
                  ? "bg-[#1035ac] text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header / Navbar */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              className="rounded-md p-1 hover:bg-gray-100 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>

            {/* Back button + Page title */}
            <div className="flex items-center gap-2">
              {pageInfo.showBack && (
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-1 text-[#1035ac] hover:text-[#0c2780] transition-colors rounded-lg p-1.5 hover:bg-blue-50"
                  title="Go back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <h1 className="text-lg font-semibold text-gray-800 hidden sm:block">
                {pageInfo.title}
              </h1>
            </div>

            {/* Search (only on bookings) */}
            {pathname.includes("/bookings") && (
              <div className="relative w-64 max-w-xs lg:w-80 hidden md:block">
                <input
                  type="text"
                  placeholder="Search bookings, guests..."
                  className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-4 focus:border-[#1035ac] focus:outline-none focus:ring-1 focus:ring-[#1035ac] focus:bg-white transition-colors"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            )}
          </div>

          {/* Right side: avatar */}
          <div className="flex items-center gap-3">
            <AvatarDropdown />
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-2 md:p-4 lg:p-6 bg-gray-50">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t bg-white py-3 px-4 text-center text-xs text-gray-400">
          © 2026 PILGRIM CONNECT PVT. LTD. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
