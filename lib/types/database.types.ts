export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'user' | 'admin'
export type FundType = 'OPCVM' | 'OPCI'
export type LegalNature = 'SICAV' | 'FCP'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          owner_id: string
          name: string
          address: string
          city: string
          postal_code: string
          country: string
          property_type: PropertyType
          surface_area: number | null
          rooms: number | null
          description: string | null
          purchase_price: number | null
          purchase_date: string | null
          current_value: number | null
          status: PropertyStatus
          images: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          address: string
          city: string
          postal_code: string
          country?: string
          property_type: PropertyType
          surface_area?: number | null
          rooms?: number | null
          description?: string | null
          purchase_price?: number | null
          purchase_date?: string | null
          current_value?: number | null
          status?: PropertyStatus
          images?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          address?: string
          city?: string
          postal_code?: string
          country?: string
          property_type?: PropertyType
          surface_area?: number | null
          rooms?: number | null
          description?: string | null
          purchase_price?: number | null
          purchase_date?: string | null
          current_value?: number | null
          status?: PropertyStatus
          images?: Json
          created_at?: string
          updated_at?: string
        }
      }
      tenants: {
        Row: {
          id: string
          owner_id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          date_of_birth: string | null
          occupation: string | null
          emergency_contact: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          date_of_birth?: string | null
          occupation?: string | null
          emergency_contact?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          date_of_birth?: string | null
          occupation?: string | null
          emergency_contact?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      leases: {
        Row: {
          id: string
          property_id: string
          tenant_id: string
          owner_id: string
          start_date: string
          end_date: string | null
          monthly_rent: number
          deposit: number | null
          charges: number
          payment_day: number
          status: LeaseStatus
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          tenant_id: string
          owner_id: string
          start_date: string
          end_date?: string | null
          monthly_rent: number
          deposit?: number | null
          charges?: number
          payment_day?: number
          status?: LeaseStatus
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          tenant_id?: string
          owner_id?: string
          start_date?: string
          end_date?: string | null
          monthly_rent?: number
          deposit?: number | null
          charges?: number
          payment_day?: number
          status?: LeaseStatus
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          lease_id: string
          owner_id: string
          amount: number
          payment_date: string
          due_date: string
          payment_type: PaymentType
          status: PaymentStatus
          payment_method: PaymentMethod | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lease_id: string
          owner_id: string
          amount: number
          payment_date: string
          due_date: string
          payment_type?: PaymentType
          status?: PaymentStatus
          payment_method?: PaymentMethod | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lease_id?: string
          owner_id?: string
          amount?: number
          payment_date?: string
          due_date?: string
          payment_type?: PaymentType
          status?: PaymentStatus
          payment_method?: PaymentMethod | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          owner_id: string
          property_id: string
          lease_id: string | null
          tenant_id: string | null
          name: string
          file_url: string
          file_type: string | null
          file_size: number | null
          category: DocumentCategory | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          property_id: string
          lease_id?: string | null
          tenant_id?: string | null
          name: string
          file_url: string
          file_type?: string | null
          file_size?: number | null
          category?: DocumentCategory | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          property_id?: string
          lease_id?: string | null
          tenant_id?: string | null
          name?: string
          file_url?: string
          file_type?: string | null
          file_size?: number | null
          category?: DocumentCategory | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
