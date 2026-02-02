"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Ticket, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  canSeeUsers?: boolean;
}

export function Sidebar({ collapsed, onToggle, canSeeUsers }: SidebarProps) {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";
  const isTickets = pathname === "/dashboard/tickets";
  const isUsuarios = pathname === "/dashboard/usuarios";

  const linkClass = (active: boolean) =>
    cn(
      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
      active
        ? "bg-efc-executive-light text-white"
        : "text-white/80 hover:bg-white/10 hover:text-white"
    );

  return (
    <aside
      className={cn(
        "flex min-h-full flex-col bg-efc-executive shadow-lg transition-all duration-300 md:min-h-screen",
        collapsed ? "w-0 overflow-hidden p-0 md:w-16" : "w-64 shrink-0 p-4"
      )}
    >
      <div className="mb-6 flex w-full shrink-0 items-center justify-center py-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center justify-center" aria-label="Ir al inicio">
            <Image
              src="/efc-logo.png"
              alt="EFC"
              width={120}
              height={120}
              className="h-16 w-auto max-w-[180px] object-contain invert"
            />
          </Link>
        )}
      </div>
      <nav className="flex min-h-0 flex-1 flex-col gap-1">
        <Link href="/dashboard" className={collapsed ? "flex justify-center py-2" : "block w-full"}>
          <span className={linkClass(isDashboard)}>
            <LayoutDashboard className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Dashboard</span>}
          </span>
        </Link>
        <Link href="/dashboard/tickets" className={collapsed ? "flex justify-center py-2" : "block w-full"}>
          <span className={linkClass(isTickets)}>
            <Ticket className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Tickets</span>}
          </span>
        </Link>
        {canSeeUsers && (
          <Link href="/dashboard/usuarios" className={collapsed ? "flex justify-center py-2" : "block w-full"}>
            <span className={linkClass(isUsuarios)}>
              <Users className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Usuarios</span>}
            </span>
          </Link>
        )}
      </nav>
    </aside>
  );
}
