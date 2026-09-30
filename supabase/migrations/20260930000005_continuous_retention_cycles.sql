-- ====================================================================
-- TRAVESÍA MIGRATION 005: CONTINUOUS RETENTION JOURNEY & ONGOING CYCLES
-- ====================================================================
-- Separates Personal Foundation Journey, Global Community Cycle,
-- and Billing Cycle. Creates ongoing monthly cycles catalog and
-- member reflections for long-term retention.
-- ====================================================================

-- 1. ADD CONTINUOUS RETENTION FIELDS TO PROFILES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS journey_started_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS foundation_completed_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_cycle_id TEXT DEFAULT 'cycle-relaciones';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_cycle_week INTEGER DEFAULT 2;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS billing_started_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 month');

-- 2. ONGOING CYCLES TABLE
CREATE TABLE IF NOT EXISTS public.ongoing_cycles (
  id TEXT PRIMARY KEY,
  cycle_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  theme TEXT NOT NULL,
  description TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('active', 'upcoming', 'completed')),
  weeks JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CYCLE REFLECTIONS TABLE (END OF CHAPTER REFLECTION)
CREATE TABLE IF NOT EXISTS public.cycle_reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cycle_id TEXT NOT NULL REFERENCES public.ongoing_cycles(id) ON DELETE CASCADE,
  cycle_title TEXT NOT NULL,
  discovered TEXT NOT NULL,        -- ¿Qué has descubierto?
  changed TEXT NOT NULL,           -- ¿Qué ha cambiado?
  carrying_forward TEXT NOT NULL,  -- ¿Qué quieres llevar contigo?
  explore_next TEXT NOT NULL,      -- ¿Qué quieres explorar ahora?
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RLS POLICIES
ALTER TABLE public.ongoing_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_reflections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ongoing cycles viewable by everyone" ON public.ongoing_cycles;
CREATE POLICY "Ongoing cycles viewable by everyone"
  ON public.ongoing_cycles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage ongoing cycles" ON public.ongoing_cycles;
CREATE POLICY "Admins manage ongoing cycles"
  ON public.ongoing_cycles FOR ALL
  USING (auth.jwt()->>'role' = 'admin' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

DROP POLICY IF EXISTS "Users can view own reflections" ON public.cycle_reflections;
CREATE POLICY "Users can view own reflections"
  ON public.cycle_reflections FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own reflections" ON public.cycle_reflections;
CREATE POLICY "Users can insert own reflections"
  ON public.cycle_reflections FOR INSERT
  WITH CHECK (auth.uid() = user_id);
