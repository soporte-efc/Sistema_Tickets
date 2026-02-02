import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = x.getDate() - day + (day === 0 ? -6 : 1);
  x.setDate(diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfMonth(d: Date) {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function GET() {
  try {
    const now = new Date();
    const hoy = startOfDay(now);
    const semana = startOfWeek(now);
    const mes = startOfMonth(now);

    const [pendientes, total, ticketsHoy, ticketsSemana, ticketsMes] =
      await Promise.all([
        prisma.ticket.count({ where: { status: "pendiente" } }),
        prisma.ticket.count(),
        prisma.ticket.count({
          where: { created_at: { gte: hoy } },
        }),
        prisma.ticket.count({
          where: { created_at: { gte: semana } },
        }),
        prisma.ticket.count({
          where: { created_at: { gte: mes } },
        }),
      ]);
    const cerrados = total - pendientes;

    return NextResponse.json({
      pendientes,
      cerrados,
      total,
      ticketsHoy,
      ticketsSemana,
      ticketsMes,
    });
  } catch (error) {
    console.error("GET /api/tickets/stats error:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
