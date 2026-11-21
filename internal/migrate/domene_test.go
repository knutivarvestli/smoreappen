package migrate

import (
	"context"
	"testing"

	"github.com/jackc/pgx/v5/pgxpool"

	"smoreappen/internal/testdb"
)

func migratedPool(t *testing.T) *pgxpool.Pool {
	t.Helper()
	ctx := context.Background()
	dbURL := testdb.New(t)
	if _, err := Up(ctx, dbURL); err != nil {
		t.Fatal(err)
	}
	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(pool.Close)
	return pool
}

func scalar(t *testing.T, pool *pgxpool.Pool, sql string, args ...any) string {
	t.Helper()
	var id string
	if err := pool.QueryRow(context.Background(), sql, args...).Scan(&id); err != nil {
		t.Fatalf("%s: %v", sql, err)
	}
	return id
}

func mustExec(t *testing.T, pool *pgxpool.Pool, sql string, args ...any) {
	t.Helper()
	if _, err := pool.Exec(context.Background(), sql, args...); err != nil {
		t.Fatalf("%s: %v", sql, err)
	}
}

func mustFail(t *testing.T, pool *pgxpool.Pool, why, sql string, args ...any) {
	t.Helper()
	if _, err := pool.Exec(context.Background(), sql, args...); err == nil {
		t.Fatalf("expected failure (%s): %s", why, sql)
	}
}

type fixture struct {
	user, klassiskSki, skoyteSki, klassiskRenn, skoyteRenn string
}

func setup(t *testing.T, pool *pgxpool.Pool, epost string) fixture {
	var f fixture
	f.user = scalar(t, pool, "INSERT INTO users (epost) VALUES ($1) RETURNING id", epost)
	f.klassiskSki = scalar(t, pool, "INSERT INTO ski (user_id, navn, disiplin) VALUES ($1, 'Klassiske #1', 'klassisk') RETURNING id", f.user)
	f.skoyteSki = scalar(t, pool, "INSERT INTO ski (user_id, navn, disiplin) VALUES ($1, 'Skøyteski #1', 'skoyting') RETURNING id", f.user)
	f.klassiskRenn = scalar(t, pool, "INSERT INTO renn (user_id, disiplin, lufttemp) VALUES ($1, 'klassisk', -7) RETURNING id", f.user)
	f.skoyteRenn = scalar(t, pool, "INSERT INTO renn (user_id, disiplin, lufttemp) VALUES ($1, 'skoyting', -7) RETURNING id", f.user)
	return f
}

func TestSoldSkiCannotBeChosen(t *testing.T) {
	pool := migratedPool(t)
	f := setup(t, pool, "a@example.com")

	// Ski used in a race, then sold: history stays.
	mustExec(t, pool, "INSERT INTO renn_ski (user_id, renn_id, ski_id, valgt) VALUES ($1, $2, $3, true)", f.user, f.skoyteRenn, f.skoyteSki)
	mustExec(t, pool, "UPDATE ski SET status = 'solgt' WHERE id = $1", f.skoyteSki)

	nyttRenn := scalar(t, pool, "INSERT INTO renn (user_id, disiplin) VALUES ($1, 'skoyting') RETURNING id", f.user)
	mustFail(t, pool, "sold ski in new race",
		"INSERT INTO renn_ski (user_id, renn_id, ski_id) VALUES ($1, $2, $3)", f.user, nyttRenn, f.skoyteSki)

	if n := scalar(t, pool, "SELECT count(*)::text FROM renn_ski WHERE ski_id = $1", f.skoyteSki); n != "1" {
		t.Fatalf("history rows = %s, want 1", n)
	}
}

func TestSkiWithRacesCannotBeDeleted(t *testing.T) {
	pool := migratedPool(t)
	f := setup(t, pool, "a@example.com")
	mustExec(t, pool, "INSERT INTO renn_ski (user_id, renn_id, ski_id) VALUES ($1, $2, $3)", f.user, f.klassiskRenn, f.klassiskSki)

	mustFail(t, pool, "delete ski with races", "DELETE FROM ski WHERE id = $1", f.klassiskSki)
	mustExec(t, pool, "DELETE FROM ski WHERE id = $1", f.skoyteSki) // no races: allowed
}

func TestGripOnlyForClassic(t *testing.T) {
	pool := migratedPool(t)
	f := setup(t, pool, "a@example.com")
	mustExec(t, pool, "INSERT INTO renn_ski (user_id, renn_id, ski_id) VALUES ($1, $2, $3)", f.user, f.klassiskRenn, f.klassiskSki)
	mustExec(t, pool, "INSERT INTO renn_ski (user_id, renn_id, ski_id) VALUES ($1, $2, $3)", f.user, f.skoyteRenn, f.skoyteSki)

	mustExec(t, pool, "INSERT INTO smore_lag (user_id, renn_id, ski_id, rolle, rekkefolge, metode) VALUES ($1, $2, $3, 'feste', 1, 'kork_inn')",
		f.user, f.klassiskRenn, f.klassiskSki)
	mustExec(t, pool, "INSERT INTO smore_lag (user_id, renn_id, ski_id, rolle, rekkefolge, metode) VALUES ($1, $2, $3, 'glid', 1, 'stryk_pa')",
		f.user, f.skoyteRenn, f.skoyteSki)
	mustFail(t, pool, "grip on skate race",
		"INSERT INTO smore_lag (user_id, renn_id, ski_id, rolle, rekkefolge) VALUES ($1, $2, $3, 'feste', 1)",
		f.user, f.skoyteRenn, f.skoyteSki)
}

func TestNoLinkingAcrossUsers(t *testing.T) {
	pool := migratedPool(t)
	a := setup(t, pool, "a@example.com")
	b := setup(t, pool, "b@example.com")

	mustFail(t, pool, "user A race with user B ski",
		"INSERT INTO renn_ski (user_id, renn_id, ski_id) VALUES ($1, $2, $3)", a.user, a.skoyteRenn, b.skoyteSki)

	produktB := scalar(t, pool, "INSERT INTO produkt (user_id, merke, modell, kategori) VALUES ($1, 'Skigo', 'FFC LDQ 157 3.0', 'glider_fast') RETURNING id", b.user)
	mustExec(t, pool, "INSERT INTO renn_ski (user_id, renn_id, ski_id) VALUES ($1, $2, $3)", a.user, a.skoyteRenn, a.skoyteSki)
	mustFail(t, pool, "user A layer with user B product",
		"INSERT INTO smore_lag (user_id, renn_id, ski_id, rolle, rekkefolge, produkt_id) VALUES ($1, $2, $3, 'glid', 1, $4)",
		a.user, a.skoyteRenn, a.skoyteSki, produktB)
}

func TestValueChecks(t *testing.T) {
	pool := migratedPool(t)
	f := setup(t, pool, "a@example.com")

	mustFail(t, pool, "weight from > to",
		"INSERT INTO ski (user_id, navn, disiplin, vekt_fra_kg, vekt_til_kg) VALUES ($1, 'x', 'klassisk', 80, 70)", f.user)
	mustFail(t, pool, "unknown snow type",
		"INSERT INTO renn (user_id, disiplin, snotyper) VALUES ($1, 'klassisk', '{puddersno}')", f.user)
	mustFail(t, pool, "unknown discipline",
		"INSERT INTO renn (user_id, disiplin) VALUES ($1, 'alpint')", f.user)
	mustFail(t, pool, "product temp from > to",
		"INSERT INTO produkt (user_id, merke, modell, kategori, temp_fra, temp_til) VALUES ($1, 'Swix', 'VP50 Pro', 'festevoks', 0, -3)", f.user)

	// Product without temperature is allowed: never guess.
	produkt := scalar(t, pool, "INSERT INTO produkt (user_id, merke, modell, kategori) VALUES ($1, 'Swix', 'Bindevoks', 'bindevoks') RETURNING id", f.user)
	mustExec(t, pool, "INSERT INTO produkt_sno_rad (produkt_id, sno_tekst, sno_tags, temp_fra, temp_til) VALUES ($1, 'Gammel eller delvis omdannet', '{gammel_omdannet}', -6, -1)", produkt)

	kilde := scalar(t, pool, "INSERT INTO ekstern_kilde (user_id, domene, url) VALUES ($1, 'eksempel.no', 'https://eksempel.no/a') RETURNING id", f.user)
	_ = kilde
	mustFail(t, pool, "same domain twice",
		"INSERT INTO ekstern_kilde (user_id, domene, url) VALUES ($1, 'eksempel.no', 'https://eksempel.no/b')", f.user)
}
