export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      blacklist: {
        Row: {
          created_at: string | null
          email_pattern: string
          id: string
          reason: string | null
        }
        Insert: {
          created_at?: string | null
          email_pattern: string
          id?: string
          reason?: string | null
        }
        Update: {
          created_at?: string | null
          email_pattern?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      digests: {
        Row: {
          content: string
          created_at: string | null
          critical_count: number | null
          date: string
          email_count: number | null
          high_count: number | null
          id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          critical_count?: number | null
          date: string
          email_count?: number | null
          high_count?: number | null
          id?: string
        }
        Update: {
          content?: string
          created_at?: string | null
          critical_count?: number | null
          date?: string
          email_count?: number | null
          high_count?: number | null
          id?: string
        }
        Relationships: []
      }
      draft_responses: {
        Row: {
          created_at: string | null
          draft_content: string
          draft_subject: string | null
          gmail_id: string
          id: string
          original_sender: string | null
          original_subject: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          draft_content: string
          draft_subject?: string | null
          gmail_id: string
          id?: string
          original_sender?: string | null
          original_subject?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          draft_content?: string
          draft_subject?: string | null
          gmail_id?: string
          id?: string
          original_sender?: string | null
          original_subject?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      preferences: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      processed_emails: {
        Row: {
          category: string | null
          digest_date: string | null
          gmail_id: string
          id: string
          needs_response: boolean | null
          priority: string | null
          processed_at: string | null
          received_at: string | null
          sender: string | null
          sender_email: string | null
          snippet: string | null
          status: string | null
          subject: string | null
          thread_id: string | null
        }
        Insert: {
          category?: string | null
          digest_date?: string | null
          gmail_id: string
          id?: string
          needs_response?: boolean | null
          priority?: string | null
          processed_at?: string | null
          received_at?: string | null
          sender?: string | null
          sender_email?: string | null
          snippet?: string | null
          status?: string | null
          subject?: string | null
          thread_id?: string | null
        }
        Update: {
          category?: string | null
          digest_date?: string | null
          gmail_id?: string
          id?: string
          needs_response?: boolean | null
          priority?: string | null
          processed_at?: string | null
          received_at?: string | null
          sender?: string | null
          sender_email?: string | null
          snippet?: string | null
          status?: string | null
          subject?: string | null
          thread_id?: string | null
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
