package migrate

import (
	"context"
	"testing"

	"github.com/jackc/pgx/v5/pgxpool"

	"smoreappen/internal/testdb"
)

func TestUpIsRepeatable(t *testing.T) {
	ctx := context.Background()
	dbURL := testdb.New(t)

	if _, err := Up(ctx, dbURL); err != nil {
		t.Fatalf("first run: %v", err)
	}
	n, err := Up(ctx, dbURL)
	if err != nil {
		t.Fatalf("second run: %v", err)
	}
	if n != 0 {
		t.Fatalf("second run applied %d migrations, want 0", n)
	}

	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		t.Fatal(err)
	}
	defer pool.Close()
	for _, table := range []string{
		"users", "sessions", "password_tokens", "auth_hendelser",
		"ski", "produkt", "produkt_sno_rad", "produkt_kilde", "produkt_beskrivelse",
		"ekstern_kilde", "ekstern_tips", "renn", "renn_ski", "smore_lag", "vurdering",
	} {
		var exists bool
		if err := pool.QueryRow(ctx, "SELECT to_regclass($1) IS NOT NULL", table).Scan(&exists); err != nil {
			t.Fatal(err)
		}
		if !exists {
			t.Errorf("table %s missing", table)
		}
	}
}

func TestEmailMustBeLowercase(t *testing.T) {
	ctx := context.Background()
	dbURL := testdb.New(t)
	if _, err := Up(ctx, dbURL); err != nil {
		t.Fatal(err)
	}
	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		t.Fatal(err)
	}
	defer pool.Close()
	if _, err := pool.Exec(ctx, "INSERT INTO users (epost) VALUES ('Eier@Example.com')"); err == nil {
		t.Fatal("mixed-case email was accepted")
	}
	if _, err := pool.Exec(ctx, "INSERT INTO users (epost) VALUES ('eier@example.com')"); err != nil {
		t.Fatalf("lowercase email rejected: %v", err)
	}
}
