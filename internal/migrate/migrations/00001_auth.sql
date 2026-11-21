-- +goose Up
-- Auth tables, see docs/AUTH.md "Datamodell".

CREATE TABLE users (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    epost         text NOT NULL UNIQUE CHECK (epost = lower(epost) AND epost <> ''),
    passord_hash  text NULL, -- NULL until the owner has chosen a password
    opprettet     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  bytea NOT NULL UNIQUE, -- SHA-256 of the session token, never the token itself
    opprettet   timestamptz NOT NULL DEFAULT now(),
    sist_brukt  timestamptz NOT NULL DEFAULT now(),
    utloper     timestamptz NOT NULL,
    enhet       text NOT NULL DEFAULT ''
);
CREATE INDEX sessions_user_id_idx ON sessions (user_id);

CREATE TABLE password_tokens (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash       bytea NOT NULL UNIQUE, -- SHA-256 of the token
    formal           text NOT NULL CHECK (formal IN ('reset', 'oppsett', 'epost')),
    ny_epost         text NULL CHECK (ny_epost IS NULL OR ny_epost = lower(ny_epost)), -- only for formal = 'epost'
    utloper          timestamptz NOT NULL,
    brukt_tidspunkt  timestamptz NULL,
    opprettet        timestamptz NOT NULL DEFAULT now(),
    CHECK ((formal = 'epost') = (ny_epost IS NOT NULL))
);
CREATE INDEX password_tokens_user_id_idx ON password_tokens (user_id);

CREATE TABLE auth_hendelser (
    id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tidspunkt  timestamptz NOT NULL DEFAULT now(),
    type       text NOT NULL,
    user_id    uuid NULL REFERENCES users(id) ON DELETE SET NULL,
    ip         text NOT NULL DEFAULT '',
    resultat   text NOT NULL
);
CREATE INDEX auth_hendelser_tidspunkt_idx ON auth_hendelser (tidspunkt);
CREATE INDEX auth_hendelser_ip_idx ON auth_hendelser (ip, tidspunkt);

-- +goose Down
DROP TABLE auth_hendelser;
DROP TABLE password_tokens;
DROP TABLE sessions;
DROP TABLE users;
