-- Neon コンソールの SQL エディタで実行してください
CREATE TABLE IF NOT EXISTS rsvp_responses (
    id                   SERIAL       PRIMARY KEY,
    name                 VARCHAR(100) NOT NULL,
    furigana             VARCHAR(100),
    attendance           VARCHAR(10)  NOT NULL CHECK (attendance IN ('attend', 'absent')),
    guest_count          SMALLINT,
    dietary_restrictions TEXT,
    postal_code          VARCHAR(20),
    address              TEXT,
    message              TEXT,
    submitted_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
