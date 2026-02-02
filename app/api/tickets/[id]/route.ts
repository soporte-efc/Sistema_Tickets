import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(id, 10) },
    });
    if (!ticket) {
      return NextResponse.json({ error: "Ticket no encontrado" }, { status: 404 });
    }
    return NextResponse.json(ticket);
  } catch (error) {
    console.error("GET /api/tickets/[id] error:", error);
    return NextResponse.json(
      { error: "Error al obtener ticket" },
      { status: 500 }
    );
  }
}

type PatchBody = {
  status?: string;
  agent_name?: string;
  solution?: string;
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as PatchBody;
    const data: Record<string, unknown> = {};
    if (body.status !== undefined) data.status = body.status;
    if (body.agent_name !== undefined) data.agent_name = body.agent_name;
    if (body.solution !== undefined) data.solution = body.solution;
    const ticket = await prisma.ticket.update({
      where: { id: parseInt(id, 10) },
      data,
    });
    return NextResponse.json(ticket);
  } catch (error) {
    console.error("PATCH /api/tickets/[id] error:", error);
    return NextResponse.json(
      { error: "Error al actualizar ticket" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.ticket.delete({
      where: { id: parseInt(id, 10) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tickets/[id] error:", error);
    return NextResponse.json(
      { error: "Error al eliminar ticket" },
      { status: 500 }
    );
  }
}
