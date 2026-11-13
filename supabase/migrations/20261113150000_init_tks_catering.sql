-- ============================================================================
-- Supabase Migration: Initial TKS Iyengars Catering Management System Schema
-- Version: 1.0 (Strictly conforming to BFS v1.0 and DSS v1.0)
-- File: supabase/migrations/20261113150000_init_tks_catering.sql
-- NOTE: Once pushed, this migration file is IMMUTABLE.
-- ============================================================================

-- 0. Required Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. Custom Enumerations
-- ============================================================================

CREATE TYPE public.record_source AS ENUM (
  'ONLINE',
  'MANUAL'
);

CREATE TYPE public.record_status AS ENUM (
  'NEW_REQUEST',
  'UNDER_DISCUSSION',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED'
);

CREATE TYPE public.record_change_reason_type AS ENUM (
  'CONFIRMED_ORDER_EDIT',
  'CONFIRMED_ORDER_CANCELLATION'
);

CREATE TYPE public.availability_status AS ENUM (
  'AVAILABLE',
  'UNAVAILABLE'
);

-- ============================================================================
-- 2. Utility & Formatting Functions
-- ============================================================================

-- Function to maintain updated_at timestamps automatically
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Canonical Indian mobile number normalization (e.g. "+91 98450-12345" -> "9845012345")
CREATE OR REPLACE FUNCTION public.normalize_phone(p_phone text)
RETURNS text AS $$
DECLARE
  clean text;
BEGIN
  clean := regexp_replace(COALESCE(p_phone, ''), '\D', '', 'g');
  IF length(clean) = 12 AND clean LIKE '91%' THEN
    clean := substr(clean, 3);
  ELSIF length(clean) = 11 AND clean LIKE '0%' THEN
    clean := substr(clean, 2);
  END IF;
  RETURN clean;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Table to manage transaction-safe yearly resetting sequential counters
CREATE TABLE IF NOT EXISTS public.business_sequences (
  sequence_type text NOT NULL,
  year integer NOT NULL,
  current_value integer NOT NULL DEFAULT 0,
  PRIMARY KEY (sequence_type, year)
);

ALTER TABLE public.business_sequences ENABLE ROW LEVEL SECURITY;

-- Helper to retrieve next sequential business identifier (TKS-ORD-YYYY-XXXX or TKS-INV-YYYY-XXXX)
CREATE OR REPLACE FUNCTION public.next_business_number(p_type text, p_prefix text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_year integer := EXTRACT(YEAR FROM CURRENT_DATE)::integer;
  v_next_val integer;
BEGIN
  INSERT INTO public.business_sequences (sequence_type, year, current_value)
  VALUES (p_type, v_year, 1)
  ON CONFLICT (sequence_type, year)
  DO UPDATE SET current_value = public.business_sequences.current_value + 1
  RETURNING current_value INTO v_next_val;

  RETURN p_prefix || '-' || v_year::text || '-' || LPAD(v_next_val::text, 4, '0');
END;
$$;

-- ============================================================================
-- 3. Core Tables
-- ============================================================================

-- 3.1 Administrator User Identity (Single account in v1.0)
CREATE TABLE public.admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3.2 Business Profile Settings (Central store used on Invoices)
CREATE TABLE public.business_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  logo_path text NULL,
  address text NOT NULL,
  phone_number text NOT NULL,
  gstin text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_business_settings_updated_at
  BEFORE UPDATE ON public.business_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3.3 Customers (Deduplicated by standardized mobile number)
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  mobile_number text NOT NULL UNIQUE CHECK (mobile_number ~ '^[0-9]{10,13}$'),
  address text NULL,
  notes text NULL,
  first_contacted_at timestamptz NOT NULL DEFAULT now(),
  last_contacted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3.4 Menu Categories
CREATE TABLE public.menu_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_menu_categories_updated_at
  BEFORE UPDATE ON public.menu_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3.5 Menu Items
CREATE TABLE public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.menu_categories(id) ON DELETE RESTRICT,
  name text NOT NULL,
  price_per_plate numeric(12,2) NOT NULL CHECK (price_per_plate >= 0),
  image_path text NULL,
  availability public.availability_status NOT NULL DEFAULT 'AVAILABLE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3.6 Predefined Feasts / Curated Packages
CREATE TABLE public.feasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NULL,
  tag text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_feasts_updated_at
  BEFORE UPDATE ON public.feasts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3.7 Feast Items Junction
CREATE TABLE public.feast_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feast_id uuid NOT NULL REFERENCES public.feasts(id) ON DELETE CASCADE,
  menu_item_id uuid NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_feast_item UNIQUE (feast_id, menu_item_id)
);

-- 3.8 Catering Records (Central Unified Lifecycle)
CREATE TABLE public.catering_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  source public.record_source NOT NULL,
  status public.record_status NOT NULL,
  occasion_type text NULL,
  occasion_date date NULL,
  service_time text NULL,
  plate_count integer NULL CHECK (plate_count IS NULL OR plate_count > 0),
  delivery_address text NULL,
  special_instructions text NULL,
  enquiry_notes text NULL,
  food_subtotal numeric(12,2) NOT NULL DEFAULT 0.00 CHECK (food_subtotal >= 0),
  delivery_charges numeric(12,2) NOT NULL DEFAULT 0.00 CHECK (delivery_charges >= 0),
  customization_charges numeric(12,2) NOT NULL DEFAULT 0.00 CHECK (customization_charges >= 0),
  gst_base_amount numeric(12,2) NOT NULL DEFAULT 0.00 CHECK (gst_base_amount >= 0),
  gst_rate numeric(5,2) NOT NULL DEFAULT 5.00 CHECK (gst_rate >= 0),
  gst_amount numeric(12,2) NOT NULL DEFAULT 0.00 CHECK (gst_amount >= 0),
  final_amount numeric(12,2) NOT NULL DEFAULT 0.00 CHECK (final_amount >= 0),
  final_instructions text NULL,
  confirmed_at timestamptz NULL,
  completed_at timestamptz NULL,
  cancelled_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_catering_records_updated_at
  BEFORE UPDATE ON public.catering_records
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3.9 Catering Record Items (Historical Item Snapshots)
CREATE TABLE public.catering_record_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  catering_record_id uuid NOT NULL REFERENCES public.catering_records(id) ON DELETE CASCADE,
  menu_item_id uuid NULL REFERENCES public.menu_items(id) ON DELETE SET NULL,
  item_name_snapshot text NOT NULL,
  price_per_plate_snapshot numeric(12,2) NOT NULL CHECK (price_per_plate_snapshot >= 0),
  plate_count integer NOT NULL CHECK (plate_count > 0),
  line_amount numeric(12,2) NOT NULL CHECK (line_amount >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_catering_record_items_updated_at
  BEFORE UPDATE ON public.catering_record_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3.10 Record Change Reasons (Mandatory edit & cancellation reasons + structured diff)
CREATE TABLE public.record_change_reasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  catering_record_id uuid NOT NULL REFERENCES public.catering_records(id) ON DELETE CASCADE,
  reason_type public.record_change_reason_type NOT NULL,
  reason text NOT NULL CHECK (length(trim(reason)) > 0),
  change_diff jsonb NULL,
  created_by uuid NULL REFERENCES public.admin_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3.11 Invoices (Immutable Historical Snapshots)
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  catering_record_id uuid NOT NULL REFERENCES public.catering_records(id) ON DELETE RESTRICT,
  invoice_number text UNIQUE NOT NULL,
  invoice_date date NOT NULL DEFAULT CURRENT_DATE,
  business_name_snapshot text NOT NULL,
  business_logo_path_snapshot text NULL,
  business_address_snapshot text NOT NULL,
  business_phone_snapshot text NOT NULL,
  business_gstin_snapshot text NOT NULL,
  customer_name_snapshot text NOT NULL,
  customer_mobile_snapshot text NOT NULL,
  customer_address_snapshot text NOT NULL,
  occasion_type_snapshot text NOT NULL,
  occasion_date_snapshot date NOT NULL,
  service_time_snapshot text NULL,
  plate_count_snapshot integer NOT NULL CHECK (plate_count_snapshot > 0),
  food_subtotal numeric(12,2) NOT NULL CHECK (food_subtotal >= 0),
  delivery_charges numeric(12,2) NOT NULL CHECK (delivery_charges >= 0),
  customization_charges numeric(12,2) NOT NULL CHECK (customization_charges >= 0),
  gst_rate numeric(5,2) NOT NULL DEFAULT 5.00 CHECK (gst_rate >= 0),
  gst_base_amount numeric(12,2) NOT NULL CHECK (gst_base_amount >= 0),
  gst_amount numeric(12,2) NOT NULL CHECK (gst_amount >= 0),
  final_amount numeric(12,2) NOT NULL CHECK (final_amount >= 0),
  final_instructions_snapshot text NULL,
  pdf_storage_path text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3.12 Invoice Items (Printed Line Item Snapshots)
CREATE TABLE public.invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  item_name_snapshot text NOT NULL,
  price_per_plate_snapshot numeric(12,2) NOT NULL CHECK (price_per_plate_snapshot >= 0),
  plate_count integer NOT NULL CHECK (plate_count > 0),
  line_amount numeric(12,2) NOT NULL CHECK (line_amount >= 0)
);

-- ============================================================================
-- 4. Indexes (Supporting all required BFS Access Patterns)
-- ============================================================================

CREATE INDEX idx_customers_mobile ON public.customers(mobile_number);
CREATE INDEX idx_catering_records_order_number ON public.catering_records(order_number);
CREATE INDEX idx_catering_records_customer ON public.catering_records(customer_id);
CREATE INDEX idx_catering_records_status ON public.catering_records(status);
CREATE INDEX idx_catering_records_occasion_date ON public.catering_records(occasion_date);
CREATE INDEX idx_catering_records_source ON public.catering_records(source);
CREATE INDEX idx_catering_record_items_record ON public.catering_record_items(catering_record_id);
CREATE INDEX idx_record_change_reasons_record ON public.record_change_reasons(catering_record_id);
CREATE INDEX idx_menu_items_category ON public.menu_items(category_id);
CREATE INDEX idx_feast_items_feast ON public.feast_items(feast_id);
CREATE INDEX idx_feast_items_menu_item ON public.feast_items(menu_item_id);
CREATE INDEX idx_invoices_number ON public.invoices(invoice_number);
CREATE INDEX idx_invoices_record ON public.invoices(catering_record_id);
CREATE INDEX idx_invoice_items_invoice ON public.invoice_items(invoice_id);

-- ============================================================================
-- 5. Business Stored Procedures (Atomic & Secure)
-- ============================================================================

-- 5.1 Public Online Enquiry Submission RPC (SECURITY DEFINER)
-- Atomically handles mobile normalization, customer lookup/upsert,
-- catering record creation in NEW_REQUEST, item snapshotting, and calculation.
CREATE OR REPLACE FUNCTION public.submit_online_enquiry(
  p_customer_name text,
  p_customer_phone text,
  p_delivery_address text,
  p_occasion_type text,
  p_occasion_date date,
  p_service_time text,
  p_plate_count integer,
  p_special_instructions text,
  p_selected_item_ids uuid[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_normalized_phone text;
  v_customer_id uuid;
  v_order_number text;
  v_record_id uuid;
  v_subtotal numeric(12,2) := 0.00;
  v_item record;
  v_item_count integer := 0;
BEGIN
  -- 1. Validation
  IF p_customer_name IS NULL OR length(trim(p_customer_name)) = 0 THEN
    RAISE EXCEPTION 'Customer name is required';
  END IF;

  v_normalized_phone := public.normalize_phone(p_customer_phone);
  IF length(v_normalized_phone) < 10 THEN
    RAISE EXCEPTION 'Valid 10-digit mobile number is required';
  END IF;

  IF p_plate_count IS NULL OR p_plate_count <= 0 THEN
    RAISE EXCEPTION 'Plate count must be greater than zero';
  END IF;

  IF array_length(p_selected_item_ids, 1) IS NULL OR array_length(p_selected_item_ids, 1) = 0 THEN
    RAISE EXCEPTION 'At least one food item must be selected';
  END IF;

  -- 2. Customer Lookup or Creation
  SELECT id INTO v_customer_id
  FROM public.customers
  WHERE mobile_number = v_normalized_phone;

  IF v_customer_id IS NOT NULL THEN
    UPDATE public.customers
    SET name = trim(p_customer_name),
        address = COALESCE(trim(p_delivery_address), address),
        last_contacted_at = now()
    WHERE id = v_customer_id;
  ELSE
    INSERT INTO public.customers (name, mobile_number, address, first_contacted_at, last_contacted_at)
    VALUES (trim(p_customer_name), v_normalized_phone, trim(p_delivery_address), now(), now())
    RETURNING id INTO v_customer_id;
  END IF;

  -- 3. Calculate Authoritative Food Subtotal from active menu items
  FOR v_item IN
    SELECT id, name, price_per_plate
    FROM public.menu_items
    WHERE id = ANY(p_selected_item_ids) AND availability = 'AVAILABLE'
  LOOP
    v_subtotal := v_subtotal + (v_item.price_per_plate * p_plate_count);
    v_item_count := v_item_count + 1;
  END LOOP;

  IF v_item_count = 0 THEN
    RAISE EXCEPTION 'None of the selected items are currently available';
  END IF;

  -- 4. Generate Business Order Identifier
  v_order_number := public.next_business_number('ORDER', 'TKS-ORD');

  -- 5. Insert Central Catering Record
  INSERT INTO public.catering_records (
    order_number,
    customer_id,
    source,
    status,
    occasion_type,
    occasion_date,
    service_time,
    plate_count,
    delivery_address,
    special_instructions,
    food_subtotal,
    delivery_charges,
    customization_charges,
    gst_base_amount,
    gst_rate,
    gst_amount,
    final_amount
  ) VALUES (
    v_order_number,
    v_customer_id,
    'ONLINE',
    'NEW_REQUEST',
    trim(p_occasion_type),
    p_occasion_date,
    trim(p_service_time),
    p_plate_count,
    trim(p_delivery_address),
    trim(p_special_instructions),
    v_subtotal,
    0.00,
    0.00,
    v_subtotal,
    5.00,
    round(v_subtotal * 0.05, 2),
    v_subtotal + round(v_subtotal * 0.05, 2)
  )
  RETURNING id INTO v_record_id;

  -- 6. Insert Historical Item Snapshots
  INSERT INTO public.catering_record_items (
    catering_record_id,
    menu_item_id,
    item_name_snapshot,
    price_per_plate_snapshot,
    plate_count,
    line_amount
  )
  SELECT
    v_record_id,
    id,
    name,
    price_per_plate,
    p_plate_count,
    price_per_plate * p_plate_count
  FROM public.menu_items
  WHERE id = ANY(p_selected_item_ids) AND availability = 'AVAILABLE';

  -- 7. Return Result Payload
  RETURN jsonb_build_object(
    'success', true,
    'order_number', v_order_number,
    'record_id', v_record_id,
    'food_subtotal', v_subtotal,
    'final_amount', v_subtotal + round(v_subtotal * 0.05, 2)
  );
END;
$$;

-- 5.2 Invoice Generation Stored Procedure (SECURITY DEFINER)
-- Freezes current order details, customer details, and business settings into an immutable invoice
CREATE OR REPLACE FUNCTION public.generate_invoice_for_order(p_record_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rec record;
  v_cust record;
  v_biz record;
  v_invoice_number text;
  v_invoice_id uuid;
BEGIN
  -- 1. Fetch & Verify Catering Record is CONFIRMED
  SELECT * INTO v_rec
  FROM public.catering_records
  WHERE id = p_record_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Catering record not found';
  END IF;

  IF v_rec.status <> 'CONFIRMED' THEN
    RAISE EXCEPTION 'Invoices can only be generated for orders in CONFIRMED status (current: %)', v_rec.status;
  END IF;

  -- 2. Fetch Customer Details
  SELECT * INTO v_cust
  FROM public.customers
  WHERE id = v_rec.customer_id;

  -- 3. Fetch Active Business Settings
  SELECT * INTO v_biz
  FROM public.business_settings
  ORDER BY created_at ASC
  LIMIT 1;

  -- 4. Generate New Sequential Invoice Number
  v_invoice_number := public.next_business_number('INVOICE', 'TKS-INV');

  -- 5. Insert Invoice Snapshot Header
  INSERT INTO public.invoices (
    catering_record_id,
    invoice_number,
    invoice_date,
    business_name_snapshot,
    business_logo_path_snapshot,
    business_address_snapshot,
    business_phone_snapshot,
    business_gstin_snapshot,
    customer_name_snapshot,
    customer_mobile_snapshot,
    customer_address_snapshot,
    occasion_type_snapshot,
    occasion_date_snapshot,
    service_time_snapshot,
    plate_count_snapshot,
    food_subtotal,
    delivery_charges,
    customization_charges,
    gst_rate,
    gst_base_amount,
    gst_amount,
    final_amount,
    final_instructions_snapshot
  ) VALUES (
    p_record_id,
    v_invoice_number,
    CURRENT_DATE,
    COALESCE(v_biz.business_name, 'TKS Iyengars Mysore Catering'),
    v_biz.logo_path,
    COALESCE(v_biz.address, 'Mysuru, Karnataka'),
    COALESCE(v_biz.phone_number, '+91 821 2456789'),
    COALESCE(v_biz.gstin, '29ABCDE1234F1Z5'),
    v_cust.name,
    v_cust.mobile_number,
    COALESCE(v_rec.delivery_address, v_cust.address, 'Mysuru'),
    COALESCE(v_rec.occasion_type, 'Traditional Catering Feast'),
    COALESCE(v_rec.occasion_date, CURRENT_DATE),
    v_rec.service_time,
    COALESCE(v_rec.plate_count, 1),
    v_rec.food_subtotal,
    v_rec.delivery_charges,
    v_rec.customization_charges,
    v_rec.gst_rate,
    v_rec.gst_base_amount,
    v_rec.gst_amount,
    v_rec.final_amount,
    v_rec.final_instructions
  )
  RETURNING id INTO v_invoice_id;

  -- 6. Copy Itemized Food Rows from record item snapshots
  INSERT INTO public.invoice_items (
    invoice_id,
    item_name_snapshot,
    price_per_plate_snapshot,
    plate_count,
    line_amount
  )
  SELECT
    v_invoice_id,
    item_name_snapshot,
    price_per_plate_snapshot,
    plate_count,
    line_amount
  FROM public.catering_record_items
  WHERE catering_record_id = p_record_id;

  RETURN jsonb_build_object(
    'success', true,
    'invoice_number', v_invoice_number,
    'invoice_id', v_invoice_id
  );
END;
$$;

-- ============================================================================
-- 6. Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on every table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feast_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catering_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catering_record_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.record_change_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- 6.1 Public Anonymous Access (Catalogue & Feasts Read Only)
CREATE POLICY "Public can view categories"
  ON public.menu_categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can view available menu items"
  ON public.menu_items FOR SELECT
  TO anon, authenticated
  USING (availability = 'AVAILABLE');

CREATE POLICY "Public can view feasts"
  ON public.feasts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can view feast items"
  ON public.feast_items FOR SELECT
  TO anon, authenticated
  USING (true);

-- 6.2 Authenticated Manager Full Administrative Access
CREATE POLICY "Admin has full access to admin_users"
  ON public.admin_users FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Admin has full access to business_settings"
  ON public.business_settings FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Admin has full access to customers"
  ON public.customers FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Admin has full access to menu_categories"
  ON public.menu_categories FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Admin has full access to menu_items"
  ON public.menu_items FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Admin has full access to feasts"
  ON public.feasts FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Admin has full access to feast_items"
  ON public.feast_items FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Admin has full access to catering_records"
  ON public.catering_records FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Admin has full access to catering_record_items"
  ON public.catering_record_items FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Admin has full access to record_change_reasons"
  ON public.record_change_reasons FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Admin has full access to invoices"
  ON public.invoices FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Admin has full access to invoice_items"
  ON public.invoice_items FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

