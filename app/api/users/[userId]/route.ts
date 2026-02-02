import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateProfile, canAccessSection } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    if (!currentUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const profile = await getOrCreateProfile(
      currentUser.id,
      currentUser.email ?? ""
    );
    if (!canAccessSection(profile.permissions, profile.role, "usuarios")) {
      return NextResponse.json(
        { error: "Sin permiso para editar usuarios" },
        { status: 403 }
      );
    }

    const { userId } = await params;
    const body = await request.json();
    const { role, permissions } = body as {
      role?: string;
      permissions?: string[];
    };

    const existing = await prisma.userProfile.findUnique({
      where: { user_id: userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Perfil de usuario no encontrado" },
        { status: 404 }
      );
    }

    const updated = await prisma.userProfile.update({
      where: { user_id: userId },
      data: {
        ...(role != null && { role }),
        ...(permissions != null && { permissions }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/users/[userId] error:", error);
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}
