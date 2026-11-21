# Autentisering

Appen er offentlig på internett og inneholder private data og en API-nøkkel som koster penger. Alt unntatt innloggingsskjermene krever innlogging. Det finnes **ingen åpen registrering**.

## Prinsipper
- Bruk velprøvde biblioteker for passordhashing, tokens og sessions. Ikke skriv egen kryptografi.
- Én bruker (eieren) i første versjon. Datamodellen skal likevel ha `users` med id, slik at flere kan legges til senere via invitasjon.
- Tokens og passord logges aldri. Heller ikke i feilmeldinger eller URL-er som havner i logg.

## Konto og første oppstart
- Ingen `/register`-rute.
- Ved oppstart, hvis `users` er tom og `ADMIN_EMAIL` er satt: opprett brukeren uten passord og send en **«Velg passord»-lenke** til den adressen. Samme flyt og samme skjerm som passordreset, men lenken gjelder 24 timer.
- Reserve hvis e-post ikke fungerer ennå: kommandoen `./smoreappen auth reset-link --email <adresse>` skriver en engangslenke til stdout. Kjøres via Render Shell, hvis det er tilgjengelig på planen. Sjekk i Dashboard.
- Samme kommando brukes hvis eieren mister tilgang til e-posten.

## Passord
- Hash med argon2id (anbefalte parametre fra OWASP) eller bcrypt. Aldri klartekst, aldri reversibel kryptering.
- Minst 12 tegn, maks 128. Ingen krav om store bokstaver eller symboler. Tillat lim inn i feltet og passordbehandlere.
- Valgfritt: avvis passord som finnes i kjente lekkasjer via k-anonymitets-oppslag (Have I Been Pwned). Appen må fungere hvis oppslaget feiler.
- Passordfelt har «Vis passord»-knapp, riktige `autocomplete`-attributter (`username`, `current-password`, `new-password`) og `type=password`.

## Innlogging
- `POST /api/auth/login { epost, passord }`.
- Feilmelding er alltid den samme: «Feil e-post eller passord.» Aldri vis om e-posten finnes.
- Samme svartid enten brukeren finnes eller ikke (utfør hash-sammenligning mot en dummy-hash hvis ukjent bruker).
- Begrens forsøk: per IP og per konto, med økende ventetid. Etter 3 mislykkede forsøk på kort tid: «For mange forsøk. Prøv igjen om 15 minutter, eller bruk «Glemt passord»».
- Logg hendelsen (tidspunkt, IP, resultat), ikke passordet.

## Sessions
- Server-side sessions i databasen. Tilfeldig 256-bit token. Lagre kun SHA-256-hash av tokenet.
- Cookie: navn med prefikset `__Host-`, `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`.
- Utløp: 30 dager rullerende, absolutt maks 90 dager. Appen brukes på mobil, så ikke tving hyppig ny innlogging.
- Logg ut avslutter denne sessionen. «Logg ut overalt» avslutter alle.
- Endring av passord eller e-post avslutter alle sessions unntatt en ny for denne enheten.
- Mutasjoner (POST/PUT/PATCH/DELETE) krever CSRF-token i header, i tillegg til SameSite.

## Glemt passord
1. Skjerm «Glemt passord»: bruker skriver e-postadresse. `POST /api/auth/forgot { epost }`.
2. Svaret er **alltid** likt, om adressen finnes eller ikke: «Hvis adressen finnes hos oss, har vi sendt en lenke.» Samme svartid. Send e-posten asynkront.
3. Hvis adressen finnes: lag token med 32 tilfeldige bytes (base64url). Lagre kun SHA-256-hash, utløp **30 minutter**, **engangsbruk**. Nytt token gjør tidligere ubrukte tokens ugyldige.
4. Lenke i e-posten: `{APP_BASE_URL}/nytt-passord#token=<token>`. Tokenet ligger i URL-fragmentet, slik at det ikke havner i serverlogger eller `Referer`. Frontend leser fragmentet og sender det i body til `POST /api/auth/reset { token, nytt_passord }`.
5. Siden `/nytt-passord` sendes med `Referrer-Policy: no-referrer` og `Cache-Control: no-store`.
6. Etter vellykket reset: marker tokenet brukt, lagre nytt passord, avslutt alle sessions, send e-post «Passordet ditt er endret» og send brukeren til innlogging. Ikke logg inn automatisk.
7. Utløpt, brukt eller ukjent token gir samme skjerm: «Lenken har utløpt» med «Be om ny lenke».
8. Begrens: maks 3 forespørsler per time per e-post og per IP. «Send på nytt» på «Sjekk e-posten» har 30 sekunders nedtelling.

## E-post
- **Send via en tjeneste med HTTPS-API, ikke SMTP.** Render blokkerer utgående port 25 for alle tjenester, og gratis web-tjenester kan heller ikke bruke 465 og 587.
- Velg leverandør av transaksjonell e-post. Sjekk gratisnivå og vilkår selv.
- Avsender fra eget domene med SPF, DKIM og DMARC satt opp. Uten det havner e-posten ofte i søppelpost. `EMAIL_FROM` må være en verifisert avsender hos leverandøren.
- Grensesnitt `Mailer` med to implementasjoner: `ApiMailer` (produksjon) og `ConsoleMailer` (lokalt, skriver lenken til konsollen). Bruk Mailpit i `docker-compose` hvis ønskelig.
- Ikke send e-post hvis `APP_BASE_URL` ikke er satt.

### Mal: tilbakestilling
Emne: `Nytt passord til Smøreappen`
```
Hei,

Du har bedt om å velge nytt passord til Smøreappen.

Åpne lenken under. Den gjelder i 30 minutter og kan bare brukes én gang.

{lenke}

Hvis du ikke ba om dette, kan du ignorere e-posten. Passordet ditt er uendret.
```

### Mal: bekreftelse
Emne: `Passordet ditt er endret`
```
Passordet til Smøreappen ble endret {tidspunkt}.

Hvis det ikke var deg, bruk «Glemt passord» på innloggingssiden med en gang.
```

## Innstillinger (innlogget)
- **Bytt passord:** krever nåværende passord. Avslutter andre sessions.
- **Bytt e-post:** krever nåværende passord. Send bekreftelseslenke til den nye adressen, og en varsling til den gamle. Bytt først når den nye er bekreftet.
- **Logg ut** og **Logg ut overalt**.
- Aktive sessions listes med enhet og sist brukt, med mulighet til å avslutte hver.

## Skjermer (se prototype `docs/design/07-*.png`)
Logg inn · Glemt passord · Sjekk e-posten · Velg nytt passord · Lenken har utløpt · Passordet er endret. Mobil først, samme designspråk som resten av appen. Feil vises i tekst med ikon, ikke bare farge.

## Sikkerhetshoder
`Strict-Transport-Security`, `Content-Security-Policy` (ingen inline-skript), `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `frame-ancestors 'none'`.

## Datamodell
| Tabell | Felt |
|---|---|
| `users` | id, epost (unik, lowercase), passord_hash (nullable til passord er satt), opprettet |
| `sessions` | id, user_id, token_hash, opprettet, sist_brukt, utloper, enhet |
| `password_tokens` | id, user_id, token_hash, formal (`reset`/`oppsett`/`epost`), utloper, brukt_tidspunkt, opprettet |
| `auth_hendelser` | id, tidspunkt, type, user_id (nullable), ip, resultat |

## Miljøvariabler (tillegg til DRIFT.md)
`ADMIN_EMAIL`, `APP_BASE_URL`, `EMAIL_API_KEY`, `EMAIL_FROM`. **Fjern `APP_PASSWORD_HASH`**: passordet lagres i databasen, ikke i miljøvariabler.

## Tester som må finnes
- Alle API-ruter unntatt `/healthz` og `/api/auth/*` gir 401 uten session.
- Samme svar og omtrent samme svartid på `forgot` for kjent og ukjent e-post.
- Token kan brukes én gang. Utløpt token avvises. Nytt token ugyldiggjør det forrige.
- Etter reset er alle gamle sessions ugyldige.
- Passord under 12 tegn avvises. Passordene må være like.
- Innlogging sperres midlertidig etter gjentatte feil.
- Token og passord forekommer aldri i logg.
- Cookie har `HttpOnly`, `Secure`, `SameSite`.

## Senere
TOTP eller passkeys som ekstra sikring. Invitasjon av flere brukere.