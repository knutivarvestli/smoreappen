-- +goose Up
-- Domain tables, see docs/SPEC_NEW.md section 6.
-- Enumerations are text + CHECK with ASCII codes; the UI maps codes to Norwegian labels.
-- Top-level tables carry user_id. Tables that link rows from several owners
-- (renn_ski, smore_lag, vurdering) use composite foreign keys on (user_id, id)
-- so the database itself prevents mixing data between users.

-- Snow types. 'gammel_omdannet' comes from the grip wax rows in INNHENTING.md.
CREATE DOMAIN snotyper AS text[] NOT NULL DEFAULT '{}'
    CHECK (VALUE <@ ARRAY['nysno','snofall','finkornet','grovkornet','vat','veldig_vat','isete','skitten','rim','gammel_omdannet']::text[]);

CREATE DOMAIN disiplin AS text
    CHECK (VALUE IN ('klassisk','skoyting'));

-- +goose StatementBegin
CREATE FUNCTION sett_endret() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.endret := now();
    RETURN NEW;
END;
$$;
-- +goose StatementEnd

-- Ski -----------------------------------------------------------------------

CREATE TABLE ski (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    navn         text NOT NULL CHECK (navn <> ''),
    disiplin     disiplin NOT NULL,
    merke        text NOT NULL DEFAULT '', -- Fischer, Salomon, Atomic, Madshus, Rossignol or free text for "Annet"
    modell       text NOT NULL DEFAULT '',
    lengde_cm    integer NULL CHECK (lengde_cm BETWEEN 100 AND 250),
    arsmodell    integer NULL CHECK (arsmodell BETWEEN 1950 AND 2100),
    vekt_fra_kg  numeric(5,1) NULL CHECK (vekt_fra_kg > 0),
    vekt_til_kg  numeric(5,1) NULL CHECK (vekt_til_kg > 0),
    slip         text NOT NULL DEFAULT '',
    beskrivelse  text NOT NULL DEFAULT '',
    status       text NOT NULL DEFAULT 'aktiv' CHECK (status IN ('aktiv','hvilende','solgt')),
    opprettet    timestamptz NOT NULL DEFAULT now(),
    endret       timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, id),
    CHECK (vekt_fra_kg IS NULL OR vekt_til_kg IS NULL OR vekt_fra_kg <= vekt_til_kg)
);
CREATE INDEX ski_user_id_idx ON ski (user_id);
CREATE TRIGGER ski_endret BEFORE UPDATE ON ski FOR EACH ROW EXECUTE FUNCTION sett_endret();

-- Produkter ------------------------------------------------------------------

CREATE TABLE produkt (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    merke          text NOT NULL CHECK (merke <> ''),
    modell         text NOT NULL CHECK (modell <> ''),
    kategori       text NOT NULL CHECK (kategori IN ('glider_fast','glider_flytende','pulver','festevoks','klister','bindevoks','rens','verktoy')),
    temp_fra       numeric(4,1) NULL, -- NULL = not stated. Never guessed.
    temp_til       numeric(4,1) NULL,
    farge          text NULL,          -- grip only
    snotype        text NULL,          -- glider only, free text as stated by the source
    luftfuktighet  text NULL,          -- glider only, e.g. "<65 %"
    smorejern_c    integer NULL CHECK (smorejern_c BETWEEN 80 AND 200),
    kilde_url      text NULL,
    opprettet      timestamptz NOT NULL DEFAULT now(),
    endret         timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, id),
    CHECK (temp_fra IS NULL OR temp_til IS NULL OR temp_fra <= temp_til)
);
CREATE INDEX produkt_user_id_idx ON produkt (user_id, kategori);
CREATE TRIGGER produkt_endret BEFORE UPDATE ON produkt FOR EACH ROW EXECUTE FUNCTION sett_endret();

-- Grip wax temperature depends on snow, so a product can have several rows.
CREATE TABLE produkt_sno_rad (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    produkt_id  uuid NOT NULL REFERENCES produkt(id) ON DELETE CASCADE,
    sno_tekst   text NOT NULL,
    sno_tags    snotyper,
    temp_fra    numeric(4,1) NOT NULL,
    temp_til    numeric(4,1) NOT NULL,
    rekkefolge  integer NOT NULL DEFAULT 0,
    CHECK (temp_fra <= temp_til)
);
CREATE INDEX produkt_sno_rad_produkt_idx ON produkt_sno_rad (produkt_id);

-- Web pages about a product, used for the summary. Same site only once per product.
CREATE TABLE produkt_kilde (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    produkt_id   uuid NOT NULL REFERENCES produkt(id) ON DELETE CASCADE,
    url          text NOT NULL,
    domene       text NOT NULL,
    hentet_dato  timestamptz NULL,
    UNIQUE (produkt_id, domene)
);

CREATE TABLE produkt_beskrivelse (
    produkt_id     uuid PRIMARY KEY REFERENCES produkt(id) ON DELETE CASCADE,
    avsnitt        jsonb NOT NULL, -- [{ "overskrift": "...", "tekst": "..." }]
    generert_dato  timestamptz NOT NULL DEFAULT now(),
    kilder_hash    text NOT NULL   -- detects "Du har endret kildene"
);

-- Andres erfaringer ----------------------------------------------------------

CREATE TABLE ekstern_kilde (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    domene        text NOT NULL,
    url           text NOT NULL,
    tittel        text NULL,
    innhold_hash  text NULL, -- hash of fetched page; the page text itself is never stored
    sist_hentet   timestamptz NULL,
    opprettet     timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, domene) -- the same domain cannot be added twice (INNHENTING.md)
);

CREATE TABLE ekstern_tips (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kilde_id       uuid NOT NULL REFERENCES ekstern_kilde(id) ON DELETE CASCADE,
    disiplin       disiplin NOT NULL,
    temp_fra       numeric(4,1) NULL,
    temp_til       numeric(4,1) NULL,
    snotyper       snotyper,
    lag            jsonb NOT NULL DEFAULT '[]', -- [{ "rolle": "rill|glid|feste", "produkt": "...", "metode": "..." }]
    sammendrag     text NOT NULL CHECK (char_length(sammendrag) <= 400),
    sikkerhet      text NOT NULL CHECK (sikkerhet IN ('hoy','middels','lav')),
    mangler_tekst  text[] NOT NULL DEFAULT '{}', -- e.g. {"Mangler snøtemperatur"}
    status         text NOT NULL DEFAULT 'utkast' CHECK (status IN ('utkast','godkjent','forkastet')),
    hentet_dato    timestamptz NOT NULL DEFAULT now(),
    endret         timestamptz NOT NULL DEFAULT now(),
    CHECK (temp_fra IS NULL OR temp_til IS NULL OR temp_fra <= temp_til)
);
CREATE INDEX ekstern_tips_sok_idx ON ekstern_tips (user_id, disiplin, status);
CREATE TRIGGER ekstern_tips_endret BEFORE UPDATE ON ekstern_tips FOR EACH ROW EXECUTE FUNCTION sett_endret();

-- Renn -----------------------------------------------------------------------

CREATE TABLE renn (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dato                date NOT NULL DEFAULT current_date,
    sted                text NOT NULL DEFAULT '',
    renntype            text NOT NULL DEFAULT 'renn' CHECK (renntype IN ('renn','trening')),
    disiplin            disiplin NOT NULL,
    lufttemp            numeric(4,1) NULL,
    snotemp             numeric(4,1) NULL,
    snoopprinnelse      text NULL CHECK (snoopprinnelse IN ('naturlig','kunstsno','blandet')),
    snotyper            snotyper,
    fuktighet           text NULL CHECK (fuktighet IN ('torr','normal','fuktig')),
    loypehardhet        text NULL CHECK (loypehardhet IN ('myk','middels','hard','isete')),
    snoalder            text NULL CHECK (snoalder IN ('fersk','dager','gammel')),
    vind                text NULL CHECK (vind IN ('ingen','lett','sterk')),
    sol                 boolean NULL,
    endret_underveis    boolean NULL,
    notat               text NOT NULL DEFAULT '',
    utkast              boolean NOT NULL DEFAULT true,  -- the step form saves as it goes
    vurdering_mangler   boolean NOT NULL DEFAULT true,
    opprettet           timestamptz NOT NULL DEFAULT now(),
    endret              timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, id)
);
CREATE INDEX renn_user_dato_idx ON renn (user_id, dato DESC);
CREATE INDEX renn_user_disiplin_idx ON renn (user_id, disiplin, snoopprinnelse);
CREATE TRIGGER renn_endret BEFORE UPDATE ON renn FOR EACH ROW EXECUTE FUNCTION sett_endret();

CREATE TABLE renn_ski (
    user_id  uuid NOT NULL,
    renn_id  uuid NOT NULL,
    ski_id   uuid NOT NULL,
    valgt    boolean NOT NULL DEFAULT false, -- the pair chosen for the race when several were tested
    PRIMARY KEY (renn_id, ski_id),
    UNIQUE (user_id, renn_id, ski_id),
    FOREIGN KEY (user_id, renn_id) REFERENCES renn (user_id, id) ON DELETE CASCADE,
    -- RESTRICT: a ski with races is never deleted; it is marked 'solgt' instead.
    FOREIGN KEY (user_id, ski_id) REFERENCES ski (user_id, id) ON DELETE RESTRICT
);
CREATE INDEX renn_ski_ski_idx ON renn_ski (ski_id);

-- Sold skis cannot be chosen for a race. Existing rows are kept for history.
-- +goose StatementBegin
CREATE FUNCTION renn_ski_ikke_solgt() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM ski WHERE id = NEW.ski_id AND status = 'solgt') THEN
        RAISE EXCEPTION 'ski % er solgt og kan ikke velges', NEW.ski_id USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
END;
$$;
-- +goose StatementEnd
CREATE TRIGGER renn_ski_ikke_solgt BEFORE INSERT ON renn_ski FOR EACH ROW EXECUTE FUNCTION renn_ski_ikke_solgt();

CREATE TABLE smore_lag (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        uuid NOT NULL,
    renn_id        uuid NOT NULL,
    ski_id         uuid NOT NULL,
    rolle          text NOT NULL CHECK (rolle IN ('rill','glid','feste')),
    rekkefolge     integer NOT NULL CHECK (rekkefolge >= 1),
    produkt_id     uuid NULL,
    metode         text NULL CHECK (metode IN ('stryk_pa','kork_inn','gni','borst','pulver','tynt_lag')),
    strykertemp_c  integer NULL CHECK (strykertemp_c BETWEEN 80 AND 200),
    notat          text NOT NULL DEFAULT '',
    UNIQUE (renn_id, ski_id, rolle, rekkefolge) DEFERRABLE INITIALLY IMMEDIATE,
    FOREIGN KEY (user_id, renn_id, ski_id) REFERENCES renn_ski (user_id, renn_id, ski_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id, produkt_id) REFERENCES produkt (user_id, id) ON DELETE RESTRICT
);
CREATE INDEX smore_lag_produkt_idx ON smore_lag (produkt_id);

-- Grip (feste) only applies to classic.
-- +goose StatementBegin
CREATE FUNCTION smore_lag_feste_kun_klassisk() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.rolle = 'feste' AND (SELECT disiplin FROM renn WHERE id = NEW.renn_id) <> 'klassisk' THEN
        RAISE EXCEPTION 'feste gjelder kun klassisk' USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
END;
$$;
-- +goose StatementEnd
CREATE TRIGGER smore_lag_feste_kun_klassisk BEFORE INSERT OR UPDATE ON smore_lag
    FOR EACH ROW EXECUTE FUNCTION smore_lag_feste_kun_klassisk();

CREATE TABLE vurdering (
    user_id         uuid NOT NULL,
    renn_id         uuid NOT NULL,
    ski_id          uuid NOT NULL,
    glid_mot_felt   text NULL CHECK (glid_mot_felt IN ('langsommere','lik','raskere')),
    rangering       integer NULL CHECK (rangering >= 1),
    feste           text NULL CHECK (feste IN ('slurer','ok','veldig_bra')), -- classic only
    stjerner_glid   integer NULL CHECK (stjerner_glid BETWEEN 1 AND 5),
    stjerner_feste  integer NULL CHECK (stjerner_feste BETWEEN 1 AND 5),
    sikkerhet       text NULL CHECK (sikkerhet IN ('folelse','testrunde','resultat')),
    notat           text NOT NULL DEFAULT '',
    PRIMARY KEY (renn_id, ski_id),
    FOREIGN KEY (user_id, renn_id, ski_id) REFERENCES renn_ski (user_id, renn_id, ski_id) ON DELETE CASCADE
);

-- +goose Down
DROP TABLE vurdering;
DROP TABLE smore_lag;
DROP FUNCTION smore_lag_feste_kun_klassisk;
DROP TABLE renn_ski;
DROP FUNCTION renn_ski_ikke_solgt;
DROP TABLE renn;
DROP TABLE ekstern_tips;
DROP TABLE ekstern_kilde;
DROP TABLE produkt_beskrivelse;
DROP TABLE produkt_kilde;
DROP TABLE produkt_sno_rad;
DROP TABLE produkt;
DROP TABLE ski;
DROP FUNCTION sett_endret;
DROP DOMAIN disiplin;
DROP DOMAIN snotyper;
