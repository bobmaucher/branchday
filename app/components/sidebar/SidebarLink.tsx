"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface SidebarLinkProps {
  href: string;
  icon: ReactNode;
  label: string;
}

export default function SidebarLink({ href, icon, label }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className="relative group">
      <div
        className={`rounded-lg p-2 ${
          isActive ? "bg-white/20" : ""
        }`}
      >
        {icon}
      </div>
      <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition z-10">
        {label}
      </span>
    </Link>
  );
} 