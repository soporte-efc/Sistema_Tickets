"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface DashboardShellProps {
  children: React.ReactNode;
  userName?: string | null;
  userEmail?: string | null;
  userRole?: string;
  userPermissions?: string[];
}

export function DashboardShell({
  children,
  userName,
  userEmail,
  userRole = "soporte",
  userPermissions = ["tickets"],
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const canSeeUsers =
    userRole === "super_admin" || userPermissions.includes("usuarios");

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="hidden md:flex md:min-h-screen md:shrink-0">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((c) => !c)}
          canSeeUsers={canSeeUsers}
        />
      </div>
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0 md:hidden">
          <div className="pt-6">
            <Sidebar collapsed={false} canSeeUsers={canSeeUsers} />
          </div>
        </SheetContent>
      </Sheet>
      <div className="flex flex-1 flex-col">
        <Topbar
          userName={userName}
          userEmail={userEmail}
          userRole={userRole}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-auto bg-efc-gray-dark/5 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
