export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      agencies: {
        Row: {
          accent_color: string | null
          created_at: string
          domain: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          primary_color: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id: string
          primary_color?: string | null
          slug?: string
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          primary_color?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      campaign_clicks: {
        Row: {
          campaign_id: string
          clicked_at: string
          id: string
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          campaign_id: string
          clicked_at?: string
          id?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          campaign_id?: string
          clicked_at?: string
          id?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_clicks_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "creator_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_campaigns: {
        Row: {
          creator_id: string
          description: string | null
          expires_at: string | null
          id: string
          image_url: string | null
          live: boolean | null
          sort_order: number | null
          title: string
          url: string | null
        }
        Insert: {
          creator_id: string
          description?: string | null
          expires_at?: string | null
          id?: string
          image_url?: string | null
          live?: boolean | null
          sort_order?: number | null
          title?: string
          url?: string | null
        }
        Update: {
          creator_id?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          image_url?: string | null
          live?: boolean | null
          sort_order?: number | null
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_campaigns_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_links: {
        Row: {
          active: boolean | null
          created_at: string
          creator_id: string
          featured: boolean | null
          icon: string | null
          id: string
          sort_order: number | null
          subtitle: string | null
          title: string
          url: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          creator_id: string
          featured?: boolean | null
          icon?: string | null
          id?: string
          sort_order?: number | null
          subtitle?: string | null
          title?: string
          url?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          creator_id?: string
          featured?: boolean | null
          icon?: string | null
          id?: string
          sort_order?: number | null
          subtitle?: string | null
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_links_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_products: {
        Row: {
          creator_id: string
          icon: string | null
          id: string
          image_url: string | null
          price: string | null
          sort_order: number | null
          title: string
          url: string | null
        }
        Insert: {
          creator_id: string
          icon?: string | null
          id?: string
          image_url?: string | null
          price?: string | null
          sort_order?: number | null
          title?: string
          url?: string | null
        }
        Update: {
          creator_id?: string
          icon?: string | null
          id?: string
          image_url?: string | null
          price?: string | null
          sort_order?: number | null
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_products_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_social_links: {
        Row: {
          creator_id: string
          id: string
          label: string | null
          platform: string
          sort_order: number | null
          url: string
        }
        Insert: {
          creator_id: string
          id?: string
          label?: string | null
          platform?: string
          sort_order?: number | null
          url?: string
        }
        Update: {
          creator_id?: string
          id?: string
          label?: string | null
          platform?: string
          sort_order?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_social_links_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creators: {
        Row: {
          agency_id: string | null
          avatar_url: string | null
          avatar_url_layout2: string | null
          bio: string | null
          brands: Json | null
          cover_url: string | null
          cover_url_layout2: string | null
          created_at: string
          handle: string
          id: string
          image_shape: string
          image_shape_campaigns: string
          image_shape_links: string
          image_shape_products: string
          name: string
          public_layout: string
          stats: Json | null
          tags: Json | null
          updated_at: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          agency_id?: string | null
          avatar_url?: string | null
          avatar_url_layout2?: string | null
          bio?: string | null
          brands?: Json | null
          cover_url?: string | null
          cover_url_layout2?: string | null
          created_at?: string
          handle?: string
          id?: string
          image_shape?: string
          image_shape_campaigns?: string
          image_shape_links?: string
          image_shape_products?: string
          name?: string
          public_layout?: string
          stats?: Json | null
          tags?: Json | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          agency_id?: string | null
          avatar_url?: string | null
          avatar_url_layout2?: string | null
          bio?: string | null
          brands?: Json | null
          cover_url?: string | null
          cover_url_layout2?: string | null
          created_at?: string
          handle?: string
          id?: string
          image_shape?: string
          image_shape_campaigns?: string
          image_shape_links?: string
          image_shape_products?: string
          name?: string
          public_layout?: string
          stats?: Json | null
          tags?: Json | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "creators_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
