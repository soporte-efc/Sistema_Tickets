import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateProfile, canAccessSection } from "@/lib/auth";

export default async function UsuariosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getOrCreateProfile(user.id, user.email ?? "");
  if (!canAccessSection(profile.permissions, profile.role, "usuarios")) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
