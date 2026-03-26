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
          custom_domain: string | null
          domain: string | null
          footer_link: string
          footer_text: string
          footer_visible: boolean
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          primary_color: string | null
          secondary_color: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          created_at?: string
          custom_domain?: string | null
          domain?: string | null
          footer_link?: string
          footer_text?: string
          footer_visible?: boolean
          id?: string
          logo_url?: string | null
          name?: string
          owner_id: string
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          created_at?: string
          custom_domain?: string | null
          domain?: string | null
          footer_link?: string
          footer_text?: string
          footer_visible?: boolean
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      agency_settings: {
        Row: {
          agency_id: string
          created_at: string
          default_layout: string
          favicon_url: string | null
          id: string
          onboarding_completed: boolean
          platform_display_name: string
          theme_mode: string
          updated_at: string
        }
        Insert: {
          agency_id: string
          created_at?: string
          default_layout?: string
          favicon_url?: string | null
          id?: string
          onboarding_completed?: boolean
          platform_display_name?: string
          theme_mode?: string
          updated_at?: string
        }
        Update: {
          agency_id?: string
          created_at?: string
          default_layout?: string
          favicon_url?: string | null
          id?: string
          onboarding_completed?: boolean
          platform_display_name?: string
          theme_mode?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_settings_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: true
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          agency_id: string | null
          campaign_id: string | null
          created_at: string
          creator_id: string | null
          event_type: string
          id: string
          link_id: string | null
          metadata: Json | null
        }
        Insert: {
          agency_id?: string | null
          campaign_id?: string | null
          created_at?: string
          creator_id?: string | null
          event_type: string
          id?: string
          link_id?: string | null
          metadata?: Json | null
        }
        Update: {
          agency_id?: string | null
          campaign_id?: string | null
          created_at?: string
          creator_id?: string | null
          event_type?: string
          id?: string
          link_id?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "creator_links"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          agency_id: string | null
          bg_color: string | null
          border_color: string | null
          brand_name: string | null
          creator_id: string
          cta_label: string | null
          description: string | null
          expires_at: string | null
          id: string
          image_url: string | null
          is_active: boolean
          live: boolean | null
          priority_level: number | null
          sort_order: number | null
          spotlight_enabled: boolean | null
          starts_at: string | null
          text_color: string | null
          title: string
          url: string | null
        }
        Insert: {
          agency_id?: string | null
          bg_color?: string | null
          border_color?: string | null
          brand_name?: string | null
          creator_id: string
          cta_label?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          live?: boolean | null
          priority_level?: number | null
          sort_order?: number | null
          spotlight_enabled?: boolean | null
          starts_at?: string | null
          text_color?: string | null
          title?: string
          url?: string | null
        }
        Update: {
          agency_id?: string | null
          bg_color?: string | null
          border_color?: string | null
          brand_name?: string | null
          creator_id?: string
          cta_label?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          live?: boolean | null
          priority_level?: number | null
          sort_order?: number | null
          spotlight_enabled?: boolean | null
          starts_at?: string | null
          text_color?: string | null
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_campaigns_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_campaigns_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      confirmation_codes: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          verified: boolean
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          verified?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          verified?: boolean
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          agency_id: string
          created_at: string
          creator_id: string
          id: string
          is_read: boolean
          message: string
          sender_email: string
          sender_name: string
        }
        Insert: {
          agency_id: string
          created_at?: string
          creator_id: string
          id?: string
          is_read?: boolean
          message?: string
          sender_email?: string
          sender_name?: string
        }
        Update: {
          agency_id?: string
          created_at?: string
          creator_id?: string
          id?: string
          is_read?: boolean
          message?: string
          sender_email?: string
          sender_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_messages_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          current_uses: number
          discount_percent: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          updated_at: string
          valid_plans: string[]
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number
          discount_percent: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
          valid_plans?: string[]
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number
          discount_percent?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
          valid_plans?: string[]
        }
        Relationships: []
      }
      creator_hero_reels: {
        Row: {
          aspect_ratio: string
          created_at: string | null
          creator_id: string
          cta_label: string | null
          cta_url: string | null
          id: string
          is_active: boolean
          playback_mode: string
          sort_order: number | null
          subtitle: string | null
          thumbnail_url: string | null
          title: string
          video_url: string
        }
        Insert: {
          aspect_ratio?: string
          created_at?: string | null
          creator_id: string
          cta_label?: string | null
          cta_url?: string | null
          id?: string
          is_active?: boolean
          playback_mode?: string
          sort_order?: number | null
          subtitle?: string | null
          thumbnail_url?: string | null
          title?: string
          video_url?: string
        }
        Update: {
          aspect_ratio?: string
          created_at?: string | null
          creator_id?: string
          cta_label?: string | null
          cta_url?: string | null
          id?: string
          is_active?: boolean
          playback_mode?: string
          sort_order?: number | null
          subtitle?: string | null
          thumbnail_url?: string | null
          title?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_hero_reels_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_links: {
        Row: {
          bg_color: string | null
          border_color: string | null
          created_at: string
          creator_id: string
          display_mode: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          sort_order: number | null
          subtitle: string | null
          text_color: string | null
          title: string
          url: string
        }
        Insert: {
          bg_color?: string | null
          border_color?: string | null
          created_at?: string
          creator_id: string
          display_mode?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          sort_order?: number | null
          subtitle?: string | null
          text_color?: string | null
          title?: string
          url?: string
        }
        Update: {
          bg_color?: string | null
          border_color?: string | null
          created_at?: string
          creator_id?: string
          display_mode?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          sort_order?: number | null
          subtitle?: string | null
          text_color?: string | null
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
          bg_color: string | null
          border_color: string | null
          creator_id: string
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean
          price: string | null
          sort_order: number | null
          text_color: string | null
          title: string
          url: string | null
        }
        Insert: {
          bg_color?: string | null
          border_color?: string | null
          creator_id: string
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          price?: string | null
          sort_order?: number | null
          text_color?: string | null
          title?: string
          url?: string | null
        }
        Update: {
          bg_color?: string | null
          border_color?: string | null
          creator_id?: string
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          price?: string | null
          sort_order?: number | null
          text_color?: string | null
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
      creator_templates: {
        Row: {
          agency_id: string
          created_at: string
          creator_id: string | null
          id: string
          is_default: boolean
          name: string
          template_data: Json
          updated_at: string
        }
        Insert: {
          agency_id: string
          created_at?: string
          creator_id?: string | null
          id?: string
          is_default?: boolean
          name?: string
          template_data?: Json
          updated_at?: string
        }
        Update: {
          agency_id?: string
          created_at?: string
          creator_id?: string | null
          id?: string
          is_default?: boolean
          name?: string
          template_data?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_templates_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_templates_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_testimonials: {
        Row: {
          author_avatar_url: string | null
          author_name: string
          author_role: string | null
          content: string
          created_at: string
          creator_id: string
          id: string
          is_active: boolean
          rating: number | null
          sort_order: number | null
        }
        Insert: {
          author_avatar_url?: string | null
          author_name?: string
          author_role?: string | null
          content?: string
          created_at?: string
          creator_id: string
          id?: string
          is_active?: boolean
          rating?: number | null
          sort_order?: number | null
        }
        Update: {
          author_avatar_url?: string | null
          author_name?: string
          author_role?: string | null
          content?: string
          created_at?: string
          creator_id?: string
          id?: string
          is_active?: boolean
          rating?: number | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_testimonials_creator_id_fkey"
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
          brands_display_mode: string
          category: string | null
          color_bio: string | null
          color_name: string | null
          color_section_titles: string | null
          contact_enabled: boolean
          cover_url: string | null
          cover_url_layout2: string | null
          created_at: string
          font_family: string
          font_size: string
          id: string
          image_shape: string
          image_shape_campaigns: string
          image_shape_links: string
          image_shape_products: string
          is_published: boolean
          layout_type: string
          name: string
          page_effects: Json | null
          section_order: Json
          slug: string
          slug_changed_at: string | null
          spotify_url: string | null
          stats: Json | null
          tags: Json | null
          updated_at: string
          user_id: string | null
          verified: boolean | null
        }
        Insert: {
          agency_id?: string | null
          avatar_url?: string | null
          avatar_url_layout2?: string | null
          bio?: string | null
          brands?: Json | null
          brands_display_mode?: string
          category?: string | null
          color_bio?: string | null
          color_name?: string | null
          color_section_titles?: string | null
          contact_enabled?: boolean
          cover_url?: string | null
          cover_url_layout2?: string | null
          created_at?: string
          font_family?: string
          font_size?: string
          id?: string
          image_shape?: string
          image_shape_campaigns?: string
          image_shape_links?: string
          image_shape_products?: string
          is_published?: boolean
          layout_type?: string
          name?: string
          page_effects?: Json | null
          section_order?: Json
          slug?: string
          slug_changed_at?: string | null
          spotify_url?: string | null
          stats?: Json | null
          tags?: Json | null
          updated_at?: string
          user_id?: string | null
          verified?: boolean | null
        }
        Update: {
          agency_id?: string | null
          avatar_url?: string | null
          avatar_url_layout2?: string | null
          bio?: string | null
          brands?: Json | null
          brands_display_mode?: string
          category?: string | null
          color_bio?: string | null
          color_name?: string | null
          color_section_titles?: string | null
          contact_enabled?: boolean
          cover_url?: string | null
          cover_url_layout2?: string | null
          created_at?: string
          font_family?: string
          font_size?: string
          id?: string
          image_shape?: string
          image_shape_campaigns?: string
          image_shape_links?: string
          image_shape_products?: string
          is_published?: boolean
          layout_type?: string
          name?: string
          page_effects?: Json | null
          section_order?: Json
          slug?: string
          slug_changed_at?: string | null
          spotify_url?: string | null
          stats?: Json | null
          tags?: Json | null
          updated_at?: string
          user_id?: string | null
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
      plan_limits: {
        Row: {
          allow_analytics: boolean
          allow_custom_colors: boolean
          allow_custom_domain: boolean
          allow_layout_immersive: boolean
          allow_page_effects: boolean
          allow_remove_branding: boolean
          allow_team_members: boolean
          allow_verified_badge: boolean
          id: string
          max_campaigns: number
          max_creators: number
          max_hero_reels: number
          max_links: number
          max_products: number
          plan: Database["public"]["Enums"]["plan_type"]
        }
        Insert: {
          allow_analytics?: boolean
          allow_custom_colors?: boolean
          allow_custom_domain?: boolean
          allow_layout_immersive?: boolean
          allow_page_effects?: boolean
          allow_remove_branding?: boolean
          allow_team_members?: boolean
          allow_verified_badge?: boolean
          id?: string
          max_campaigns?: number
          max_creators?: number
          max_hero_reels?: number
          max_links?: number
          max_products?: number
          plan: Database["public"]["Enums"]["plan_type"]
        }
        Update: {
          allow_analytics?: boolean
          allow_custom_colors?: boolean
          allow_custom_domain?: boolean
          allow_layout_immersive?: boolean
          allow_page_effects?: boolean
          allow_remove_branding?: boolean
          allow_team_members?: boolean
          allow_verified_badge?: boolean
          id?: string
          max_campaigns?: number
          max_creators?: number
          max_hero_reels?: number
          max_links?: number
          max_products?: number
          plan?: Database["public"]["Enums"]["plan_type"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          agency_id: string | null
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          referral_code: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          agency_id?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id: string
          referral_code?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          agency_id?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          referral_code?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          converted_at: string | null
          created_at: string
          id: string
          referred_email: string | null
          referred_user_id: string | null
          referrer_user_id: string
          status: string
        }
        Insert: {
          converted_at?: string | null
          created_at?: string
          id?: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_user_id: string
          status?: string
        }
        Update: {
          converted_at?: string | null
          created_at?: string
          id?: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_user_id?: string
          status?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          agency_id: string
          created_at: string
          expires_at: string | null
          id: string
          payment_id: string | null
          payment_provider: string | null
          plan: Database["public"]["Enums"]["plan_type"]
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          agency_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          payment_id?: string | null
          payment_provider?: string | null
          plan?: Database["public"]["Enums"]["plan_type"]
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          agency_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          payment_id?: string | null
          payment_provider?: string | null
          plan?: Database["public"]["Enums"]["plan_type"]
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: true
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          agency_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          agency_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          agency_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_agency_id_fkey"
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
      current_user_agency_id: { Args: never; Returns: string }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_agency_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "owner" | "admin" | "editor" | "viewer"
      plan_type: "free" | "pro" | "scale"
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
    Enums: {
      app_role: ["owner", "admin", "editor", "viewer"],
      plan_type: ["free", "pro", "scale"],
    },
  },
} as const
