import { CheckoutView, type CheckoutDefaults } from "@/components/tienda/checkout-view";
import { StoreFooter } from "@/components/tienda/store-footer";
import { StoreHeader } from "@/components/tienda/store-header";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Si la persona tiene cuenta, el checkout arranca con sus datos ya cargados. */
async function getDefaults(): Promise<CheckoutDefaults> {
  if (!hasSupabaseEnv()) return {};

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return {};

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, email, phone, shipping_address")
    .eq("id", user.id)
    .single();

  const address = (profile?.shipping_address ?? {}) as { street?: string; zone?: string; notes?: string };

  return {
    clientName: profile?.full_name ?? "",
    clientEmail: profile?.email ?? user.email ?? "",
    clientPhone: profile?.phone ?? "",
    street: address.street ?? "",
    zone: address.zone ?? "",
  };
}

export default async function CheckoutPage() {
  const defaults = await getDefaults();

  return (
    <main className="min-h-screen bg-[#0d0c0f] text-white">
      <StoreHeader />
      <CheckoutView defaults={defaults} />
      <StoreFooter />
    </main>
  );
}
