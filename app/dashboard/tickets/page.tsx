"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Eye,
  Trash2,
  Pencil,
  Filter,
  Clock,
  CheckCircle,
  Ticket,
  Calendar,
  TrendingUp,
  FileText,
  Download,
  FileSpreadsheet,
} from "lucide-react";

interface TicketRow {
  id: number;
  created_at: string;
  caller_name: string | null;
  call_duration: string | null;
  subject: string | null;
  ticket_type: string | null;
  solution: string | null;
  site: string | null;
  agent_name: string | null;
  status: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  cerrado: "Cerrado",
};

function formatTicketNumber(id: number): string {
  return String(id).padStart(6, "0");
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function StatusBadge({ status }: { status: string | null }) {
  const s = status === "pendiente" ? "pendiente" : "cerrado";
  const label = STATUS_LABELS[s] ?? "—";
  const className =
    s === "pendiente"
      ? "rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800"
      : "rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800";
  return <span className={className}>{label}</span>;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [stats, setStats] = useState({
    pendientes: 0,
    cerrados: 0,
    total: 0,
    ticketsHoy: 0,
    ticketsSemana: 0,
    ticketsMes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedTicket, setSelectedTicket] = useState<TicketRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTicket, setEditTicket] = useState<TicketRow | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ status: "", agent_name: "", solution: "" });

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      params.set("sort", sortOrder);
      const res = await fetch(`/api/tickets?${params.toString()}`);
      if (!res.ok) throw new Error("Error al cargar tickets");
      const data = await res.json();
      setTickets(data);
    } catch (e) {
      console.error(e);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, dateFrom, dateTo, sortOrder]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/tickets/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este ticket?")) return;
    try {
      const res = await fetch(`/api/tickets/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      fetchTickets();
      fetchStats();
    } catch (e) {
      console.error(e);
      alert("Error al eliminar el ticket");
    }
  }

  function openEdit(t: TicketRow) {
    setEditTicket(t);
    setEditForm({
      status: t.status ?? "pendiente",
      agent_name: t.agent_name ?? "",
      solution: t.solution ?? "",
    });
    setEditOpen(true);
  }

  async function handleEditSubmit() {
    if (!editTicket) return;
    try {
      const res = await fetch(`/api/tickets/${editTicket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      setEditOpen(false);
      setEditTicket(null);
      fetchTickets();
      fetchStats();
    } catch (e) {
      console.error(e);
      alert("Error al actualizar el ticket");
    }
  }

  const summaryCards = [
    { title: "Pendientes", value: stats.pendientes, icon: Clock, bg: "bg-amber-100", text: "text-amber-800" },
    { title: "Cerrados", value: stats.cerrados, icon: CheckCircle, bg: "bg-emerald-100", text: "text-emerald-800" },
    { title: "Total", value: stats.total, icon: Ticket, bg: "bg-blue-100", text: "text-blue-800" },
    { title: "Tickets (Mes)", value: stats.ticketsMes, icon: Calendar, bg: "bg-indigo-100", text: "text-indigo-800" },
    { title: "Tickets (Semana)", value: stats.ticketsSemana, icon: TrendingUp, bg: "bg-violet-100", text: "text-violet-800" },
    { title: "Tickets (Hoy)", value: stats.ticketsHoy, icon: FileText, bg: "bg-rose-100", text: "text-rose-800" },
  ];

  return (
    <div className="space-y-6">
      {/* Título estilo Gestión de Cotizaciones */}
      <div className="border-b border-efc-gray-dark/10 pb-4">
        <h1 className="text-2xl font-bold uppercase tracking-wide text-efc-gray-darker">
          Panel de Tickets
        </h1>
        <p className="mt-1 text-sm text-efc-gray-dark">
          {stats.total} ticket{stats.total !== 1 ? "s" : ""} en total
        </p>
      </div>

      {/* Tarjetas resumen (6 indicadores) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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

      {/* Filtros, búsqueda y exportar en una sola fila */}
      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1">
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 border-efc-gray-dark/20"
          aria-label="Filtros"
        >
          <Filter className="mr-1 h-4 w-4" />
          Filtros
        </Button>
        <Input
          placeholder="Buscar por N° de ticket, solicitante, asunto, agente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[200px] max-w-xs shrink-0 border-efc-gray-dark/20 bg-white"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] shrink-0 border-efc-gray-dark/20 bg-white">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="w-[140px] shrink-0 border-efc-gray-dark/20 bg-white"
          placeholder="Desde"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="w-[140px] shrink-0 border-efc-gray-dark/20 bg-white"
          placeholder="Hasta"
        />
        <Button
          variant="outline"
          size="sm"
          className="ml-auto shrink-0 border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
        >
          <FileSpreadsheet className="mr-1 h-4 w-4" />
          Excel
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
        >
          <Download className="mr-1 h-4 w-4" />
          PDF
        </Button>
      </div>

      <p className="text-sm text-efc-gray-dark">
        Mostrando {tickets.length} de {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
      </p>

      {/* Tabla con cabecera azul siempre visible */}
      <Card className="overflow-hidden border-efc-gray-dark/15 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-0 bg-efc-executive hover:bg-efc-executive">
                <TableHead className="font-semibold text-white">N° TICKET</TableHead>
                <TableHead className="font-semibold text-white">FECHA</TableHead>
                <TableHead className="font-semibold text-white">SOLICITANTE</TableHead>
                <TableHead className="font-semibold text-white">ASUNTO</TableHead>
                <TableHead className="font-semibold text-white">TIEMPO DE ATENCIÓN</TableHead>
                <TableHead className="font-semibold text-white">SOLUCIÓN</TableHead>
                <TableHead className="font-semibold text-white">AGENTE</TableHead>
                <TableHead className="font-semibold text-white">ESTADO</TableHead>
                <TableHead className="font-semibold text-white">SEDE</TableHead>
                <TableHead className="font-semibold text-white">TIPO DE ATENCIÓN</TableHead>
                <TableHead className="text-right font-semibold text-white">ACCIONES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-efc-gray-dark/5">
                  <TableCell
                    colSpan={11}
                    className="py-16 text-center text-sm text-efc-gray-dark"
                  >
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : tickets.length === 0 ? (
                <TableRow className="border-efc-gray-dark/5">
                  <TableCell
                    colSpan={11}
                    className="py-16 text-center text-efc-gray-dark"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Ticket className="h-12 w-12 opacity-40" />
                      <p>No hay tickets</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((t) => (
                  <TableRow key={t.id} className="border-efc-gray-dark/5">
                    <TableCell className="font-mono text-sm font-medium text-efc-gray-darker">
                      {formatTicketNumber(t.id)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-efc-gray-dark">
                      {formatDate(t.created_at)}
                    </TableCell>
                    <TableCell className="font-medium text-efc-gray-darker">
                      {t.caller_name ?? "—"}
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate text-sm text-efc-gray-dark">
                      {t.subject ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-efc-gray-dark">
                      {t.call_duration ?? "—"}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate text-sm text-efc-gray-dark">
                      {t.solution ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-efc-gray-dark">
                      {t.agent_name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={t.status} />
                    </TableCell>
                    <TableCell className="text-sm text-efc-gray-dark">
                      {t.site ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-efc-gray-dark">
                      {t.ticket_type ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedTicket(t);
                            setDialogOpen(true);
                          }}
                          aria-label="Ver detalle"
                          className="text-efc-gray-dark hover:bg-efc-lime/20 hover:text-efc-gray-darker"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(t)}
                          aria-label="Editar"
                          className="text-efc-gray-dark hover:bg-efc-lime/20 hover:text-efc-gray-darker"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(t.id)}
                          aria-label="Eliminar"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Diálogo ver detalle */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-efc-gray-dark/15 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-efc-gray-darker">Detalle del ticket</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="grid gap-3 text-sm">
              <div>
                <span className="font-medium text-efc-gray-dark">N° de ticket:</span>{" "}
                {formatTicketNumber(selectedTicket.id)}
              </div>
              <div>
                <span className="font-medium text-efc-gray-dark">Fecha:</span>{" "}
                {formatDate(selectedTicket.created_at)}
              </div>
              <div>
                <span className="font-medium text-efc-gray-dark">Solicitante:</span>{" "}
                {selectedTicket.caller_name ?? "—"}
              </div>
              <div>
                <span className="font-medium text-efc-gray-dark">Asunto:</span>{" "}
                {selectedTicket.subject ?? "—"}
              </div>
              <div>
                <span className="font-medium text-efc-gray-dark">Tiempo de atención:</span>{" "}
                {selectedTicket.call_duration ?? "—"}
              </div>
              <div>
                <span className="font-medium text-efc-gray-dark">Solución:</span>{" "}
                {selectedTicket.solution ?? "—"}
              </div>
              <div>
                <span className="font-medium text-efc-gray-dark">Agente:</span>{" "}
                {selectedTicket.agent_name ?? "—"}
              </div>
              <div>
                <span className="font-medium text-efc-gray-dark">Estado:</span>{" "}
                <StatusBadge status={selectedTicket.status} />
              </div>
              <div>
                <span className="font-medium text-efc-gray-dark">Sede:</span>{" "}
                {selectedTicket.site ?? "—"}
              </div>
              <div>
                <span className="font-medium text-efc-gray-dark">Tipo de atención:</span>{" "}
                {selectedTicket.ticket_type ?? "—"}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo editar */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="border-efc-gray-dark/15 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-efc-gray-darker">
              Editar ticket {editTicket ? formatTicketNumber(editTicket.id) : ""}
            </DialogTitle>
          </DialogHeader>
          {editTicket && (
            <div className="grid gap-4 py-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-efc-gray-dark">
                  Estado
                </label>
                <Select
                  value={editForm.status}
                  onValueChange={(v) => setEditForm((f) => ({ ...f, status: v }))}
                >
                  <SelectTrigger className="border-efc-gray-dark/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="cerrado">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-efc-gray-dark">
                  Agente
                </label>
                <Input
                  value={editForm.agent_name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, agent_name: e.target.value }))
                  }
                  placeholder="Nombre del agente"
                  className="border-efc-gray-dark/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-efc-gray-dark">
                  Solución
                </label>
                <Input
                  value={editForm.solution}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, solution: e.target.value }))
                  }
                  placeholder="Solución aplicada"
                  className="border-efc-gray-dark/20"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleEditSubmit}>Guardar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
