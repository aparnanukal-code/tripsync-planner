
-- Foreign keys to profiles (needed for PostgREST embedded selects)
ALTER TABLE public.members
  ADD CONSTRAINT members_user_profile_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.activities
  ADD CONSTRAINT activities_added_by_profile_fk FOREIGN KEY (added_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.votes
  ADD CONSTRAINT votes_user_profile_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Notes table
CREATE TABLE public.trip_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) > 0 AND char_length(body) <= 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX trip_notes_trip_idx ON public.trip_notes(trip_id, created_at DESC);

ALTER TABLE public.trip_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trip_notes_select" ON public.trip_notes
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "trip_notes_insert" ON public.trip_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trip_notes_update" ON public.trip_notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "trip_notes_delete" ON public.trip_notes
  FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trip_notes_updated_at
  BEFORE UPDATE ON public.trip_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Realtime
ALTER TABLE public.trip_notes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_notes;
