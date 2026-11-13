-- ============================================================================
-- Migration: 20261113160000_permit_anon_admin_and_public_settings.sql
-- Description: Enables public reading of business settings and permits full
--              application-level management across all entities for the
--              Catering Desk admin interface using the anon key.
-- ============================================================================

-- 1. Public Read & Admin Access for Business Settings
CREATE POLICY "Public can view business settings"
  ON public.business_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anon can modify business settings"
  ON public.business_settings FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- 2. Permit Anon Access for Catering Management in Admin Desk
CREATE POLICY "Anon can manage customers"
  ON public.customers FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can manage catering_records"
  ON public.catering_records FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can manage catering_record_items"
  ON public.catering_record_items FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can manage record_change_reasons"
  ON public.record_change_reasons FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can manage invoices"
  ON public.invoices FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can manage invoice_items"
  ON public.invoice_items FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can manage menu_categories"
  ON public.menu_categories FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can manage menu_items"
  ON public.menu_items FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can manage feasts"
  ON public.feasts FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can manage feast_items"
  ON public.feast_items FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- 3. Atomic RPC for Admin Manual Order Creation
CREATE OR REPLACE FUNCTION public.admin_create_manual_order(
  p_customer_name text,
  p_customer_phone text,
  p_delivery_address text,
  p_occasion_type text,
  p_occasion_date date,
  p_service_time text,
  p_plate_count integer,
  p_delivery_charges numeric,
  p_customization_charges numeric,
  p_special_instructions text,
  p_enquiry_notes text,
  p_selected_items jsonb -- array of { id, name, price_per_plate, plate_count }
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
  v_food_subtotal numeric(12,2) := 0.00;
  v_gst_base numeric(12,2) := 0.00;
  v_gst_amount numeric(12,2) := 0.00;
  v_final_amount numeric(12,2) := 0.00;
  v_item jsonb;
  v_item_id uuid;
  v_item_name text;
  v_item_price numeric(12,2);
  v_item_count integer;
  v_line_amount numeric(12,2);
BEGIN
  -- Normalize customer phone number
  v_normalized_phone := public.normalize_phone(p_customer_phone);

  -- 1. Upsert Customer
  INSERT INTO public.customers (
    mobile_number,
    name,
    address,
    first_contacted_at,
    last_contacted_at,
    notes
  )
  VALUES (
    v_normalized_phone,
    trim(p_customer_name),
    nullif(trim(p_delivery_address), ''),
    now(),
    now(),
    p_enquiry_notes
  )
  ON CONFLICT (mobile_number) DO UPDATE
  SET
    name = CASE 
      WHEN length(trim(EXCLUDED.name)) > 0 THEN trim(EXCLUDED.name) 
      ELSE public.customers.name 
    END,
    address = COALESCE(nullif(trim(EXCLUDED.address), ''), public.customers.address),
    last_contacted_at = now(),
    notes = CASE
      WHEN length(trim(COALESCE(EXCLUDED.notes, ''))) > 0 THEN
        CASE 
          WHEN public.customers.notes IS NOT NULL THEN public.customers.notes || E'\n' || EXCLUDED.notes
          ELSE EXCLUDED.notes
        END
      ELSE public.customers.notes
    END
  RETURNING id INTO v_customer_id;

  -- 2. Generate Sequence Number (TKS-ORD-YYYY-XXXX)
  v_order_number := public.next_business_number('ORD');

  -- 3. Calculate Food Subtotal from JSON items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_selected_items)
  LOOP
    v_item_price := COALESCE((v_item->>'price_per_plate')::numeric, 0.00);
    v_item_count := COALESCE((v_item->>'plate_count')::integer, p_plate_count);
    v_line_amount := round(v_item_price * v_item_count, 2);
    v_food_subtotal := v_food_subtotal + v_line_amount;
  END LOOP;

  -- 4. Calculate Taxes & Totals
  v_gst_base := v_food_subtotal + COALESCE(p_delivery_charges, 0.00) + COALESCE(p_customization_charges, 0.00);
  v_gst_amount := round(v_gst_base * 0.05, 2);
  v_final_amount := v_gst_base + v_gst_amount;

  -- 5. Insert Catering Record
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
    enquiry_notes,
    food_subtotal,
    delivery_charges,
    customization_charges,
    gst_base_amount,
    gst_rate,
    gst_amount,
    final_amount
  )
  VALUES (
    v_order_number,
    v_customer_id,
    'MANUAL',
    'UNDER_DISCUSSION',
    trim(p_occasion_type),
    p_occasion_date,
    p_service_time,
    p_plate_count,
    nullif(trim(p_delivery_address), ''),
    p_special_instructions,
    p_enquiry_notes,
    v_food_subtotal,
    COALESCE(p_delivery_charges, 0.00),
    COALESCE(p_customization_charges, 0.00),
    v_gst_base,
    5.00,
    v_gst_amount,
    v_final_amount
  )
  RETURNING id INTO v_record_id;

  -- 6. Insert Catering Record Items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_selected_items)
  LOOP
    BEGIN
      v_item_id := (v_item->>'id')::uuid;
    EXCEPTION WHEN OTHERS THEN
      v_item_id := NULL;
    END;

    v_item_name := COALESCE(v_item->>'name', 'Heritage Dish');
    v_item_price := COALESCE((v_item->>'price_per_plate')::numeric, 0.00);
    v_item_count := COALESCE((v_item->>'plate_count')::integer, p_plate_count);
    v_line_amount := round(v_item_price * v_item_count, 2);

    INSERT INTO public.catering_record_items (
      catering_record_id,
      menu_item_id,
      item_name_snapshot,
      price_per_plate_snapshot,
      plate_count,
      line_amount
    )
    VALUES (
      v_record_id,
      v_item_id,
      v_item_name,
      v_item_price,
      v_item_count,
      v_line_amount
    );
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'order_number', v_order_number,
    'record_id', v_record_id,
    'food_subtotal', v_food_subtotal,
    'final_amount', v_final_amount
  );
END;
$$;

