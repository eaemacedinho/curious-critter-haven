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

interface TenantContextType {
  agency: Agency | null;
  loading: boolean;
  updateAgency: (updates: Partial<Agency>) => Promise<void>;
  refetch: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType>({
  agency: null,
  loading: true,
  updateAgency: async () => {},
  refetch: async () => {},
});

export function TenantProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAgency = useCallback(async () => {
    if (!user) {
      setAgency(null);
      setLoading(false);
      return;
    }

    setLoading(true);

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
      // Create agency for existing users who don't have one
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
      }
      setLoading(false);
      return;
    }

    setAgency(data as Agency);
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

  return (
    <TenantContext.Provider value={{ agency, loading, updateAgency, refetch: fetchAgency }}>
      {children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => useContext(TenantContext);
