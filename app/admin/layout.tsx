import { PanelShell } from "@/components/admin/panel-shell";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("users")
    .select("full_name, role")
    .eq("id", user?.id)
    .single();

  return (
    <PanelShell
      userLabel={profile?.full_name ?? user?.email ?? "Usuario"}
      role={profile?.role ?? "sin rol"}
    >
      {children}
    </PanelShell>
  );
}
