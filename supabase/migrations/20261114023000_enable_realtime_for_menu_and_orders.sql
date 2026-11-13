-- Enable Supabase Realtime for Menu Management, Feasts, and Orders
DO $$
BEGIN
  -- Add tables to supabase_realtime publication if not already added
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'menu_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'menu_categories'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_categories;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'catering_records'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.catering_records;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'feasts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.feasts;
  END IF;
END $$;

-- Set REPLICA IDENTITY FULL so UPDATE and DELETE events carry the full previous record
ALTER TABLE public.menu_items REPLICA IDENTITY FULL;
ALTER TABLE public.menu_categories REPLICA IDENTITY FULL;
ALTER TABLE public.catering_records REPLICA IDENTITY FULL;
ALTER TABLE public.feasts REPLICA IDENTITY FULL;

