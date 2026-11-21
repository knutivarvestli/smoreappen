# Drift på Render

Gjelder foran ingenting annet: ved uenighet om innlogging, sessions og e-post gjelder `docs/AUTH.md`. Dette dokumentet beskriver hvor og hvordan appen kjører.

## Plan og kostnad
- Workspace: Hobby (finnes fra før). Appen får egne tjenester, ikke delt med den andre appen.
- Web-tjeneste: **betalt, alltid-på** (Starter). Aldri Free: den sover etter 15 minutters inaktivitet og bruker ca. ett minutt på å våkne.
- Database: **betalt Render Postgres** (Basic-256mb, sjekk gjeldende planer i Dashboard). **Aldri Free Postgres**: utløper etter 30 dager og har ingen backup.
- Egen database for denne appen. Ikke del database eller skjema med den andre appen.
- Persistent disk kun hvis bilder lagres (egen kostnad per GB). Anbefalt: ikke lagre bilder.
- E-posttjeneste for transaksjonell e-post kommer i tillegg (se «E-post»). Sjekk gratisnivå og vilkår hos valgt leverandør.
- Beregn kostnaden ved å summere web-tjeneste, database, eventuell disk og e-posttjeneste, pluss båndbredde utover det som er inkludert i Hobby. Gjør oppslag i Render pricing for gjeldende tall.
- **Ikke opprett betalte ressurser før eieren har bekreftet pris.**

## Filsystemet er flyktig
- Alt som skrives utenfor en eventuell disk-mountpath forsvinner ved deploy og omstart.
- **Ikke lagre originalbilder.** Les bildet i minnet, send til modellen, behold kun resultatet.
- Skal bilder lagres: persistent disk på `/var/data/uploads` (Go-tjenesten leser sti fra `UPLOAD_DIR`). Husk at disk gir én instans og ingen zero-downtime deploy.
- Disken er ikke tilgjengelig under build eller pre-deploy. Kjør migreringer mot databasen, ikke mot filer.

## render.yaml (Blueprint, utkast)
```yaml
services:
  - type: web
    name: smoreappen
    runtime: docker
    plan: starter          # sjekk gjeldende planer i Render Dashboard
    region: frankfurt
    healthCheckPath: /healthz
    preDeployCommand: ./smoreappen migrate
    envVars:
      - key: DATABASE_URL
        fromDatabase: { name: smoreappen-db, property: connectionString }
      - key: SESSION_SECRET
        generateValue: true  # brukes til signering av CSRF-token. Sessions lagres i databasen (se AUTH.md)
      - key: ADMIN_EMAIL
        sync: false          # eierens e-postadresse. Settes manuelt i Dashboard
      - key: APP_BASE_URL
        sync: false          # f.eks. https://smoreappen.onrender.com eller eget domene
      - key: EMAIL_API_KEY
        sync: false
      - key: EMAIL_FROM
        sync: false          # verifisert avsender hos e-posttjenesten
      - key: ANTHROPIC_API_KEY
        sync: false
      - key: LLM_MODEL
        sync: false          # modellnavn, ikke hardkodet
      - key: LLM_DAILY_CALL_LIMIT
        value: "100"
      - key: UPLOAD_DIR
        value: /var/data/uploads
    # disk: kun hvis bilder skal lagres
    # disk: { name: uploads, mountPath: /var/data, sizeGB: 1 }

databases:
  - name: smoreappen-db
    region: frankfurt
    # velg plan i Dashboard. Sjekk hva planen inkluderer av backup.
```

## Miljøvariabler
Alle hemmeligheter ligger som miljøvariabler i Render og aldri i git. Lag `.env.example` uten verdier.

| Variabel | Bruk |
|---|---|
| `DATABASE_URL` | Postgres-tilkobling (fra Render) |
| `SESSION_SECRET` | Signering av CSRF-token |
| `ADMIN_EMAIL` | Eierens e-post. Brukes til å opprette første konto (AUTH.md) |
| `APP_BASE_URL` | Offentlig adresse til appen. Brukes i lenker i e-post. Ikke send e-post hvis den mangler |
| `EMAIL_API_KEY` | Nøkkel til e-posttjenestens HTTPS-API |
| `EMAIL_FROM` | Verifisert avsenderadresse |
| `ANTHROPIC_API_KEY` | Språkmodell for innhenting |
| `LLM_MODEL` | Modellnavn |
| `LLM_DAILY_CALL_LIMIT` | Døgnlimit på språkmodell-kall |
| `UPLOAD_DIR` | Kun hvis bilder lagres |
| `PORT` | Settes av Render. Appen må lese den |

`APP_PASSWORD_HASH` finnes ikke lenger. Passordet lagres som hash i databasen.

## Tilgang (appen er offentlig på internett)
Appen inneholder private data og kaller et betalt API, så den **må** ha innlogging fra første deploy. Alt er beskrevet i `docs/AUTH.md`. Kort:
- Ingen åpen registrering. Eierens konto opprettes ved første oppstart fra `ADMIN_EMAIL`, og passord velges via lenke i e-post.
- Alle API-ruter krever innlogging unntatt `/healthz` og `/api/auth/*`.
- Rate limit på innlogging og på «Glemt passord».
- Rate limit og døgnlimit (`LLM_DAILY_CALL_LIMIT`) på ruter som kaller språkmodellen. Gi tydelig feil når grensen er nådd.
- HTTPS håndteres av Render.

## E-post
- Send via en tjeneste med HTTPS-API. **Ikke SMTP:** Render blokkerer utgående port 25 for alle tjenester, og gratis web-tjenester kan heller ikke bruke 465 og 587.
- Avsender fra eget domene med SPF, DKIM og DMARC satt opp. Uten det havner tilbakestillingsmailen ofte i søppelpost.
- `Mailer`-grensesnitt med `ApiMailer` (produksjon) og `ConsoleMailer` (lokalt). Detaljer i AUTH.md.

## Helse og drift
- `GET /healthz` returnerer 200 når appen kjører og databasen svarer. Krever ikke innlogging og viser ingen detaljer.
- Strukturert logg til stdout. Aldri logg hemmeligheter, tokens, passord, sidetekst eller bilder.
- Migreringer kjøres av `preDeployCommand` og må kunne kjøres flere ganger uten skade.
- Eksport av alle data (JSON eller CSV) finnes i Innstillinger, som egen sikkerhetskopi uavhengig av Render.
- Kommandoer som kjøres i Render Shell (hvis tilgjengelig på planen): `./smoreappen migrate`, `./smoreappen auth reset-link --email <adresse>`.

## Lokal utvikling
- `docker-compose.yml` med Postgres og appen. Samme miljøvariabler som i produksjon.
- Språkmodell-kall bak ett grensesnitt (`Extractor`), med en `mock`-implementasjon som leser fasit fra `docs/INNHENTING.md`.
- E-post bak `Mailer`. Lokalt brukes `ConsoleMailer` (skriver lenken til konsollen) eller Mailpit i `docker-compose`.
- Lokalt kan `APP_BASE_URL` være `http://localhost:8080`. `Secure`-cookie må tillates over localhost i utvikling.

## PWA
Legg til web app manifest og service worker, slik at appen kan legges på hjemskjermen. Offline-lagring av renn er fase 2.

## Før første deploy
1. Sjekk i Dashboard hva web-tjenesten og databasen koster med valgt plan. Bekreft med eieren før opprettelse.
2. Velg e-posttjeneste. Verifiser avsenderdomenet (SPF, DKIM) og sett opp `EMAIL_FROM`. Test at en e-post kommer frem og ikke havner i søppelpost.
3. Opprett database og web-tjeneste via Blueprint (`render.yaml`).
4. Sett `ADMIN_EMAIL`, `APP_BASE_URL`, `EMAIL_API_KEY`, `EMAIL_FROM`, `ANTHROPIC_API_KEY` og `LLM_MODEL` i Dashboard.
5. Sjekk at `/healthz` svarer.
6. Åpne appen. Bekreft at du får «Velg passord»-lenke på e-post, kan velge passord og logge inn.
7. Test «Glemt passord» fra innloggingsskjermen, inkludert at lenken bare virker én gang.
8. Bekreft at et API-kall uten innlogging gir 401.
9. Bekreft at data overlever en ny deploy og en omstart.
10. Sjekk hva databaseplanen dekker av backup og oppbevaring. Test gjenoppretting minst én gang.