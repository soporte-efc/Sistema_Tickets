"use client";

import { useRouter } from "next/navigation";
import { Menu, LogOut, User, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopbarProps {
  userName?: string | null;
  userEmail?: string | null;
  userRole?: string;
  onMenuClick?: () => void;
}

export function Topbar({ userName, userEmail, userRole, onMenuClick }: TopbarProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const displayName = userName ?? userEmail ?? "Usuario";
  const roleLabel =
    userRole === "super_admin"
      ? "Super Administrador"
      : userRole === "admin"
        ? "Administrador"
        : "Usuario";

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-white/10 bg-efc-executive px-4 shadow-md">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden text-white hover:bg-white/10 hover:text-white"
        onClick={onMenuClick}
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </Button>
      {/* En desktop el logo solo está en el sidebar; aquí solo el menú usuario a la derecha */}
      <div className="flex flex-1 items-center justify-end gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-white hover:bg-white/10 hover:text-white"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-efc-executive-light text-sm font-semibold text-white">
                {(displayName[0] ?? "U").toUpperCase()}
              </div>
              <div className="hidden flex-col items-start text-left sm:flex">
                <span className="max-w-[140px] truncate text-sm font-medium sm:max-w-[180px]">
                  {displayName}
                </span>
                <span className="text-xs text-white/80">{roleLabel}</span>
              </div>
              <ChevronDown className="h-4 w-4 opacity-80" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem disabled className="text-xs text-efc-gray-dark">
              {userEmail}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
