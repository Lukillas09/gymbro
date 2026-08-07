export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      exercise_muscles: {
        Row: {
          exercise_id: string;
          involvement_type: Database["public"]["Enums"]["muscle_involvement"];
          muscle_group_id: string;
        };
        Insert: {
          exercise_id: string;
          involvement_type: Database["public"]["Enums"]["muscle_involvement"];
          muscle_group_id: string;
        };
        Update: {
          exercise_id?: string;
          involvement_type?: Database["public"]["Enums"]["muscle_involvement"];
          muscle_group_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "exercise_muscles_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exercise_muscles_muscle_group_id_fkey";
            columns: ["muscle_group_id"];
            isOneToOne: false;
            referencedRelation: "muscle_groups";
            referencedColumns: ["id"];
          },
        ];
      };
      exercises: {
        Row: {
          common_mistakes: string | null;
          created_at: string;
          created_by: string | null;
          description: string | null;
          difficulty: Database["public"]["Enums"]["exercise_difficulty"];
          equipment: string;
          id: string;
          image_url: string | null;
          instructions: string | null;
          is_custom: boolean;
          name: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          common_mistakes?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          difficulty: Database["public"]["Enums"]["exercise_difficulty"];
          equipment: string;
          id?: string;
          image_url?: string | null;
          instructions?: string | null;
          is_custom?: boolean;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          common_mistakes?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          difficulty?: Database["public"]["Enums"]["exercise_difficulty"];
          equipment?: string;
          id?: string;
          image_url?: string | null;
          instructions?: string | null;
          is_custom?: boolean;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      muscle_groups: {
        Row: {
          body_region: Database["public"]["Enums"]["body_region"];
          created_at: string;
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          body_region: Database["public"]["Enums"]["body_region"];
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          body_region?: Database["public"]["Enums"]["body_region"];
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          biological_sex: Database["public"]["Enums"]["biological_sex"] | null;
          birth_date: string | null;
          created_at: string;
          current_weight_kg: number | null;
          display_name: string | null;
          height_cm: number | null;
          id: string;
          preferred_weight_unit: Database["public"]["Enums"]["weight_unit"];
          primary_goal: Database["public"]["Enums"]["training_goal"] | null;
          training_level: Database["public"]["Enums"]["training_level"] | null;
          updated_at: string;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          biological_sex?: Database["public"]["Enums"]["biological_sex"] | null;
          birth_date?: string | null;
          created_at?: string;
          current_weight_kg?: number | null;
          display_name?: string | null;
          height_cm?: number | null;
          id: string;
          preferred_weight_unit?: Database["public"]["Enums"]["weight_unit"];
          primary_goal?: Database["public"]["Enums"]["training_goal"] | null;
          training_level?: Database["public"]["Enums"]["training_level"] | null;
          updated_at?: string;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          biological_sex?: Database["public"]["Enums"]["biological_sex"] | null;
          birth_date?: string | null;
          created_at?: string;
          current_weight_kg?: number | null;
          display_name?: string | null;
          height_cm?: number | null;
          id?: string;
          preferred_weight_unit?: Database["public"]["Enums"]["weight_unit"];
          primary_goal?: Database["public"]["Enums"]["training_goal"] | null;
          training_level?: Database["public"]["Enums"]["training_level"] | null;
          updated_at?: string;
          username?: string | null;
        };
        Relationships: [];
      };
      routine_days: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          position: number;
          routine_id: string;
          updated_at: string;
          weekday: number | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          position: number;
          routine_id: string;
          updated_at?: string;
          weekday?: number | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          position?: number;
          routine_id?: string;
          updated_at?: string;
          weekday?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "routine_days_routine_id_fkey";
            columns: ["routine_id"];
            isOneToOne: false;
            referencedRelation: "routines";
            referencedColumns: ["id"];
          },
        ];
      };
      routine_exercises: {
        Row: {
          created_at: string;
          exercise_id: string;
          id: string;
          notes: string | null;
          position: number;
          rest_seconds: number;
          routine_day_id: string;
          target_reps_max: number;
          target_reps_min: number;
          target_sets: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          exercise_id: string;
          id?: string;
          notes?: string | null;
          position: number;
          rest_seconds: number;
          routine_day_id: string;
          target_reps_max: number;
          target_reps_min: number;
          target_sets: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          exercise_id?: string;
          id?: string;
          notes?: string | null;
          position?: number;
          rest_seconds?: number;
          routine_day_id?: string;
          target_reps_max?: number;
          target_reps_min?: number;
          target_sets?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "routine_exercises_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "routine_exercises_routine_day_id_fkey";
            columns: ["routine_day_id"];
            isOneToOne: false;
            referencedRelation: "routine_days";
            referencedColumns: ["id"];
          },
        ];
      };
      routines: {
        Row: {
          archived_at: string | null;
          created_at: string;
          description: string | null;
          goal: Database["public"]["Enums"]["training_goal"];
          id: string;
          is_active: boolean;
          name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          archived_at?: string | null;
          created_at?: string;
          description?: string | null;
          goal: Database["public"]["Enums"]["training_goal"];
          id?: string;
          is_active?: boolean;
          name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          archived_at?: string | null;
          created_at?: string;
          description?: string | null;
          goal?: Database["public"]["Enums"]["training_goal"];
          id?: string;
          is_active?: boolean;
          name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      workout_exercises: {
        Row: {
          created_at: string;
          exercise_id: string;
          id: string;
          notes: string | null;
          position: number;
          rest_seconds: number;
          source_routine_exercise_id: string | null;
          target_reps_max: number;
          target_reps_min: number;
          target_sets: number;
          workout_session_id: string;
        };
        Insert: {
          created_at?: string;
          exercise_id: string;
          id?: string;
          notes?: string | null;
          position: number;
          rest_seconds: number;
          source_routine_exercise_id?: string | null;
          target_reps_max: number;
          target_reps_min: number;
          target_sets: number;
          workout_session_id: string;
        };
        Update: {
          created_at?: string;
          exercise_id?: string;
          id?: string;
          notes?: string | null;
          position?: number;
          rest_seconds?: number;
          source_routine_exercise_id?: string | null;
          target_reps_max?: number;
          target_reps_min?: number;
          target_sets?: number;
          workout_session_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workout_exercises_source_routine_exercise_id_fkey";
            columns: ["source_routine_exercise_id"];
            isOneToOne: false;
            referencedRelation: "routine_exercises";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workout_exercises_workout_session_id_fkey";
            columns: ["workout_session_id"];
            isOneToOne: false;
            referencedRelation: "workout_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      workout_sessions: {
        Row: {
          completed_at: string | null;
          created_at: string;
          id: string;
          notes: string | null;
          routine_day_id: string | null;
          started_at: string;
          status: Database["public"]["Enums"]["workout_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          notes?: string | null;
          routine_day_id?: string | null;
          started_at?: string;
          status?: Database["public"]["Enums"]["workout_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          notes?: string | null;
          routine_day_id?: string | null;
          started_at?: string;
          status?: Database["public"]["Enums"]["workout_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workout_sessions_routine_day_id_fkey";
            columns: ["routine_day_id"];
            isOneToOne: false;
            referencedRelation: "routine_days";
            referencedColumns: ["id"];
          },
        ];
      };
      workout_sets: {
        Row: {
          completed_at: string | null;
          created_at: string;
          id: string;
          repetitions: number;
          rir: number | null;
          set_number: number;
          set_type: Database["public"]["Enums"]["workout_set_type"];
          updated_at: string;
          weight_kg: number;
          workout_exercise_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          repetitions: number;
          rir?: number | null;
          set_number: number;
          set_type?: Database["public"]["Enums"]["workout_set_type"];
          updated_at?: string;
          weight_kg: number;
          workout_exercise_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          repetitions?: number;
          rir?: number | null;
          set_number?: number;
          set_type?: Database["public"]["Enums"]["workout_set_type"];
          updated_at?: string;
          weight_kg?: number;
          workout_exercise_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workout_sets_workout_exercise_id_fkey";
            columns: ["workout_exercise_id"];
            isOneToOne: false;
            referencedRelation: "workout_exercises";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      biological_sex: "female" | "male" | "intersex" | "prefer_not_to_say";
      body_region: "upper_body" | "lower_body" | "core";
      exercise_difficulty: "beginner" | "intermediate" | "advanced";
      muscle_involvement: "primary" | "secondary" | "stabilizer";
      training_goal: "muscle_gain" | "strength" | "general_fitness";
      training_level: "beginner" | "intermediate" | "advanced";
      weight_unit: "kg" | "lb";
      workout_set_type: "warmup" | "working" | "backoff" | "dropset";
      workout_status: "in_progress" | "completed" | "cancelled";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      biological_sex: ["female", "male", "intersex", "prefer_not_to_say"],
      body_region: ["upper_body", "lower_body", "core"],
      exercise_difficulty: ["beginner", "intermediate", "advanced"],
      muscle_involvement: ["primary", "secondary", "stabilizer"],
      training_goal: ["muscle_gain", "strength", "general_fitness"],
      training_level: ["beginner", "intermediate", "advanced"],
      weight_unit: ["kg", "lb"],
      workout_set_type: ["warmup", "working", "backoff", "dropset"],
      workout_status: ["in_progress", "completed", "cancelled"],
    },
  },
} as const;
