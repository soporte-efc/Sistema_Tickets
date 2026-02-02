import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type PostBody = {
  caller_name: string;
  call_duration: string;
  raw_text: string;
  agent_name?: string;
};

function parseRawText(raw_text: string): {
  subject: string;
  ticket_type: string;
  solution: string;
  site: string;
} {
  const parts = raw_text.split(",").map((p) => p.trim());
  return {
    subject: parts[0] ?? "",
    ticket_type: parts[1] ?? "",
    solution: parts[2] ?? "",
    site: parts[3] ?? "",
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? "all";
    const search = searchParams.get("search") ?? "";
    const sort = searchParams.get("sort") ?? "desc";
    const dateFrom = searchParams.get("dateFrom") ?? "";
    const dateTo = searchParams.get("dateTo") ?? "";

    const where: Record<string, unknown> = {};
    if (status && status !== "all") {
      where.status = status;
    }
    if (search.trim()) {
      const q = search.trim();
      const idNum = parseInt(q.replace(/^0+/, "") || "0", 10);
      const isNumeric = !Number.isNaN(idNum) && idNum > 0;
      where.OR = [
        ...(isNumeric ? [{ id: idNum }] : []),
        { caller_name: { contains: q, mode: "insensitive" } },
        { subject: { contains: q, mode: "insensitive" } },
        { agent_name: { contains: q, mode: "insensitive" } },
      ].filter(Boolean);
    }
    if (dateFrom || dateTo) {
      const dateFilter: { gte?: Date; lte?: Date } = {};
      if (dateFrom) dateFilter.gte = new Date(dateFrom + "T00:00:00.000Z");
      if (dateTo) dateFilter.lte = new Date(dateTo + "T23:59:59.999Z");
      where.created_at = dateFilter;
    }

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { created_at: sort === "asc" ? "asc" : "desc" },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("GET /api/tickets error:", error);
    return NextResponse.json(
      { error: "Error al listar tickets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PostBody;
    const { caller_name, call_duration, raw_text } = body;

    if (!caller_name || !call_duration || !raw_text) {
      return NextResponse.json(
        { error: "Faltan campos: caller_name, call_duration, raw_text" },
        { status: 400 }
      );
    }

    const { subject, ticket_type, solution, site } = parseRawText(raw_text);
    const agent_name = body.agent_name?.trim() || null;

    const ticket = await prisma.ticket.create({
      data: {
        caller_name,
        call_duration,
        raw_text,
        subject,
        ticket_type,
        solution,
        site,
        agent_name,
      },
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("POST /api/tickets error:", error);
    return NextResponse.json(
      { error: "Error al crear ticket" },
      { status: 500 }
    );
  }
}
