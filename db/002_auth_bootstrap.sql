-- Bootstrap automático de perfis para novos usuários do Supabase Auth

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'patients_profile_id_unique'
    ) THEN
        ALTER TABLE public.patients
            ADD CONSTRAINT patients_profile_id_unique UNIQUE (profile_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'psychologists_profile_id_unique'
    ) THEN
        ALTER TABLE public.psychologists
            ADD CONSTRAINT psychologists_profile_id_unique UNIQUE (profile_id);
    END IF;
END $$;

CREATE OR REPLACE FUNCTION public.bootstrap_patient_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    created_profile_id uuid;
    resolved_name text;
BEGIN
    resolved_name := COALESCE(
        NULLIF(trim(NEW.raw_user_meta_data ->> 'full_name'), ''),
        NULLIF(split_part(NEW.email, '@', 1), ''),
        'Paciente'
    );

    INSERT INTO public.profiles (user_id, role, full_name)
    VALUES (NEW.id, 'patient', resolved_name)
    ON CONFLICT (user_id) DO NOTHING
    RETURNING id INTO created_profile_id;

    IF created_profile_id IS NULL THEN
        SELECT id
        INTO created_profile_id
        FROM public.profiles
        WHERE user_id = NEW.id;
    END IF;

    INSERT INTO public.patients (profile_id)
    VALUES (created_profile_id)
    ON CONFLICT (profile_id) DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.bootstrap_patient_profile();

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS patients_owner_select ON public.patients;

CREATE POLICY patients_owner_select
ON public.patients
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE profiles.id = patients.profile_id
          AND profiles.user_id = auth.uid()
    )
);
