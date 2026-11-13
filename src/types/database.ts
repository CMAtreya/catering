/**
 * Database Schema Type Definitions
 * Generated to match Supabase migration: 20261113150000_init_tks_catering.sql
 * Strictly conforming to BFS v1.0 and DSS v1.0
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type RecordSource = 'ONLINE' | 'MANUAL'
export type RecordStatus = 'NEW_REQUEST' | 'UNDER_DISCUSSION' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
export type RecordChangeReasonType = 'CONFIRMED_ORDER_EDIT' | 'CONFIRMED_ORDER_CANCELLATION'
export type AvailabilityStatus = 'AVAILABLE' | 'UNAVAILABLE'

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string
          display_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      business_settings: {
        Row: {
          id: string
          business_name: string
          logo_path: string | null
          address: string
          phone_number: string
          gstin: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_name: string
          logo_path?: string | null
          address: string
          phone_number: string
          gstin: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_name?: string
          logo_path?: string | null
          address?: string
          phone_number?: string
          gstin?: string
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          mobile_number: string
          address: string | null
          notes: string | null
          first_contacted_at: string
          last_contacted_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          mobile_number: string
          address?: string | null
          notes?: string | null
          first_contacted_at?: string
          last_contacted_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          mobile_number?: string
          address?: string | null
          notes?: string | null
          first_contacted_at?: string
          last_contacted_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      menu_categories: {
        Row: {
          id: string
          name: string
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          category_id: string
          name: string
          price_per_plate: number
          image_path: string | null
          availability: AvailabilityStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          price_per_plate: number
          image_path?: string | null
          availability?: AvailabilityStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          price_per_plate?: number
          image_path?: string | null
          availability?: AvailabilityStatus
          created_at?: string
          updated_at?: string
        }
      }
      feasts: {
        Row: {
          id: string
          name: string
          description: string | null
          tag: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          tag?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          tag?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      feast_items: {
        Row: {
          id: string
          feast_id: string
          menu_item_id: string
          created_at: string
        }
        Insert: {
          id?: string
          feast_id: string
          menu_item_id: string
          created_at?: string
        }
        Update: {
          id?: string
          feast_id?: string
          menu_item_id?: string
          created_at?: string
        }
      }
      catering_records: {
        Row: {
          id: string
          order_number: string
          customer_id: string
          source: RecordSource
          status: RecordStatus
          occasion_type: string | null
          occasion_date: string | null
          service_time: string | null
          plate_count: number | null
          delivery_address: string | null
          special_instructions: string | null
          enquiry_notes: string | null
          food_subtotal: number
          delivery_charges: number
          customization_charges: number
          gst_base_amount: number
          gst_rate: number
          gst_amount: number
          final_amount: number
          final_instructions: string | null
          confirmed_at: string | null
          completed_at: string | null
          cancelled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          customer_id: string
          source: RecordSource
          status: RecordStatus
          occasion_type?: string | null
          occasion_date?: string | null
          service_time?: string | null
          plate_count?: number | null
          delivery_address?: string | null
          special_instructions?: string | null
          enquiry_notes?: string | null
          food_subtotal?: number
          delivery_charges?: number
          customization_charges?: number
          gst_base_amount?: number
          gst_rate?: number
          gst_amount?: number
          final_amount?: number
          final_instructions?: string | null
          confirmed_at?: string | null
          completed_at?: string | null
          cancelled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string
          source?: RecordSource
          status?: RecordStatus
          occasion_type?: string | null
          occasion_date?: string | null
          service_time?: string | null
          plate_count?: number | null
          delivery_address?: string | null
          special_instructions?: string | null
          enquiry_notes?: string | null
          food_subtotal?: number
          delivery_charges?: number
          customization_charges?: number
          gst_base_amount?: number
          gst_rate?: number
          gst_amount?: number
          final_amount?: number
          final_instructions?: string | null
          confirmed_at?: string | null
          completed_at?: string | null
          cancelled_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      catering_record_items: {
        Row: {
          id: string
          catering_record_id: string
          menu_item_id: string | null
          item_name_snapshot: string
          price_per_plate_snapshot: number
          plate_count: number
          line_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          catering_record_id: string
          menu_item_id?: string | null
          item_name_snapshot: string
          price_per_plate_snapshot: number
          plate_count: number
          line_amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          catering_record_id?: string
          menu_item_id?: string | null
          item_name_snapshot?: string
          price_per_plate_snapshot?: number
          plate_count?: number
          line_amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      record_change_reasons: {
        Row: {
          id: string
          catering_record_id: string
          reason_type: RecordChangeReasonType
          reason: string
          change_diff: Json | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          catering_record_id: string
          reason_type: RecordChangeReasonType
          reason: string
          change_diff?: Json | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          catering_record_id?: string
          reason_type?: RecordChangeReasonType
          reason?: string
          change_diff?: Json | null
          created_by?: string | null
          created_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          catering_record_id: string
          invoice_number: string
          invoice_date: string
          business_name_snapshot: string
          business_logo_path_snapshot: string | null
          business_address_snapshot: string
          business_phone_snapshot: string
          business_gstin_snapshot: string
          customer_name_snapshot: string
          customer_mobile_snapshot: string
          customer_address_snapshot: string
          occasion_type_snapshot: string
          occasion_date_snapshot: string
          service_time_snapshot: string | null
          plate_count_snapshot: number
          food_subtotal: number
          delivery_charges: number
          customization_charges: number
          gst_rate: number
          gst_base_amount: number
          gst_amount: number
          final_amount: number
          final_instructions_snapshot: string | null
          pdf_storage_path: string | null
          created_at: string
        }
        Insert: {
          id?: string
          catering_record_id: string
          invoice_number: string
          invoice_date?: string
          business_name_snapshot: string
          business_logo_path_snapshot?: string | null
          business_address_snapshot: string
          business_phone_snapshot: string
          business_gstin_snapshot: string
          customer_name_snapshot: string
          customer_mobile_snapshot: string
          customer_address_snapshot: string
          occasion_type_snapshot: string
          occasion_date_snapshot: string
          service_time_snapshot?: string | null
          plate_count_snapshot: number
          food_subtotal: number
          delivery_charges: number
          customization_charges: number
          gst_rate?: number
          gst_base_amount: number
          gst_amount: number
          final_amount: number
          final_instructions_snapshot?: string | null
          pdf_storage_path?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          catering_record_id?: string
          invoice_number?: string
          invoice_date?: string
          business_name_snapshot?: string
          business_logo_path_snapshot?: string | null
          business_address_snapshot?: string
          business_phone_snapshot?: string
          business_gstin_snapshot?: string
          customer_name_snapshot?: string
          customer_mobile_snapshot?: string
          customer_address_snapshot?: string
          occasion_type_snapshot?: string
          occasion_date_snapshot?: string
          service_time_snapshot?: string | null
          plate_count_snapshot?: number
          food_subtotal?: number
          delivery_charges?: number
          customization_charges?: number
          gst_rate?: number
          gst_base_amount?: number
          gst_amount?: number
          final_amount?: number
          final_instructions_snapshot?: string | null
          pdf_storage_path?: string | null
          created_at?: string
        }
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          item_name_snapshot: string
          price_per_plate_snapshot: number
          plate_count: number
          line_amount: number
        }
        Insert: {
          id?: string
          invoice_id: string
          item_name_snapshot: string
          price_per_plate_snapshot: number
          plate_count: number
          line_amount: number
        }
        Update: {
          id?: string
          invoice_id?: string
          item_name_snapshot?: string
          price_per_plate_snapshot?: number
          plate_count?: number
          line_amount?: number
        }
      }
    }
    Functions: {
      submit_online_enquiry: {
        Args: {
          p_customer_name: string
          p_customer_phone: string
          p_delivery_address: string
          p_occasion_type: string
          p_occasion_date: string
          p_service_time: string
          p_plate_count: number
          p_special_instructions: string
          p_selected_item_ids: string[]
        }
        Returns: Json
      }
      generate_invoice_for_order: {
        Args: {
          p_record_id: string
        }
        Returns: Json
      }
    }
  }
}

