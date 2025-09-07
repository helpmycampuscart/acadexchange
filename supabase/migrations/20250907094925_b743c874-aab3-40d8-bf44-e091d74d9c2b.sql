-- 1) Remove duplicate users by id, keep the most recent
WITH ranked AS (
  SELECT ctid, id, created_at,
         row_number() OVER (PARTITION BY id ORDER BY created_at DESC) AS rn
  FROM public.users
), to_delete AS (
  SELECT ctid FROM ranked WHERE rn > 1
)
DELETE FROM public.users u
USING to_delete d
WHERE u.ctid = d.ctid;

-- 2) Enforce primary key on id to prevent future duplicates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_pkey'
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
  END IF;
END $$;

-- 3) Update RPC to count users accurately
CREATE OR REPLACE FUNCTION public.get_total_user_count()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::int FROM public.users;
$$;