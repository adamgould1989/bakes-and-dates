export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      menu_items: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          base_prep_time_minutes: number
          category: string | null
          is_active: boolean
          price: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          base_prep_time_minutes?: number
          category?: string | null
          is_active?: boolean
          price?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          base_prep_time_minutes?: number
          category?: string | null
          is_active?: boolean
          price?: number | null
        }
      }
      customers: {
        Row: {
          id: string
          created_at: string
          name: string
          email: string | null
          phone: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          email?: string | null
          phone?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          email?: string | null
          phone?: string | null
          notes?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          created_at: string
          customer_id: string
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          deadline: string
          delivery_type: 'delivery' | 'collection'
          notes: string | null
          total_prep_minutes: number
        }
        Insert: {
          id?: string
          created_at?: string
          customer_id: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          deadline: string
          delivery_type: 'delivery' | 'collection'
          notes?: string | null
          total_prep_minutes?: number
        }
        Update: {
          id?: string
          created_at?: string
          customer_id?: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          deadline?: string
          delivery_type?: 'delivery' | 'collection'
          notes?: string | null
          total_prep_minutes?: number
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          menu_item_id: string
          quantity: number
          batches: number
          prep_minutes: number
          notes: string | null
        }
        Insert: {
          id?: string
          order_id: string
          menu_item_id: string
          quantity?: number
          batches?: number
          prep_minutes?: number
          notes?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          menu_item_id?: string
          quantity?: number
          batches?: number
          prep_minutes?: number
          notes?: string | null
        }
      }
      calendar_events: {
        Row: {
          id: string
          created_at: string
          title: string
          event_type: 'deadline' | 'prep' | 'delivery' | 'unavailable'
          start_time: string
          end_time: string
          order_id: string | null
          notes: string | null
          is_all_day: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          event_type: 'deadline' | 'prep' | 'delivery' | 'unavailable'
          start_time: string
          end_time: string
          order_id?: string | null
          notes?: string | null
          is_all_day?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          event_type?: 'deadline' | 'prep' | 'delivery' | 'unavailable'
          start_time?: string
          end_time?: string
          order_id?: string | null
          notes?: string | null
          is_all_day?: boolean
        }
      }
    }
    Functions: {
      create_order_with_events: {
        Args: {
          p_customer_id: string
          p_status: string
          p_deadline: string
          p_delivery_type: string
          p_notes: string | null
          p_total_prep_minutes: number
          p_order_items: Json
          p_prep_blocks: Json
          p_customer_name: string
        }
        Returns: string
      }
    }
  }
}
