-- Inscrições do Curso de Oratória
CREATE TABLE IF NOT EXISTS course_registrations (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name text NOT NULL,
    birth_date text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    profession text,
    city text,
    fear_level text NOT NULL,
    symptoms text[] NOT NULL DEFAULT '{}',
    avoids_exposure text,
    previous_course text,
    expectations text NOT NULL,
    communication_area text NOT NULL,
    wants_lunch text NOT NULL,
    referral_source text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE course_registrations IS 'Pré-inscrições do Curso de Oratória ministrado pela psicóloga.';

-- RLS
ALTER TABLE course_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on course_registrations"
    ON course_registrations
    FOR ALL
    USING (true)
    WITH CHECK (true);
