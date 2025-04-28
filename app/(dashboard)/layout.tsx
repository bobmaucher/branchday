import {
  HomeIcon,
  CalendarDaysIcon,
  UsersIcon,
  FolderIcon,
  Cog6ToothIcon,
  ChartPieIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";

import SidebarLink from "@/app/components/sidebar/SidebarLink";
import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-20 bg-gray-900 text-white flex flex-col justify-between items-center py-4 fixed h-full z-50">
        {/* Top‑logo + nav */}
        <div className="flex flex-col items-center space-y-6">
          {/* GNB logo */}
          <Link href="https://www.goliathbank.com/" className="p-2">
            <img
              src="/gnb_logo.png"
              alt="Goliath National Bank"
              className="w-10 h-10 object-contain rounded-full"
            />
          </Link>

          {/* Navigation */}
          <nav className="flex flex-col items-center space-y-6 mt-6">
            <SidebarLink
              href="/dashboard"
              icon={<HomeIcon className="w-8 h-8 text-white" />}
              label="Home"
            />
            <SidebarLink
              href="/schedule"
              icon={<CalendarDaysIcon className="w-8 h-8 text-white" />}
              label="Schedule"
            />
            <SidebarLink
              href="/team"
              icon={<UsersIcon className="w-8 h-8 text-white" />}
              label="Team"
            />
            <SidebarLink
              href="/reports"
              icon={<ChartPieIcon className="w-8 h-8 text-white" />}
              label="Reports"
            />
            <SidebarLink
              href="/competition"
              icon={<BuildingOffice2Icon className="w-8 h-8 text-white" />}
              label="Competition"
            />
            <SidebarLink
              href="/files"
              icon={<FolderIcon className="w-8 h-8 text-white" />}
              label="Files"
            />
            <SidebarLink
              href="/settings"
              icon={<Cog6ToothIcon className="w-8 h-8 text-white" />}
              label="Settings"
            />
          </nav>
        </div>

        {/* Bottom BranchDay logo */}
        <Link href="/" className="pb-1">
          <img
            src="/branchday-vertical-logo.png"
            alt="BranchDay"
            className="w-14 h-14 object-contain opacity-80 hover:opacity-100 transition"
          />
        </Link>
      </aside>

      {/* Main content area */}
      <div className="flex-1 pl-20">
        {/* Header */}
        <header className="h-16 bg-white shadow flex items-center justify-between px-6 fixed top-0 right-0 left-20 z-40">
          <input
            type="text"
            placeholder="Search"
            className="border border-gray-300 rounded-md px-3 py-1 text-sm w-1/3"
          />
          <div className="flex items-center space-x-4">
            <button>🔔</button>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Tom Cook</span>
              <img
                className="w-8 h-8 rounded-full"
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e"
                alt="Profile"
              />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="pt-16 p-6 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}