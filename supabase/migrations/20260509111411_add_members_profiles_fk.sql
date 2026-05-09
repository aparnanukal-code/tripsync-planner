/*
  # Add foreign key from members.user_id to profiles.id

  ## Problem
  The app queries `members` with `.select("user_id, profiles(display_name)")` 
  which requires PostgREST to resolve a relationship between members and profiles.
  Currently members.user_id only has a FK to auth.users(id), not to profiles(id),
  so PostgREST returns a 400 error: "no relationship found between members and profiles".

  ## Fix
  Add a foreign key constraint from members.user_id to profiles.id so PostgREST
  can resolve the join automatically.
*/

ALTER TABLE public.members
  ADD CONSTRAINT members_user_id_profiles_fk
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
