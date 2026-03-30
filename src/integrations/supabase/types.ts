export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          email: string
          role: Database["public"]["Enums"]["user_role"]
          faculty_level: Database["public"]["Enums"]["faculty_level"] | null
          faculty_id: string | null
          student_id: string | null
          department: string | null
          avatar_url: string | null
          bio: string | null
          phone: string | null
          assigned_faculty_id: string | null
          teaching_id: string | null
          teaching_id_verified: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          email: string
          role?: Database["public"]["Enums"]["user_role"]
          faculty_level?: Database["public"]["Enums"]["faculty_level"] | null
          faculty_id?: string | null
          student_id?: string | null
          department?: string | null
          avatar_url?: string | null
          bio?: string | null
          phone?: string | null
          assigned_faculty_id?: string | null
          teaching_id?: string | null
          teaching_id_verified?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          email?: string
          role?: Database["public"]["Enums"]["user_role"]
          faculty_level?: Database["public"]["Enums"]["faculty_level"] | null
          faculty_id?: string | null
          student_id?: string | null
          department?: string | null
          avatar_url?: string | null
          bio?: string | null
          phone?: string | null
          assigned_faculty_id?: string | null
          teaching_id?: string | null
          teaching_id_verified?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_assigned_faculty"
            columns: ["assigned_faculty_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          id: string
          student_id: string
          title: string
          description: string | null
          category: Database["public"]["Enums"]["certificate_category"]
          file_url: string
          file_name: string
          status: Database["public"]["Enums"]["certificate_status"]
          rejection_reason: string | null
          uploaded_at: string
          verified_at: string | null
          verified_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          title: string
          description?: string | null
          category: Database["public"]["Enums"]["certificate_category"]
          file_url: string
          file_name: string
          status?: Database["public"]["Enums"]["certificate_status"]
          rejection_reason?: string | null
          uploaded_at?: string
          verified_at?: string | null
          verified_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          title?: string
          description?: string | null
          category?: Database["public"]["Enums"]["certificate_category"]
          file_url?: string
          file_name?: string
          status?: Database["public"]["Enums"]["certificate_status"]
          rejection_reason?: string | null
          uploaded_at?: string
          verified_at?: string | null
          verified_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          read_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          read_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      student_monitoring: {
        Row: {
          id: string
          student_id: string
          platform: string
          platform_handle: string
          solved_count: number
          contest_count: number
          rating: number
          last_updated: string
        }
        Insert: {
          id?: string
          student_id: string
          platform: string
          platform_handle: string
          solved_count?: number
          contest_count?: number
          rating?: number
          last_updated?: string
        }
        Update: {
          id?: string
          student_id?: string
          platform?: string
          platform_handle?: string
          solved_count?: number
          contest_count?: number
          rating?: number
          last_updated?: string
        }
        Relationships: []
      }
      faculty_assignments: {
        Row: {
          id: string
          faculty_id: string
          student_id: string
          assigned_at: string
        }
        Insert: {
          id?: string
          faculty_id: string
          student_id: string
          assigned_at?: string
        }
        Update: {
          id?: string
          faculty_id?: string
          student_id?: string
          assigned_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "faculty_assignments_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_progress: {
        Row: {
          id: string
          student_id: string
          total_certificates: number
          approved_certificates: number
          pending_certificates: number
          rejected_certificates: number
          courses_enrolled: number
          courses_completed: number
          current_streak_days: number
          longest_streak_days: number
          total_activities: number
          last_activity_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          total_certificates?: number
          approved_certificates?: number
          pending_certificates?: number
          rejected_certificates?: number
          courses_enrolled?: number
          courses_completed?: number
          current_streak_days?: number
          longest_streak_days?: number
          total_activities?: number
          last_activity_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          total_certificates?: number
          approved_certificates?: number
          pending_certificates?: number
          rejected_certificates?: number
          courses_enrolled?: number
          courses_completed?: number
          current_streak_days?: number
          longest_streak_days?: number
          total_activities?: number
          last_activity_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_achievements: {
        Row: {
          id: string
          student_id: string
          achievement_type: string
          title: string
          description: string | null
          icon_url: string | null
          points: number
          earned_at: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          student_id: string
          achievement_type: string
          title: string
          description?: string | null
          icon_url?: string | null
          points?: number
          earned_at?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          student_id?: string
          achievement_type?: string
          title?: string
          description?: string | null
          icon_url?: string | null
          points?: number
          earned_at?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      student_activities: {
        Row: {
          id: string
          student_id: string
          activity_type: string
          title: string
          description: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          activity_type: string
          title: string
          description?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          activity_type?: string
          title?: string
          description?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      student_goals: {
        Row: {
          id: string
          student_id: string
          title: string
          description: string | null
          goal_type: string
          target_value: number | null
          current_value: number
          status: string
          priority: string
          target_date: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          title: string
          description?: string | null
          goal_type: string
          target_value?: number | null
          current_value?: number
          status?: string
          priority?: string
          target_date?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          title?: string
          description?: string | null
          goal_type?: string
          target_value?: number | null
          current_value?: number
          status?: string
          priority?: string
          target_date?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Relationships: []
      }
      student_connections: {
        Row: {
          id: string
          requester_id: string
          receiver_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          receiver_id: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          receiver_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_portfolio: {
        Row: {
          id: string
          student_id: string
          title: string
          description: string | null
          category: string
          image_url: string | null
          external_url: string | null
          visibility: string
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          title: string
          description?: string | null
          category: string
          image_url?: string | null
          external_url?: string | null
          visibility?: string
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          title?: string
          description?: string | null
          category?: string
          image_url?: string | null
          external_url?: string | null
          visibility?: string
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_recommendations: {
        Row: {
          id: string
          student_id: string
          title: string
          description: string | null
          category: string
          difficulty: string
          estimated_duration: number | null
          external_url: string | null
          priority: number
          status: string
          created_at: string
          started_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          title: string
          description?: string | null
          category: string
          difficulty?: string
          estimated_duration?: number | null
          external_url?: string | null
          priority?: number
          status?: string
          created_at?: string
          started_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          title?: string
          description?: string | null
          category?: string
          difficulty?: string
          estimated_duration?: number | null
          external_url?: string | null
          priority?: number
          status?: string
          created_at?: string
          started_at?: string | null
          completed_at?: string | null
        }
        Relationships: []
      }
      student_milestones: {
        Row: {
          id: string
          student_id: string
          milestone_type: string
          target_value: number
          current_value: number
          title: string
          description: string | null
          reward_points: number
          achieved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          milestone_type: string
          target_value: number
          current_value?: number
          title: string
          description?: string | null
          reward_points?: number
          achieved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          milestone_type?: string
          target_value?: number
          current_value?: number
          title?: string
          description?: string | null
          reward_points?: number
          achieved_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      student_course_enrollments: {
        Row: {
          id: string
          student_id: string
          course_id: string
          enrolled_at: string
          status: string
          progress: number
          completed_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          course_id: string
          enrolled_at?: string
          status?: string
          progress?: number
          completed_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          course_id?: string
          enrolled_at?: string
          status?: string
          progress?: number
          completed_at?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          id: string
          faculty_id: string
          title: string
          description: string | null
          category: string
          duration_weeks: number | null
          max_students: number | null
          assigned_student_ids: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          faculty_id: string
          title: string
          description?: string | null
          category?: string
          duration_weeks?: number | null
          max_students?: number | null
          assigned_student_ids?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          faculty_id?: string
          title?: string
          description?: string | null
          category?: string
          duration_weeks?: number | null
          max_students?: number | null
          assigned_student_ids?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      schedule: {
        Row: {
          id: string
          course_name: string
          start: string
          end: string
          room: string | null
          tags: string[] | null
          syllabus_url: string | null
          students_count: number | null
          notes: string | null
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          course_name: string
          start: string
          end: string
          room?: string | null
          tags?: string[] | null
          syllabus_url?: string | null
          students_count?: number | null
          notes?: string | null
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          course_name?: string
          start?: string
          end?: string
          room?: string | null
          tags?: string[] | null
          syllabus_url?: string | null
          students_count?: number | null
          notes?: string | null
          color?: string | null
          created_at?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          id: string
          author_id: string
          title: string
          content: string
          category: string
          tags: string[] | null
          upvotes: number
          downvotes: number
          is_pinned: boolean
          is_blocked: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          content: string
          category?: string
          tags?: string[] | null
          upvotes?: number
          downvotes?: number
          is_pinned?: boolean
          is_blocked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          title?: string
          content?: string
          category?: string
          tags?: string[] | null
          upvotes?: number
          downvotes?: number
          is_pinned?: boolean
          is_blocked?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          id: string
          post_id: string
          author_id: string
          content: string
          upvotes: number
          is_blocked: boolean
          parent_comment_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          author_id: string
          content: string
          upvotes?: number
          is_blocked?: boolean
          parent_comment_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          author_id?: string
          content?: string
          upvotes?: number
          is_blocked?: boolean
          parent_comment_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_groups: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          created_by: string
          member_count: number
          is_private: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category?: string
          created_by: string
          member_count?: number
          is_private?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          created_by?: string
          member_count?: number
          is_private?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      group_memberships: {
        Row: {
          id: string
          group_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
        Relationships: []
      }
      post_interactions: {
        Row: {
          id: string
          post_id: string
          user_id: string
          interaction_type: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          interaction_type: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          interaction_type?: string
          created_at?: string
        }
        Relationships: []
      }
      comment_interactions: {
        Row: {
          id: string
          comment_id: string
          user_id: string
          interaction_type: string
          created_at: string
        }
        Insert: {
          id?: string
          comment_id: string
          user_id: string
          interaction_type: string
          created_at?: string
        }
        Update: {
          id?: string
          comment_id?: string
          user_id?: string
          interaction_type?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      certificate_category: "academic" | "co_curricular"
      certificate_status: "pending" | "approved" | "rejected"
      faculty_level: "basic" | "senior" | "admin"
      user_role: "student" | "faculty"
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

export const Constants = {
  public: {
    Enums: {
      certificate_category: ["academic", "co_curricular"],
      certificate_status: ["pending", "approved", "rejected"],
      faculty_level: ["basic", "senior", "admin"],
      user_role: ["student", "faculty"],
    },
  },
} as const
