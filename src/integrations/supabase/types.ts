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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_personas: {
        Row: {
          actions: Json
          avatar_url: string | null
          club_id: string
          configured: boolean
          created_at: string
          description: string | null
          enabled: boolean
          escalation: Json
          expert_name: string | null
          expertise: string[]
          greeting: string | null
          id: string
          identity_mode: string
          instructions: string | null
          member_context: Json
          name: string | null
          personality: string | null
          recommend_allow: string[]
          recommend_products: boolean
          should_answer: string[]
          should_not_answer: string[]
          sources: Json
          title: string | null
          tone: string | null
          updated_at: string
        }
        Insert: {
          actions?: Json
          avatar_url?: string | null
          club_id: string
          configured?: boolean
          created_at?: string
          description?: string | null
          enabled?: boolean
          escalation?: Json
          expert_name?: string | null
          expertise?: string[]
          greeting?: string | null
          id?: string
          identity_mode?: string
          instructions?: string | null
          member_context?: Json
          name?: string | null
          personality?: string | null
          recommend_allow?: string[]
          recommend_products?: boolean
          should_answer?: string[]
          should_not_answer?: string[]
          sources?: Json
          title?: string | null
          tone?: string | null
          updated_at?: string
        }
        Update: {
          actions?: Json
          avatar_url?: string | null
          club_id?: string
          configured?: boolean
          created_at?: string
          description?: string | null
          enabled?: boolean
          escalation?: Json
          expert_name?: string | null
          expertise?: string[]
          greeting?: string | null
          id?: string
          identity_mode?: string
          instructions?: string | null
          member_context?: Json
          name?: string | null
          personality?: string | null
          recommend_allow?: string[]
          recommend_products?: boolean
          should_answer?: string[]
          should_not_answer?: string[]
          sources?: Json
          title?: string | null
          tone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_personas_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: true
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      aiva_activity: {
        Row: {
          body: string | null
          club_id: string
          created_at: string
          detail: Json
          dismissed_at: string | null
          entity_refs: Json
          id: string
          is_demo: boolean
          seen_at: string | null
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          club_id: string
          created_at?: string
          detail?: Json
          dismissed_at?: string | null
          entity_refs?: Json
          id?: string
          is_demo?: boolean
          seen_at?: string | null
          status?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          club_id?: string
          created_at?: string
          detail?: Json
          dismissed_at?: string | null
          entity_refs?: Json
          id?: string
          is_demo?: boolean
          seen_at?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aiva_activity_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      aiva_build_plan_items: {
        Row: {
          builder: string | null
          builder_input: Json
          building_text: string | null
          category: string
          club_id: string
          created_at: string
          description: string | null
          done_text: string | null
          edit_to: string | null
          id: string
          label: string
          origin: string
          plan_id: string
          position: number
          recommended: boolean
          required: boolean
          result: Json | null
          selected: boolean
          status: string
          updated_at: string
        }
        Insert: {
          builder?: string | null
          builder_input?: Json
          building_text?: string | null
          category: string
          club_id: string
          created_at?: string
          description?: string | null
          done_text?: string | null
          edit_to?: string | null
          id?: string
          label: string
          origin?: string
          plan_id: string
          position?: number
          recommended?: boolean
          required?: boolean
          result?: Json | null
          selected?: boolean
          status?: string
          updated_at?: string
        }
        Update: {
          builder?: string | null
          builder_input?: Json
          building_text?: string | null
          category?: string
          club_id?: string
          created_at?: string
          description?: string | null
          done_text?: string | null
          edit_to?: string | null
          id?: string
          label?: string
          origin?: string
          plan_id?: string
          position?: number
          recommended?: boolean
          required?: boolean
          result?: Json | null
          selected?: boolean
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aiva_build_plan_items_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aiva_build_plan_items_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "aiva_build_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      aiva_build_plans: {
        Row: {
          club_id: string
          completed_at: string | null
          created_at: string
          cta: string | null
          id: string
          intro: string | null
          kind: string
          phase: string
          return_label: string | null
          return_to: string | null
          status: Database["public"]["Enums"]["build_plan_status"]
          updated_at: string
        }
        Insert: {
          club_id: string
          completed_at?: string | null
          created_at?: string
          cta?: string | null
          id?: string
          intro?: string | null
          kind?: string
          phase?: string
          return_label?: string | null
          return_to?: string | null
          status?: Database["public"]["Enums"]["build_plan_status"]
          updated_at?: string
        }
        Update: {
          club_id?: string
          completed_at?: string | null
          created_at?: string
          cta?: string | null
          id?: string
          intro?: string | null
          kind?: string
          phase?: string
          return_label?: string | null
          return_to?: string | null
          status?: Database["public"]["Enums"]["build_plan_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aiva_build_plans_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      aiva_opportunities: {
        Row: {
          action: string | null
          audience: number
          build_from: Json
          build_href: string | null
          can_do: Json
          club_id: string
          confidence: number
          connections: Json
          created_at: string
          decided_at: string | null
          evidence: Json
          id: string
          impact: number
          insight: string | null
          is_demo: boolean
          kind: string
          monetization: Json
          noticed: string | null
          signal: string | null
          status: Database["public"]["Enums"]["opportunity_status"]
          suggested_summary: string | null
          suggested_title: string | null
          topic: string
          updated_at: string
          why: string | null
          window_days: number
        }
        Insert: {
          action?: string | null
          audience?: number
          build_from?: Json
          build_href?: string | null
          can_do?: Json
          club_id: string
          confidence?: number
          connections?: Json
          created_at?: string
          decided_at?: string | null
          evidence?: Json
          id?: string
          impact?: number
          insight?: string | null
          is_demo?: boolean
          kind: string
          monetization?: Json
          noticed?: string | null
          signal?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          suggested_summary?: string | null
          suggested_title?: string | null
          topic: string
          updated_at?: string
          why?: string | null
          window_days?: number
        }
        Update: {
          action?: string | null
          audience?: number
          build_from?: Json
          build_href?: string | null
          can_do?: Json
          club_id?: string
          confidence?: number
          connections?: Json
          created_at?: string
          decided_at?: string | null
          evidence?: Json
          id?: string
          impact?: number
          insight?: string | null
          is_demo?: boolean
          kind?: string
          monetization?: Json
          noticed?: string | null
          signal?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          suggested_summary?: string | null
          suggested_title?: string | null
          topic?: string
          updated_at?: string
          why?: string | null
          window_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "aiva_opportunities_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      aiva_recommendations: {
        Row: {
          applied_at: string | null
          club_id: string
          confidence: number
          created_at: string
          id: string
          placement: string
          reason: string | null
          source_node_id: string
          source_title: string | null
          status: Database["public"]["Enums"]["reco_status"]
          target_node_id: string
          target_title: string | null
          type: string
          updated_at: string
        }
        Insert: {
          applied_at?: string | null
          club_id: string
          confidence?: number
          created_at?: string
          id?: string
          placement?: string
          reason?: string | null
          source_node_id: string
          source_title?: string | null
          status?: Database["public"]["Enums"]["reco_status"]
          target_node_id: string
          target_title?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          applied_at?: string | null
          club_id?: string
          confidence?: number
          created_at?: string
          id?: string
          placement?: string
          reason?: string | null
          source_node_id?: string
          source_title?: string | null
          status?: Database["public"]["Enums"]["reco_status"]
          target_node_id?: string
          target_title?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aiva_recommendations_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      aiva_signals: {
        Row: {
          club_id: string
          created_at: string
          id: string
          is_demo: boolean
          kind: string
          node_id: string | null
          occurred_at: string
          text: string | null
          topics: string[]
          user_id: string | null
        }
        Insert: {
          club_id: string
          created_at?: string
          id?: string
          is_demo?: boolean
          kind: string
          node_id?: string | null
          occurred_at?: string
          text?: string | null
          topics?: string[]
          user_id?: string | null
        }
        Update: {
          club_id?: string
          created_at?: string
          id?: string
          is_demo?: boolean
          kind?: string
          node_id?: string | null
          occurred_at?: string
          text?: string | null
          topics?: string[]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aiva_signals_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      app_runs: {
        Row: {
          app_id: string
          club_id: string
          created_at: string
          id: string
          inputs: Json
          outputs: Json
          user_id: string | null
        }
        Insert: {
          app_id: string
          club_id: string
          created_at?: string
          id?: string
          inputs?: Json
          outputs?: Json
          user_id?: string | null
        }
        Update: {
          app_id?: string
          club_id?: string
          created_at?: string
          id?: string
          inputs?: Json
          outputs?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_runs_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_runs_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      app_installs: {
        Row: {
          app_id: string | null
          author_net_cents: number
          club_id: string
          gross_cents: number
          id: string
          installed_at: string
          listing_id: string
          order_id: string | null
          platform_fee_cents: number
          revoked_at: string | null
          version: number
        }
        Insert: {
          app_id?: string | null
          author_net_cents?: number
          club_id: string
          gross_cents?: number
          id?: string
          installed_at?: string
          listing_id: string
          order_id?: string | null
          platform_fee_cents?: number
          revoked_at?: string | null
          version?: number
        }
        Update: {
          app_id?: string | null
          author_net_cents?: number
          club_id?: string
          gross_cents?: number
          id?: string
          installed_at?: string
          listing_id?: string
          order_id?: string | null
          platform_fee_cents?: number
          revoked_at?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "app_installs_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "app_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_installs_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_installs_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_installs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      app_listings: {
        Row: {
          author_club_id: string
          category: string
          changelog: string | null
          config: Json
          description: string
          details: string | null
          icon: string
          id: string
          installs: number
          kind: string
          name: string
          pricing: Json
          published_at: string
          rating: number | null
          rating_count: number
          schema: Json
          source_app_id: string | null
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          author_club_id: string
          category?: string
          changelog?: string | null
          config?: Json
          description?: string
          details?: string | null
          icon?: string
          id?: string
          installs?: number
          kind: string
          name: string
          pricing?: Json
          published_at?: string
          rating?: number | null
          rating_count?: number
          schema?: Json
          source_app_id?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          author_club_id?: string
          category?: string
          changelog?: string | null
          config?: Json
          description?: string
          details?: string | null
          icon?: string
          id?: string
          installs?: number
          kind?: string
          name?: string
          pricing?: Json
          published_at?: string
          rating?: number | null
          rating_count?: number
          schema?: Json
          source_app_id?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "app_listings_author_club_id_fkey"
            columns: ["author_club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_listings_source_app_id_fkey"
            columns: ["source_app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
        ]
      }
      apps: {
        Row: {
          access: Json
          club_id: string
          config: Json
          context_refs: Json
          created_at: string
          description: string
          icon: string
          id: string
          kind: string
          listed: boolean
          listing_id: string | null
          listing_version: number | null
          name: string
          pricing: Json | null
          prompt: string | null
          schema: Json
          source: string
          status: Database["public"]["Enums"]["content_status"]
          template_id: string | null
          updated_at: string
        }
        Insert: {
          access?: Json
          club_id: string
          config?: Json
          context_refs?: Json
          created_at?: string
          description?: string
          icon?: string
          id?: string
          kind: string
          listed?: boolean
          listing_id?: string | null
          listing_version?: number | null
          name: string
          pricing?: Json | null
          prompt?: string | null
          schema?: Json
          source?: string
          status?: Database["public"]["Enums"]["content_status"]
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          access?: Json
          club_id?: string
          config?: Json
          context_refs?: Json
          created_at?: string
          description?: string
          icon?: string
          id?: string
          kind?: string
          listed?: boolean
          listing_id?: string | null
          listing_version?: number | null
          name?: string
          pricing?: Json | null
          prompt?: string | null
          schema?: Json
          source?: string
          status?: Database["public"]["Enums"]["content_status"]
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "apps_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      checkout_sessions: {
        Row: {
          amount_cents: number
          checkout_url: string | null
          club_id: string
          completed_at: string | null
          created_at: string
          currency: string
          expires_at: string
          failure_reason: string | null
          id: string
          interval: string | null
          metadata: Json
          offer_id: string | null
          order_id: string | null
          payee_club_id: string | null
          platform_fee_cents: number
          product_id: string | null
          product_key: string
          product_kind: string
          provider: string
          provider_ref: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents?: number
          checkout_url?: string | null
          club_id: string
          completed_at?: string | null
          created_at?: string
          currency?: string
          expires_at?: string
          failure_reason?: string | null
          id?: string
          interval?: string | null
          metadata?: Json
          offer_id?: string | null
          order_id?: string | null
          payee_club_id?: string | null
          platform_fee_cents?: number
          product_id?: string | null
          product_key: string
          product_kind: string
          provider?: string
          provider_ref?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          checkout_url?: string | null
          club_id?: string
          completed_at?: string | null
          created_at?: string
          currency?: string
          expires_at?: string
          failure_reason?: string | null
          id?: string
          interval?: string | null
          metadata?: Json
          offer_id?: string | null
          order_id?: string | null
          payee_club_id?: string | null
          platform_fee_cents?: number
          product_id?: string | null
          product_key?: string
          product_kind?: string
          provider?: string
          provider_ref?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkout_sessions_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_sessions_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_sessions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      club_memberships: {
        Row: {
          club_id: string
          created_at: string
          id: string
          joined_at: string
          plan: string | null
          role: Database["public"]["Enums"]["club_role"]
          status: Database["public"]["Enums"]["membership_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          club_id: string
          created_at?: string
          id?: string
          joined_at?: string
          plan?: string | null
          role?: Database["public"]["Enums"]["club_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          club_id?: string
          created_at?: string
          id?: string
          joined_at?: string
          plan?: string | null
          role?: Database["public"]["Enums"]["club_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_memberships_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      club_navigation: {
        Row: {
          club_id: string
          created_at: string
          id: string
          items: Json
          updated_at: string
        }
        Insert: {
          club_id: string
          created_at?: string
          id?: string
          items?: Json
          updated_at?: string
        }
        Update: {
          club_id?: string
          created_at?: string
          id?: string
          items?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_navigation_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: true
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          branding: Json
          category: string | null
          cover_url: string | null
          created_at: string
          currency: string
          id: string
          is_demo: boolean
          name: string
          owner_id: string
          price_cents: number
          published_at: string | null
          settings: Json
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          tagline: string | null
          tags: string[]
          updated_at: string
          visibility: Database["public"]["Enums"]["club_visibility"]
        }
        Insert: {
          branding?: Json
          category?: string | null
          cover_url?: string | null
          created_at?: string
          currency?: string
          id?: string
          is_demo?: boolean
          name: string
          owner_id: string
          price_cents?: number
          published_at?: string | null
          settings?: Json
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          tagline?: string | null
          tags?: string[]
          updated_at?: string
          visibility?: Database["public"]["Enums"]["club_visibility"]
        }
        Update: {
          branding?: Json
          category?: string | null
          cover_url?: string | null
          created_at?: string
          currency?: string
          id?: string
          is_demo?: boolean
          name?: string
          owner_id?: string
          price_cents?: number
          published_at?: string | null
          settings?: Json
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          tagline?: string | null
          tags?: string[]
          updated_at?: string
          visibility?: Database["public"]["Enums"]["club_visibility"]
        }
        Relationships: []
      }
      coaching_enrollments: {
        Row: {
          club_id: string
          coach_id: string | null
          created_at: string
          ended_at: string | null
          id: string
          intake: Json
          program_id: string | null
          stage: string | null
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          club_id: string
          coach_id?: string | null
          created_at?: string
          ended_at?: string | null
          id?: string
          intake?: Json
          program_id?: string | null
          stage?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          club_id?: string
          coach_id?: string | null
          created_at?: string
          ended_at?: string | null
          id?: string
          intake?: Json
          program_id?: string | null
          stage?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaching_enrollments_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_enrollments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "coaching_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_goals: {
        Row: {
          club_id: string
          created_at: string
          current: number
          due_date: string | null
          enrollment_id: string | null
          id: string
          metric_label: string | null
          status: string
          target: number | null
          title: string
          unit: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          club_id: string
          created_at?: string
          current?: number
          due_date?: string | null
          enrollment_id?: string | null
          id?: string
          metric_label?: string | null
          status?: string
          target?: number | null
          title: string
          unit?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          club_id?: string
          created_at?: string
          current?: number
          due_date?: string | null
          enrollment_id?: string | null
          id?: string
          metric_label?: string | null
          status?: string
          target?: number | null
          title?: string
          unit?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coaching_goals_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_goals_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "coaching_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_notes: {
        Row: {
          author_id: string | null
          body: string
          club_id: string
          created_at: string
          enrollment_id: string | null
          id: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body?: string
          club_id: string
          created_at?: string
          enrollment_id?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string
          club_id?: string
          created_at?: string
          enrollment_id?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaching_notes_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_notes_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "coaching_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_programs: {
        Row: {
          access: Json
          club_id: string
          config: Json
          created_at: string
          description: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
        }
        Insert: {
          access?: Json
          club_id: string
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Update: {
          access?: Json
          club_id?: string
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaching_programs_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_sessions: {
        Row: {
          agenda: string | null
          club_id: string
          coach_id: string | null
          created_at: string
          duration_minutes: number | null
          enrollment_id: string | null
          follow_up: string | null
          follow_up_done: boolean
          id: string
          notes: string | null
          resources: Json
          scheduled_at: string | null
          status: string
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agenda?: string | null
          club_id: string
          coach_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          enrollment_id?: string | null
          follow_up?: string | null
          follow_up_done?: boolean
          id?: string
          notes?: string | null
          resources?: Json
          scheduled_at?: string | null
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agenda?: string | null
          club_id?: string
          coach_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          enrollment_id?: string | null
          follow_up?: string | null
          follow_up_done?: boolean
          id?: string
          notes?: string | null
          resources?: Json
          scheduled_at?: string | null
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coaching_sessions_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_sessions_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "coaching_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_tasks: {
        Row: {
          club_id: string
          created_at: string
          done: boolean
          due_date: string | null
          enrollment_id: string | null
          goal_id: string | null
          id: string
          kind: string
          title: string
          updated_at: string
          user_id: string | null
          week_of: string | null
        }
        Insert: {
          club_id: string
          created_at?: string
          done?: boolean
          due_date?: string | null
          enrollment_id?: string | null
          goal_id?: string | null
          id?: string
          kind?: string
          title: string
          updated_at?: string
          user_id?: string | null
          week_of?: string | null
        }
        Update: {
          club_id?: string
          created_at?: string
          done?: boolean
          due_date?: string | null
          enrollment_id?: string | null
          goal_id?: string | null
          id?: string
          kind?: string
          title?: string
          updated_at?: string
          user_id?: string | null
          week_of?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coaching_tasks_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_tasks_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "coaching_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_tasks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "coaching_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      community_comments: {
        Row: {
          attachments: Json
          author_id: string | null
          body: string
          club_id: string
          created_at: string
          id: string
          lesson_id: string | null
          parent_id: string | null
          post_id: string | null
          updated_at: string
        }
        Insert: {
          attachments?: Json
          author_id?: string | null
          body?: string
          club_id: string
          created_at?: string
          id?: string
          lesson_id?: string | null
          parent_id?: string | null
          post_id?: string | null
          updated_at?: string
        }
        Update: {
          attachments?: Json
          author_id?: string | null
          body?: string
          club_id?: string
          created_at?: string
          id?: string
          lesson_id?: string | null
          parent_id?: string | null
          post_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          attachments: Json
          author_id: string | null
          body: string
          club_id: string
          created_at: string
          id: string
          kind: string
          metrics: Json
          pinned: boolean
          published_at: string | null
          space_id: string | null
          status: Database["public"]["Enums"]["content_status"]
          title: string | null
          updated_at: string
        }
        Insert: {
          attachments?: Json
          author_id?: string | null
          body?: string
          club_id: string
          created_at?: string
          id?: string
          kind?: string
          metrics?: Json
          pinned?: boolean
          published_at?: string | null
          space_id?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title?: string | null
          updated_at?: string
        }
        Update: {
          attachments?: Json
          author_id?: string | null
          body?: string
          club_id?: string
          created_at?: string
          id?: string
          kind?: string
          metrics?: Json
          pinned?: boolean
          published_at?: string | null
          space_id?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "community_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      community_spaces: {
        Row: {
          access: Json
          club_id: string
          created_at: string
          description: string | null
          id: string
          kind: string
          name: string
          position: number
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
        }
        Insert: {
          access?: Json
          club_id: string
          created_at?: string
          description?: string | null
          id?: string
          kind?: string
          name: string
          position?: number
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Update: {
          access?: Json
          club_id?: string
          created_at?: string
          description?: string | null
          id?: string
          kind?: string
          name?: string
          position?: number
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_spaces_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      content_relationships: {
        Row: {
          approved_at: string | null
          club_id: string
          commerce_mode: string
          confidence: number
          created_at: string
          from_node_id: string
          id: string
          intent: string
          kind: string
          reason: string | null
          source: string
          status: Database["public"]["Enums"]["relationship_status"]
          to_node_id: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          club_id: string
          commerce_mode?: string
          confidence?: number
          created_at?: string
          from_node_id: string
          id?: string
          intent?: string
          kind: string
          reason?: string | null
          source?: string
          status?: Database["public"]["Enums"]["relationship_status"]
          to_node_id: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          club_id?: string
          commerce_mode?: string
          confidence?: number
          created_at?: string
          from_node_id?: string
          id?: string
          intent?: string
          kind?: string
          reason?: string | null
          source?: string
          status?: Database["public"]["Enums"]["relationship_status"]
          to_node_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_relationships_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          club_id: string
          completed_at: string | null
          course_id: string
          created_at: string
          id: string
          progress: number
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          club_id: string
          completed_at?: string | null
          course_id: string
          created_at?: string
          id?: string
          progress?: number
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          club_id?: string
          completed_at?: string | null
          course_id?: string
          created_at?: string
          id?: string
          progress?: number
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_lessons: {
        Row: {
          body: string
          club_id: string
          comments_on: boolean
          course_id: string
          created_at: string
          drip_days: number | null
          duration: string | null
          featured: boolean
          id: string
          locked: boolean
          media_type: string
          media_url: string | null
          module_id: string
          position: number
          published: boolean
          quiz: Json | null
          title: string
          transcript: string | null
          updated_at: string
        }
        Insert: {
          body?: string
          club_id: string
          comments_on?: boolean
          course_id: string
          created_at?: string
          drip_days?: number | null
          duration?: string | null
          featured?: boolean
          id?: string
          locked?: boolean
          media_type?: string
          media_url?: string | null
          module_id: string
          position?: number
          published?: boolean
          quiz?: Json | null
          title: string
          transcript?: string | null
          updated_at?: string
        }
        Update: {
          body?: string
          club_id?: string
          comments_on?: boolean
          course_id?: string
          created_at?: string
          drip_days?: number | null
          duration?: string | null
          featured?: boolean
          id?: string
          locked?: boolean
          media_type?: string
          media_url?: string | null
          module_id?: string
          position?: number
          published?: boolean
          quiz?: Json | null
          title?: string
          transcript?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          club_id: string
          course_id: string
          created_at: string
          drip_days: number | null
          id: string
          locked: boolean
          position: number
          published: boolean
          quiz: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          club_id: string
          course_id: string
          created_at?: string
          drip_days?: number | null
          id?: string
          locked?: boolean
          position?: number
          published?: boolean
          quiz?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          club_id?: string
          course_id?: string
          created_at?: string
          drip_days?: number | null
          id?: string
          locked?: boolean
          position?: number
          published?: boolean
          quiz?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          access: Json
          blurb: string
          club_id: string
          course_type: string
          cover_url: string | null
          created_at: string
          drip_start_date: string | null
          id: string
          instructor: string | null
          locked: boolean
          position: number
          price_cents: number
          published_at: string | null
          stats: Json
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          access?: Json
          blurb?: string
          club_id: string
          course_type?: string
          cover_url?: string | null
          created_at?: string
          drip_start_date?: string | null
          id?: string
          instructor?: string | null
          locked?: boolean
          position?: number
          price_cents?: number
          published_at?: string | null
          stats?: Json
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          access?: Json
          blurb?: string
          club_id?: string
          course_type?: string
          cover_url?: string | null
          created_at?: string
          drip_start_date?: string | null
          id?: string
          instructor?: string | null
          locked?: boolean
          position?: number
          price_cents?: number
          published_at?: string | null
          stats?: Json
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      entitlements: {
        Row: {
          amount_cents: number | null
          club_id: string
          created_at: string
          expires_at: string | null
          granted_at: string
          id: string
          order_id: string | null
          product_id: string | null
          product_key: string
          product_kind: string
          revoked_at: string | null
          source: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents?: number | null
          club_id: string
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          id?: string
          order_id?: string | null
          product_id?: string | null
          product_key: string
          product_kind: string
          revoked_at?: string | null
          source?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number | null
          club_id?: string
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          id?: string
          order_id?: string | null
          product_id?: string | null
          product_key?: string
          product_kind?: string
          revoked_at?: string | null
          source?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entitlements_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entitlements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          access: Json
          club_id: string
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          join_url: string | null
          kind: string
          location: string | null
          replay_url: string | null
          starts_at: string
          status: Database["public"]["Enums"]["content_status"]
          timezone: string | null
          title: string
          updated_at: string
        }
        Insert: {
          access?: Json
          club_id: string
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          join_url?: string | null
          kind?: string
          location?: string | null
          replay_url?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["content_status"]
          timezone?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          access?: Json
          club_id?: string
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          join_url?: string | null
          kind?: string
          location?: string | null
          replay_url?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          timezone?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_sources: {
        Row: {
          body: string | null
          club_id: string
          created_at: string
          file_path: string | null
          id: string
          kind: string
          persona_id: string | null
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          body?: string | null
          club_id: string
          created_at?: string
          file_path?: string | null
          id?: string
          kind?: string
          persona_id?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          body?: string | null
          club_id?: string
          created_at?: string
          file_path?: string | null
          id?: string
          kind?: string
          persona_id?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_sources_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_sources_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "ai_personas"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          club_id: string
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          lesson_id: string
          seconds_watched: number
          updated_at: string
          user_id: string
        }
        Insert: {
          club_id: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id: string
          seconds_watched?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          club_id?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string
          seconds_watched?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          benefit: string | null
          club_id: string
          compare_at_cents: number | null
          created_at: string
          cta_label: string | null
          currency: string
          id: string
          includes: Json
          interval: string | null
          name: string
          price_cents: number
          product_id: string | null
          product_kind: string
          purchase_description: string | null
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
        }
        Insert: {
          benefit?: string | null
          club_id: string
          compare_at_cents?: number | null
          created_at?: string
          cta_label?: string | null
          currency?: string
          id?: string
          includes?: Json
          interval?: string | null
          name?: string
          price_cents?: number
          product_id?: string | null
          product_kind: string
          purchase_description?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Update: {
          benefit?: string | null
          club_id?: string
          compare_at_cents?: number | null
          created_at?: string
          cta_label?: string | null
          currency?: string
          id?: string
          includes?: Json
          interval?: string | null
          name?: string
          price_cents?: number
          product_id?: string | null
          product_kind?: string
          purchase_description?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          club_id: string
          created_at: string
          id: string
          offer_id: string | null
          order_id: string
          product_id: string | null
          product_kind: string
          quantity: number
          unit_amount_cents: number
        }
        Insert: {
          club_id: string
          created_at?: string
          id?: string
          offer_id?: string | null
          order_id: string
          product_id?: string | null
          product_kind: string
          quantity?: number
          unit_amount_cents?: number
        }
        Update: {
          club_id?: string
          created_at?: string
          id?: string
          offer_id?: string | null
          order_id?: string
          product_id?: string | null
          product_kind?: string
          quantity?: number
          unit_amount_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          club_id: string
          created_at: string
          currency: string
          failure_reason: string | null
          id: string
          paid_at: string | null
          payee_club_id: string | null
          platform_fee_cents: number
          provider: string | null
          provider_ref: string | null
          refunded_at: string | null
          status: string
          total_cents: number
          updated_at: string
          user_id: string
        }
        Insert: {
          club_id: string
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          paid_at?: string | null
          payee_club_id?: string | null
          platform_fee_cents?: number
          provider?: string | null
          provider_ref?: string | null
          refunded_at?: string | null
          status?: string
          total_cents?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          club_id?: string
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          paid_at?: string | null
          payee_club_id?: string | null
          platform_fee_cents?: number
          provider?: string | null
          provider_ref?: string | null
          refunded_at?: string | null
          status?: string
          total_cents?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          access: Json
          club_id: string
          created_at: string
          description: string | null
          file_path: string | null
          id: string
          lesson_id: string | null
          position: number
          source: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          type: string
          updated_at: string
          url: string | null
        }
        Insert: {
          access?: Json
          club_id: string
          created_at?: string
          description?: string | null
          file_path?: string | null
          id?: string
          lesson_id?: string | null
          position?: number
          source?: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          type?: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          access?: Json
          club_id?: string
          created_at?: string
          description?: string | null
          file_path?: string | null
          id?: string
          lesson_id?: string | null
          position?: number
          source?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          type?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      sell_pages: {
        Row: {
          blocks: Json
          club_id: string
          created_at: string
          id: string
          published_at: string | null
          settings: Json
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          surface: string
          title: string
          updated_at: string
        }
        Insert: {
          blocks?: Json
          club_id: string
          created_at?: string
          id?: string
          published_at?: string | null
          settings?: Json
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          surface?: string
          title?: string
          updated_at?: string
        }
        Update: {
          blocks?: Json
          club_id?: string
          created_at?: string
          id?: string
          published_at?: string | null
          settings?: Json
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          surface?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sell_pages_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_platform_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["platform_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["platform_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["platform_role"]
          user_id?: string
        }
        Relationships: []
      }
      voice_profiles: {
        Row: {
          active: boolean
          analysis: Json
          club_id: string
          created_at: string
          id: string
          name: string
          samples: Json
          traits: Json
          updated_at: string
        }
        Insert: {
          active?: boolean
          analysis?: Json
          club_id: string
          created_at?: string
          id?: string
          name?: string
          samples?: Json
          traits?: Json
          updated_at?: string
        }
        Update: {
          active?: boolean
          analysis?: Json
          club_id?: string
          created_at?: string
          id?: string
          name?: string
          samples?: Json
          traits?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_profiles_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      club_role_of: {
        Args: { _club_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["club_role"]
      }
      club_role_rank: {
        Args: { _role: Database["public"]["Enums"]["club_role"] }
        Returns: number
      }
      has_platform_role: {
        Args: {
          _role: Database["public"]["Enums"]["platform_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_club_admin: { Args: { _club_id: string }; Returns: boolean }
      is_club_member: { Args: { _club_id: string }; Returns: boolean }
      is_club_owner: { Args: { _club_id: string }; Returns: boolean }
      is_club_staff: { Args: { _club_id: string }; Returns: boolean }
      is_platform_admin: { Args: never; Returns: boolean }
      is_public_club: { Args: { _club_id: string }; Returns: boolean }
    }
    Enums: {
      build_plan_status:
        | "draft"
        | "approved"
        | "building"
        | "completed"
        | "failed"
      club_role: "owner" | "admin" | "moderator" | "coach" | "member"
      club_visibility: "public" | "unlisted" | "private"
      content_status: "draft" | "published" | "archived"
      membership_status:
        | "invited"
        | "pending"
        | "active"
        | "paused"
        | "cancelled"
        | "banned"
      opportunity_status:
        | "new"
        | "reviewing"
        | "approved"
        | "building"
        | "completed"
        | "dismissed"
      platform_role: "platform_admin" | "support" | "user"
      reco_status: "suggested" | "approved" | "rejected" | "applied" | "removed"
      relationship_status: "draft" | "suggested" | "approved" | "rejected"
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
      build_plan_status: [
        "draft",
        "approved",
        "building",
        "completed",
        "failed",
      ],
      club_role: ["owner", "admin", "moderator", "coach", "member"],
      club_visibility: ["public", "unlisted", "private"],
      content_status: ["draft", "published", "archived"],
      membership_status: [
        "invited",
        "pending",
        "active",
        "paused",
        "cancelled",
        "banned",
      ],
      opportunity_status: [
        "new",
        "reviewing",
        "approved",
        "building",
        "completed",
        "dismissed",
      ],
      platform_role: ["platform_admin", "support", "user"],
      reco_status: ["suggested", "approved", "rejected", "applied", "removed"],
      relationship_status: ["draft", "suggested", "approved", "rejected"],
    },
  },
} as const
