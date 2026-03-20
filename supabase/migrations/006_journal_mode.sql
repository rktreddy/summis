-- 006: Add journal_mode column to journal_entries
ALTER TABLE public.journal_entries
  ADD COLUMN IF NOT EXISTS journal_mode text DEFAULT 'free';

COMMENT ON COLUMN public.journal_entries.journal_mode IS 'Journal entry mode: free, gratitude, or reflection';
