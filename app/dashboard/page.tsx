"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  Ticket,
  Clock,
  CheckCircle,
  Calendar,
  TrendingUp,
  FileText,
  AlertCircle,
  Users,
  RefreshCw,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pendiente: "#f59e0b",
  cerrado: "#22c55e",
};

const STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendientes",
  cerrado: "Cerrados",
};

type Period = "semana" | "mes" | "año";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    pendientes: 0,
    cerrados: 0,
    total: 0,
    ticketsHoy: 0,
    ticketsSemana: 0,
    ticketsMes: 0,
  });
  const [period, setPeriod] = useState<Period>("mes");
  const [byDate, setByDate] = useState<{ fecha: string; cantidad: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/tickets/stats"),
      fetch("/api/tickets?status=all&sort=desc"),
    ])
      .then(async ([statsRes, ticketsRes]) => {
        if (statsRes.ok) setStats(await statsRes.json());
        if (ticketsRes.ok) {
          const tickets: { created_at: string }[] = await ticketsRes.json();
          const byDay: Record<string, number> = {};
          tickets.forEach((t) => {
            const d = new Date(t.created_at);
            const key = d.toLocaleDateString("es-PE", {
              day: "2-digit",
              month: "short",
            });
            byDay[key] = (byDay[key] ?? 0) + 1;
          });
          setByDate(
            Object.entries(byDay)
              .map(([fecha, cantidad]) => ({ fecha, cantidad }))
              .slice(-14)
              .reverse()
          );
        }
      })
      .catch(() => setByDate([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const pieData = [
    { name: STATUS_LABELS.pendiente, value: stats.pendientes, color: STATUS_COLORS.pendiente },
    { name: STATUS_LABELS.cerrado, value: stats.cerrados, color: STATUS_COLORS.cerrado },
  ].filter((d) => d.value > 0);

  const periodValue =
    period === "año"
      ? stats.total
      : period === "mes"
        ? stats.ticketsMes
        : stats.ticketsSemana;

  const summaryCards = [
    {
      title: "Total Tickets",
      value: stats.total,
      icon: Ticket,
      bgIcon: "bg-blue-500",
      iconColor: "text-white",
    },
    {
      title: "Pendientes",
      value: stats.pendientes,
      icon: Clock,
      bgIcon: "bg-amber-500",
      iconColor: "text-white",
    },
    {
      title: "Cerrados",
      value: stats.cerrados,
      icon: CheckCircle,
      bgIcon: "bg-green-500",
      iconColor: "text-white",
    },
    {
      title: "Tickets (Mes)",
      value: stats.ticketsMes,
      icon: Calendar,
      bgIcon: "bg-indigo-500",
      iconColor: "text-white",
    },
    {
      title: "Tickets (Semana)",
      value: stats.ticketsSemana,
      icon: TrendingUp,
      bgIcon: "bg-emerald-500",
      iconColor: "text-white",
    },
    {
      title: "Tickets (Hoy)",
      value: stats.ticketsHoy,
      icon: FileText,
      bgIcon: "bg-violet-500",
      iconColor: "text-white",
    },
    {
      title: "Total (Período)",
      value: periodValue,
      icon: AlertCircle,
      bgIcon: "bg-efc-executive",
      iconColor: "text-white",
    },
    {
      title: "Activos",
      value: stats.pendientes,
      icon: Users,
      bgIcon: "bg-sky-500",
      iconColor: "text-white",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header estilo Dashboard Ejecutivo */}
      <div className="flex flex-col gap-4 rounded-lg bg-efc-executive px-6 py-5 text-white shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Ejecutivo</h1>
          <p className="mt-0.5 text-sm text-white/90">Vista general de tickets</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-white/90">Período:</span>
          <div className="flex rounded-lg bg-white/10 p-0.5">
            {(["semana", "mes", "año"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                  period === p ? "bg-white text-efc-executive" : "text-white/80 hover:text-white"
                }`}
              >
                {p === "año" ? "Año" : p === "mes" ? "Mes" : "Semana"}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={loadData}
            className="rounded-lg p-2 text-white/90 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Actualizar"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-efc-gray-dark/20 border-t-efc-lime" />
        </div>
      ) : (
        <>
          {/* Tarjetas resumen 2 filas x 4 */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card
                  key={card.title}
                  className="overflow-hidden border-efc-gray-dark/10 shadow-sm transition-shadow hover:shadow-md"
                >
                  <CardContent className="flex items-center justify-between p-5">
                    <div>
                      <p className="text-sm font-medium text-efc-gray-dark">
                        {card.title}
                      </p>
                      <p className="mt-1 text-2xl font-bold text-efc-gray-darker">
                        {card.value}
                      </p>
                    </div>
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${card.bgIcon} ${card.iconColor}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Gráficos en dos columnas */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="overflow-hidden border-efc-gray-dark/10 shadow-sm">
              <CardHeader className="border-b border-efc-gray-dark/10 bg-efc-gray-dark/5 px-6 py-4">
                <CardTitle className="text-base font-semibold text-efc-gray-darker">
                  Tickets por fecha
                </CardTitle>
                <p className="text-xs text-efc-gray-dark">Evolución por período</p>
              </CardHeader>
              <CardContent className="px-6 py-6">
                {byDate.length === 0 ? (
                  <div className="flex h-[260px] items-center justify-center text-sm text-efc-gray-dark">
                    No hay tickets registrados
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={byDate} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <XAxis
                        dataKey="fecha"
                        tick={{ fontSize: 11, fill: "#4a5568" }}
                        stroke="#cbd5e0"
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#4a5568" }}
                        stroke="#cbd5e0"
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          border: "1px solid rgba(45,55,72,0.2)",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [value, "Tickets"]}
                      />
                      <Bar
                        dataKey="cantidad"
                        fill="#D3E500"
                        radius={[4, 4, 0, 0]}
                        name="Tickets"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-efc-gray-dark/10 shadow-sm">
              <CardHeader className="border-b border-efc-gray-dark/10 bg-efc-gray-dark/5 px-6 py-4">
                <CardTitle className="text-base font-semibold text-efc-gray-darker">
                  Estado de tickets
                </CardTitle>
                <p className="text-xs text-efc-gray-dark">Distribución actual</p>
              </CardHeader>
              <CardContent className="px-6 py-6">
                {pieData.length === 0 ? (
                  <div className="flex h-[260px] items-center justify-center text-sm text-efc-gray-dark">
                    No hay tickets registrados
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [value, "Tickets"]}
                        contentStyle={{
                          border: "1px solid rgba(45,55,72,0.2)",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
