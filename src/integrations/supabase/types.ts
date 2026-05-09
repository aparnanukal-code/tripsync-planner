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
      activities: {
        Row: {
          added_by: string | null
          ai_insight: string | null
          category: string
          created_at: string | null
          description: string | null
          estimated_cost_max: number | null
          estimated_cost_min: number | null
          id: string
          is_ai_suggested: boolean
          preferred_time_of_day: string | null
          title: string
          trip_id: string
        }
        Insert: {
          added_by?: string | null
          ai_insight?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          estimated_cost_max?: number | null
          estimated_cost_min?: number | null
          id?: string
          is_ai_suggested?: boolean
          preferred_time_of_day?: string | null
          title: string
          trip_id: string
        }
        Update: {
          added_by?: string | null
          ai_insight?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          estimated_cost_max?: number | null
          estimated_cost_min?: number | null
          id?: string
          is_ai_suggested?: boolean
          preferred_time_of_day?: string | null
          title?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_added_by_profile_fk"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      destination_suggestions: {
        Row: {
          created_at: string | null
          destination_city: string
          destination_country: string
          id: string
          suggestions: Json
        }
        Insert: {
          created_at?: string | null
          destination_city: string
          destination_country: string
          id?: string
          suggestions: Json
        }
        Update: {
          created_at?: string | null
          destination_city?: string
          destination_country?: string
          id?: string
          suggestions?: Json
        }
        Relationships: []
      }
      itineraries: {
        Row: {
          created_at: string | null
          generated_plan: Json
          harmony_breakdown: Json | null
          harmony_score: number | null
          id: string
          optimization_summary: string | null
          trip_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          generated_plan: Json
          harmony_breakdown?: Json | null
          harmony_score?: number | null
          id?: string
          optimization_summary?: string | null
          trip_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          generated_plan?: Json
          harmony_breakdown?: Json | null
          harmony_score?: number | null
          id?: string
          optimization_summary?: string | null
          trip_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itineraries_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: true
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          id: string
          joined_at: string | null
          trip_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          trip_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          trip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "members_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_user_profile_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string
          id: string
          is_anonymous: boolean
        }
        Insert: {
          created_at?: string | null
          display_name?: string
          id: string
          is_anonymous?: boolean
        }
        Update: {
          created_at?: string | null
          display_name?: string
          id?: string
          is_anonymous?: boolean
        }
        Relationships: []
      }
      trip_notes: {
        Row: {
          body: string
          created_at: string
          id: string
          trip_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          trip_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          trip_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          budget_category: string
          created_at: string | null
          created_by: string | null
          destination: string
          destination_city: string
          destination_country: string
          end_date: string
          id: string
          start_date: string
          status: string
          trip_name: string
          vibe: string[]
        }
        Insert: {
          budget_category: string
          created_at?: string | null
          created_by?: string | null
          destination: string
          destination_city: string
          destination_country: string
          end_date: string
          id?: string
          start_date: string
          status?: string
          trip_name: string
          vibe: string[]
        }
        Update: {
          budget_category?: string
          created_at?: string | null
          created_by?: string | null
          destination?: string
          destination_city?: string
          destination_country?: string
          end_date?: string
          id?: string
          start_date?: string
          status?: string
          trip_name?: string
          vibe?: string[]
        }
        Relationships: []
      }
      votes: {
        Row: {
          activity_id: string
          created_at: string | null
          id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          activity_id: string
          created_at?: string | null
          id?: string
          user_id: string
          vote_type: string
        }
        Update: {
          activity_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_user_profile_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
