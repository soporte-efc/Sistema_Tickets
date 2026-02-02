"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ROLES, PERMISSION_SECTIONS } from "@/lib/auth";
import { Users, Shield, UserCog, Pencil, Loader2 } from "lucide-react";

interface UserRow {
  user_id: string;
  email: string;
  role: string;
  permissions: string[];
  created_at: string;
  has_password: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Administrador",
  admin: "Administrador",
  soporte: "Soporte",
  invitado: "Invitado",
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-violet-100 text-violet-800",
  admin: "bg-blue-100 text-blue-800",
  soporte: "bg-emerald-100 text-emerald-800",
  invitado: "bg-efc-gray-dark/10 text-efc-gray-dark",
};

function RoleBadge({ role }: { role: string }) {
  const label = ROLE_LABELS[role] ?? role;
  const className = ROLE_COLORS[role] ?? ROLE_COLORS.invitado;
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

export default function UsuariosPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users");
      if (res.status === 403) {
        setError("No tienes permiso para ver esta página.");
        setUsers([]);
        return;
      }
      if (!res.ok) throw new Error("Error al cargar usuarios");
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      setError("Error al cargar la lista de usuarios.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  function openEdit(user: UserRow) {
    setEditing(user);
    setEditRole(user.role);
    setEditPermissions([...user.permissions]);
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(editing.user_id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: editRole, permissions: editPermissions }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      setEditing(null);
      fetchUsers();
    } catch {
      setError("Error al guardar cambios.");
    } finally {
      setSaving(false);
    }
  }

  function togglePermission(section: string) {
    setEditPermissions((prev) =>
      prev.includes(section)
        ? prev.filter((p) => p !== section)
        : [...prev, section]
    );
  }

  const total = users.length;
  const superAdmins = users.filter((u) => u.role === "super_admin").length;
  const admins = users.filter((u) => u.role === "admin").length;
  const soporte = users.filter((u) => u.role === "soporte").length;

  if (error && !loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Volver al dashboard
        </Button>
      </div>
    );
  }

  const summaryCards = [
    { title: "Total usuarios", value: total, icon: Users, bg: "bg-blue-100", text: "text-blue-800" },
    { title: "Super Admin", value: superAdmins, icon: Shield, bg: "bg-violet-100", text: "text-violet-800" },
    { title: "Administradores", value: admins, icon: UserCog, bg: "bg-indigo-100", text: "text-indigo-800" },
    { title: "Soporte", value: soporte, icon: Users, bg: "bg-emerald-100", text: "text-emerald-800" },
  ];

  return (
    <div className="space-y-6">
      {/* Título estilo ejecutivo */}
      <div className="border-b border-efc-gray-dark/10 pb-4">
        <h1 className="text-2xl font-bold uppercase tracking-wide text-efc-gray-darker">
          Gestión de usuarios
        </h1>
        <p className="mt-1 text-sm text-efc-gray-dark">
          {total} usuario{total !== 1 ? "s" : ""} en total · Roles y permisos (qué secciones puede ver cada uno).
        </p>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className="overflow-hidden border-efc-gray-dark/10 shadow-sm transition-shadow hover:shadow-md"
            >
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs font-medium uppercase text-efc-gray-dark">
                    {card.title}
                  </p>
                  <p className="mt-1 text-xl font-bold text-efc-gray-darker">
                    {card.value}
                  </p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg} ${card.text}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-sm text-efc-gray-dark">
        Mostrando {users.length} de {users.length} usuario{users.length !== 1 ? "s" : ""}
      </p>

      {/* Tabla con cabecera azul */}
      <Card className="overflow-hidden border-efc-gray-dark/15 shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-efc-gray-dark">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Cargando...
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-efc-gray-dark">
              <Users className="h-12 w-12 opacity-40" />
              <p>No hay usuarios</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-0 bg-efc-executive hover:bg-efc-executive">
                  <TableHead className="font-semibold text-white">CORREO</TableHead>
                  <TableHead className="font-semibold text-white">ROL</TableHead>
                  <TableHead className="font-semibold text-white">PERMISOS</TableHead>
                  <TableHead className="text-right font-semibold text-white">ACCIONES</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.user_id} className="border-efc-gray-dark/5">
                    <TableCell className="font-medium text-efc-gray-darker">
                      {u.email}
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={u.role} />
                    </TableCell>
                    <TableCell className="text-sm text-efc-gray-dark">
                      <span className="inline-flex flex-wrap gap-1">
                        {(u.permissions.length ? u.permissions : ["—"]).map((p) => (
                          <span
                            key={p}
                            className="rounded bg-efc-gray-dark/10 px-2 py-0.5 text-xs text-efc-gray-darker"
                          >
                            {p}
                          </span>
                        ))}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(u)}
                        className="text-efc-gray-dark hover:bg-efc-lime/20 hover:text-efc-gray-darker"
                      >
                        <Pencil className="mr-1.5 h-4 w-4" />
                        Editar permisos
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="border-efc-gray-dark/15 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-efc-gray-darker">Editar usuario</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 py-2">
              <p className="rounded-lg bg-efc-gray-dark/5 px-3 py-2 text-sm font-medium text-efc-gray-darker">
                {editing.email}
              </p>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-efc-gray-dark">Rol</Label>
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger className="w-full border-efc-gray-dark/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_LABELS[r] ?? r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-efc-gray-dark">
                  Permisos (secciones que puede ver)
                </Label>
                <div className="flex flex-wrap gap-2">
                  {PERMISSION_SECTIONS.map((section) => (
                    <Button
                      key={section}
                      type="button"
                      variant={editPermissions.includes(section) ? "default" : "outline"}
                      size="sm"
                      onClick={() => togglePermission(section)}
                      className={
                        editPermissions.includes(section)
                          ? "bg-efc-executive hover:bg-efc-executive/90"
                          : "border-efc-gray-dark/20"
                      }
                    >
                      {section}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-efc-gray-dark">
                  tickets = Panel de tickets · usuarios = Esta página · reportes = Reportes
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 border-t border-efc-gray-dark/10 pt-4">
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={saveEdit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
