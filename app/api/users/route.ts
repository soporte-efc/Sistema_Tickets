import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { getOrCreateProfile, canAccessSection } from "@/lib/auth";

export async function GET() {
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
      return NextResponse.json({ error: "Sin permiso para ver usuarios" }, { status: 403 });
    }

    const admin = createAdminClient();
    const {
      data: { users: authUsers },
      error: listError,
    } = await admin.auth.admin.listUsers({ perPage: 500 });
    if (listError) {
      console.error(listError);
      return NextResponse.json(
        { error: "Error al listar usuarios de Auth" },
        { status: 500 }
      );
    }

    const profiles = await prisma.userProfile.findMany();
    const byUserId = new Map(profiles.map((p) => [p.user_id, p]));

    const list = (authUsers ?? []).map((u) => {
      const p = byUserId.get(u.id);
      return {
        user_id: u.id,
        email: u.email ?? "",
        role: p?.role ?? "soporte",
        permissions: p?.permissions ?? ["tickets"],
        created_at: u.created_at,
        has_password: true, // No exponer si tiene o no; en UI mostramos "••••••"
      };
    });

    return NextResponse.json(list);
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { error: "Error al listar usuarios" },
      { status: 500 }
    );
  }
}
