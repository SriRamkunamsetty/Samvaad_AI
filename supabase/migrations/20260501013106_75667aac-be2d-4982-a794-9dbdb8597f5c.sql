ALTER TABLE public.outreach_runs
  ADD COLUMN IF NOT EXISTS outcome text,
  ADD COLUMN IF NOT EXISTS outcome_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_outreach_runs_outcome ON public.outreach_runs(outcome);
CREATE INDEX IF NOT EXISTS idx_outreach_runs_created_at ON public.outreach_runs(created_at DESC);