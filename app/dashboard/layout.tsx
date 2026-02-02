import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getOrCreateProfile } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const profile = await getOrCreateProfile(
    user.id,
    user.email ?? ""
  );

  return (
    <DashboardShell
      userEmail={user.email ?? null}
      userName={user.user_metadata?.full_name ?? user.user_metadata?.name ?? null}
      userRole={profile.role}
      userPermissions={profile.permissions}
    >
      {children}
    </DashboardShell>
  );
}
