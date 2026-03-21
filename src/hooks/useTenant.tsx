import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Agency {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  logo_url: string;
  primary_color: string;
  accent_color: string;
  domain: string;
  footer_text: string;
  footer_visible: boolean;
  footer_link: string;
}

export interface AgencySettings {
  id: string;
  agency_id: string;
  platform_display_name: string;
  favicon_url: string;
  default_layout: string;
  onboarding_completed: boolean;
  theme_mode: string;
}

export type UserRole = "owner" | "admin" | "editor" | "viewer";

interface TenantContextType {
  agency: Agency | null;
  settings: AgencySettings | null;
  userRole: UserRole | null;
  loading: boolean;
  updateAgency: (updates: Partial<Agency>) => Promise<void>;
  updateSettings: (updates: Partial<AgencySettings>) => Promise<void>;
  refetch: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType>({
  agency: null,
  settings: null,
  userRole: null,
  loading: true,
  updateAgency: async () => {},
  updateSettings: async () => {},
  refetch: async () => {},
});

export function TenantProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [settings, setSettings] = useState<AgencySettings | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAgency = useCallback(async () => {
    if (!user) {
      setAgency(null);
      setSettings(null);
      setUserRole(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Try profiles first (new schema), fallback to user_roles
    const { data: profileData } = await supabase
      .from("profiles")
      .select("agency_id, role")
      .eq("id", user.id)
      .maybeSingle();

    const roleSource = profileData || await supabase
      .from("user_roles")
      .select("agency_id, role")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle()
      .then(r => r.data);

    if (roleSource) {
      setUserRole(roleSource.role as UserRole);

      const [agencyRes, settingsRes] = await Promise.all([
        supabase.from("agencies").select("*").eq("id", roleSource.agency_id).maybeSingle(),
        supabase.from("agency_settings").select("*").eq("agency_id", roleSource.agency_id).maybeSingle(),
      ]);

      if (agencyRes.data) setAgency(agencyRes.data as Agency);
      if (settingsRes.data) setSettings(settingsRes.data as AgencySettings);

      setLoading(false);
      return;
    }

    // Fallback: try legacy owner_id lookup
    const { data, error } = await supabase
      .from("agencies")
      .select("*")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching agency:", error);
      setLoading(false);
      return;
    }

    if (!data) {
      // Create agency for new users
      const { data: newAgency, error: createError } = await supabase
        .from("agencies")
        .insert({
          owner_id: user.id,
          name: user.user_metadata?.full_name || "Minha Agência",
          slug: (user.email || user.id).replace("@", "-").replace(/\./g, "-").toLowerCase(),
        })
        .select("*")
        .single();

      if (createError) {
        console.error("Error creating agency:", createError);
      } else {
        setAgency(newAgency as Agency);
        setUserRole("owner");
      }
      setLoading(false);
      return;
    }

    setAgency(data as Agency);
    setUserRole("owner");
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void fetchAgency();
  }, [fetchAgency]);

  const updateAgency = async (updates: Partial<Agency>) => {
    if (!agency) return;
    const { data, error } = await supabase
      .from("agencies")
      .update(updates as any)
      .eq("id", agency.id)
      .select("*")
      .single();

    if (error) throw error;
    setAgency(data as Agency);
  };

  const updateSettings = async (updates: Partial<AgencySettings>) => {
    if (!agency) return;
    const { data, error } = await supabase
      .from("agency_settings")
      .update(updates as any)
      .eq("agency_id", agency.id)
      .select("*")
      .single();

    if (error) throw error;
    setSettings(data as AgencySettings);
  };

  return (
    <TenantContext.Provider value={{ agency, settings, userRole, loading, updateAgency, updateSettings, refetch: fetchAgency }}>
      {children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => useContext(TenantContext);
