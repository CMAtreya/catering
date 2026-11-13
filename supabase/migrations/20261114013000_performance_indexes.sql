-- ============================================================================
-- Migration: 20261114013000_performance_indexes.sql
-- Description: Adds high-performance B-tree indexes for fast queries, filtering,
--              and sorting on catering records and customers.
-- ============================================================================

-- 1. Index on created_at for fast order queries with ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_catering_records_created_at_desc 
  ON public.catering_records (created_at DESC);

-- 2. Composite index for status + created_at (frequent admin filter)
CREATE INDEX IF NOT EXISTS idx_catering_records_status_created 
  ON public.catering_records (status, created_at DESC);

-- 3. Composite index for occasion_date + service_time (calendar/kitchen scheduling)
CREATE INDEX IF NOT EXISTS idx_catering_records_date_time 
  ON public.catering_records (occasion_date, service_time);

-- 4. Index on customers last_contacted_at for fast CRM list sorting
CREATE INDEX IF NOT EXISTS idx_customers_last_contacted_desc 
  ON public.customers (last_contacted_at DESC);

-- 5. Index on menu_items availability and created_at for fast menu queries
CREATE INDEX IF NOT EXISTS idx_menu_items_avail_created 
  ON public.menu_items (availability, created_at);

