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
      equipment: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      exercise_equipment: {
        Row: {
          equipment_id: string;
          exercise_id: string;
          position: number;
        };
        Insert: {
          equipment_id: string;
          exercise_id: string;
          position: number;
        };
        Update: {
          equipment_id?: string;
          exercise_id?: string;
          position?: number;
        };
        Relationships: [
          {
            foreignKeyName: "exercise_equipment_equipment_id_fkey";
            columns: ["equipment_id"];
            isOneToOne: false;
            referencedRelation: "equipment";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exercise_equipment_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
        ];
      };
      exercise_muscles: {
        Row: {
          exercise_id: string;
          involvement_type: Database["public"]["Enums"]["muscle_involvement"];
          muscle_id: string;
        };
        Insert: {
          exercise_id: string;
          involvement_type: Database["public"]["Enums"]["muscle_involvement"];
          muscle_id: string;
        };
        Update: {
          exercise_id?: string;
          involvement_type?: Database["public"]["Enums"]["muscle_involvement"];
          muscle_id?: string;
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
            foreignKeyName: "exercise_muscles_muscle_id_fkey";
            columns: ["muscle_id"];
            isOneToOne: false;
            referencedRelation: "muscles";
            referencedColumns: ["id"];
          },
        ];
      };
      exercises: {
        Row: {
          common_mistakes: string[];
          created_at: string;
          created_by: string | null;
          description: string | null;
          difficulty: Database["public"]["Enums"]["exercise_difficulty"];
          id: string;
          image_url: string | null;
          instructions: string[];
          is_custom: boolean;
          movement_pattern:
            Database["public"]["Enums"]["movement_pattern"] | null;
          name: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          common_mistakes?: string[];
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          difficulty: Database["public"]["Enums"]["exercise_difficulty"];
          id?: string;
          image_url?: string | null;
          instructions?: string[];
          is_custom?: boolean;
          movement_pattern?:
            Database["public"]["Enums"]["movement_pattern"] | null;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          common_mistakes?: string[];
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          difficulty?: Database["public"]["Enums"]["exercise_difficulty"];
          id?: string;
          image_url?: string | null;
          instructions?: string[];
          is_custom?: boolean;
          movement_pattern?:
            Database["public"]["Enums"]["movement_pattern"] | null;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      muscle_groups: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      muscles: {
        Row: {
          created_at: string;
          id: string;
          muscle_group_id: string;
          name: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          muscle_group_id: string;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          muscle_group_id?: string;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "muscles_muscle_group_id_fkey";
            columns: ["muscle_group_id"];
            isOneToOne: false;
            referencedRelation: "muscle_groups";
            referencedColumns: ["id"];
          },
        ];
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
          target_rir: number | null;
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
          target_rir?: number | null;
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
          target_rir?: number | null;
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
          exercise_name_snapshot: string;
          id: string;
          notes: string | null;
          position: number;
          rest_seconds: number;
          source_routine_exercise_id: string | null;
          target_reps_max: number;
          target_reps_min: number;
          target_rir: number | null;
          target_sets: number;
          workout_session_id: string;
        };
        Insert: {
          created_at?: string;
          exercise_id: string;
          exercise_name_snapshot: string;
          id?: string;
          notes?: string | null;
          position: number;
          rest_seconds: number;
          source_routine_exercise_id?: string | null;
          target_reps_max: number;
          target_reps_min: number;
          target_rir?: number | null;
          target_sets: number;
          workout_session_id: string;
        };
        Update: {
          created_at?: string;
          exercise_id?: string;
          exercise_name_snapshot?: string;
          id?: string;
          notes?: string | null;
          position?: number;
          rest_seconds?: number;
          source_routine_exercise_id?: string | null;
          target_reps_max?: number;
          target_reps_min?: number;
          target_rir?: number | null;
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
          active_workout_exercise_id: string | null;
          completed_at: string | null;
          created_at: string;
          id: string;
          notes: string | null;
          rest_ends_at: string | null;
          rest_source_set_id: string | null;
          routine_day_id: string | null;
          routine_day_name_snapshot: string;
          routine_name_snapshot: string;
          snapshot_locked_at: string | null;
          started_at: string;
          status: Database["public"]["Enums"]["workout_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          active_workout_exercise_id?: string | null;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          notes?: string | null;
          rest_ends_at?: string | null;
          rest_source_set_id?: string | null;
          routine_day_id?: string | null;
          routine_day_name_snapshot: string;
          routine_name_snapshot: string;
          snapshot_locked_at?: string | null;
          started_at?: string;
          status?: Database["public"]["Enums"]["workout_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          active_workout_exercise_id?: string | null;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          notes?: string | null;
          rest_ends_at?: string | null;
          rest_source_set_id?: string | null;
          routine_day_id?: string | null;
          routine_day_name_snapshot?: string;
          routine_name_snapshot?: string;
          snapshot_locked_at?: string | null;
          started_at?: string;
          status?: Database["public"]["Enums"]["workout_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workout_sessions_active_exercise_fk";
            columns: ["active_workout_exercise_id"];
            isOneToOne: false;
            referencedRelation: "workout_exercises";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workout_sessions_rest_source_set_fk";
            columns: ["rest_source_set_id"];
            isOneToOne: false;
            referencedRelation: "workout_sets";
            referencedColumns: ["id"];
          },
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
          completed_at: string;
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
          completed_at?: string;
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
          completed_at?: string;
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
      activate_routine: {
        Args: { target_routine_id: string };
        Returns: undefined;
      };
      append_routine_day: {
        Args: { day_name: string; target_routine_id: string };
        Returns: string;
      };
      append_routine_exercise: {
        Args: {
          target_day_id: string;
          target_exercise_id: string;
          target_reps_max: number;
          target_reps_min: number;
          target_rest_seconds: number;
          target_rir?: number;
          target_sets: number;
        };
        Returns: string;
      };
      complete_workout_set: {
        Args: {
          target_repetitions: number;
          target_rir?: number;
          target_set_number: number;
          target_set_type?: Database["public"]["Enums"]["workout_set_type"];
          target_weight_kg: number;
          target_workout_exercise_id: string;
        };
        Returns: {
          active_workout_exercise_id: string;
          completed_at: string;
          inserted: boolean;
          repetitions: number;
          rest_ends_at: string;
          rir: number;
          set_number: number;
          set_type: Database["public"]["Enums"]["workout_set_type"];
          weight_kg: number;
          workout_set_id: string;
        }[];
      };
      duplicate_routine_day: {
        Args: { source_day_id: string };
        Returns: string;
      };
      extend_workout_rest: {
        Args: { extension_seconds?: number; target_workout_session_id: string };
        Returns: string;
      };
      finish_workout: {
        Args: { target_workout_session_id: string };
        Returns: string;
      };
      reorder_routine_days: {
        Args: { ordered_day_ids: string[]; target_routine_id: string };
        Returns: undefined;
      };
      reorder_routine_exercises: {
        Args: { ordered_routine_exercise_ids: string[]; target_day_id: string };
        Returns: undefined;
      };
      select_workout_exercise: {
        Args: {
          target_workout_exercise_id: string;
          target_workout_session_id: string;
        };
        Returns: undefined;
      };
      skip_workout_rest: {
        Args: { target_workout_session_id: string };
        Returns: undefined;
      };
      start_workout: {
        Args: { target_routine_day_id: string };
        Returns: string;
      };
      undo_last_workout_set: {
        Args: {
          target_workout_session_id: string;
          target_workout_set_id: string;
        };
        Returns: {
          active_workout_exercise_id: string;
          rest_ends_at: string;
          set_number: number;
          workout_exercise_id: string;
        }[];
      };
    };
    Enums: {
      biological_sex: "female" | "male" | "intersex" | "prefer_not_to_say";
      exercise_difficulty: "beginner" | "intermediate" | "advanced";
      movement_pattern:
        | "horizontal_push"
        | "vertical_push"
        | "horizontal_pull"
        | "vertical_pull"
        | "squat"
        | "hip_hinge"
        | "lunge"
        | "knee_extension"
        | "knee_flexion"
        | "elbow_flexion"
        | "elbow_extension"
        | "shoulder_abduction"
        | "shoulder_flexion"
        | "shoulder_extension"
        | "chest_fly"
        | "reverse_fly"
        | "hip_abduction"
        | "hip_adduction"
        | "calf_raise"
        | "core_flexion"
        | "core_rotation"
        | "core_stability";
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
      exercise_difficulty: ["beginner", "intermediate", "advanced"],
      movement_pattern: [
        "horizontal_push",
        "vertical_push",
        "horizontal_pull",
        "vertical_pull",
        "squat",
        "hip_hinge",
        "lunge",
        "knee_extension",
        "knee_flexion",
        "elbow_flexion",
        "elbow_extension",
        "shoulder_abduction",
        "shoulder_flexion",
        "shoulder_extension",
        "chest_fly",
        "reverse_fly",
        "hip_abduction",
        "hip_adduction",
        "calf_raise",
        "core_flexion",
        "core_rotation",
        "core_stability",
      ],
      muscle_involvement: ["primary", "secondary", "stabilizer"],
      training_goal: ["muscle_gain", "strength", "general_fitness"],
      training_level: ["beginner", "intermediate", "advanced"],
      weight_unit: ["kg", "lb"],
      workout_set_type: ["warmup", "working", "backoff", "dropset"],
      workout_status: ["in_progress", "completed", "cancelled"],
    },
  },
} as const;
