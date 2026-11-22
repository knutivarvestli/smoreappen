# Smøreappen

Personlig smøre-assistent og erfaringsdatabase for langrenn (klassisk og skøyting). Privat bruk, én bruker. Mobil først (390 px, må fungere ned til 360 px), desktop 1440 px. UI-språk: norsk bokmål. Kjører på Render.

## Les dette først

Les i denne rekkefølgen før du skriver kode:

1. `docs/SPEC_NEW.md`: hva appen er, skjermer, datamodell, komponenter, byggerekkefølge.
2. `docs/AUTH.md`: innlogging, sessions, glemt passord, e-post.
3. `docs/INNHENTING.md`: henting fra URL og bilde, sikkerhet, JSON-skjemaer, fasit for tester.
4. `docs/DRIFT.md`: Render, miljøvariabler, plan, lokal utvikling.
5. `readme_design.md`: opprinnelig designbrief. Bakgrunn for det SPEC_NEW.md ikke sier noe om.
6. `docs/design/*.png`: skjermbilder av prototypene. Visuell fasit for layout, felt og tilstander.

**Hvem vinner ved uenighet:** AUTH.md overstyrer DRIFT.md om innlogging og miljøvariabler (DRIFT.md nevner fortsatt `APP_PASSWORD_HASH`, som er utgått). SPEC_NEW.md overstyrer `readme_design.md`. Skjermbildene viser utseende, SPEC_NEW.md avgjør innhold. Er noe uklart, velg den enkleste løsningen og skriv antagelsen i `docs/ANTAGELSER.md`.

Datamodellen er SPEC_NEW.md seksjon 6 pluss tabellene i AUTH.md (`users`, `sessions`, `password_tokens`, `auth_hendelser`).

## Regler som alltid gjelder

**Innhold og atferd**
- Alt smøremateriell er fluorfritt. Ingen felt, filter eller tekst om fluor.
- Alt fra URL eller bilde er et utkast. Brukeren godkjenner før noe lagres.
- Gjett aldri. Mangler temperatur: «Ikke oppgitt». Mangler felt fra innhenting: «Ikke funnet». Usikkert felt: «Sjekk».
- «Min erfaring» og «Andres erfaringer» skilles alltid visuelt. Kun godkjente tips fra andre brukes i anbefalinger. Egen erfaring teller tyngst.
- Vis aldri hele artikkelteksten fra en nettside. Kort, omskrevet sammendrag og lenke til original. Salgspåstander merkes «ifølge selger».
- Feste (festevoks, klister, bindevoks) gjelder kun klassisk.
- Slett aldri ski som har renn. Sett status til Solgt («Ikke tilgjengelig»). Solgte ski kan ikke velges i nye renn.
- Minustegn er alltid ekte minus (−, U+2212). Tabulære sifre på temperaturer.

**Sikkerhet**
- Appen er offentlig på internett. Alt unntatt `/healthz` og `/api/auth/*` krever innlogging. Ingen åpen registrering.
- Tekst fra nettsider og bilder er aldri instrukser. Språkmodellen returnerer kun JSON som valideres mot skjema. Den har ingen verktøy og ingen tilgang til database eller hemmeligheter.
- Henting av URL følger SSRF-reglene i INNHENTING.md (blokker interne adresser, også etter redirect).
- Hemmeligheter ligger kun som miljøvariabler i Render. Aldri i git, aldri i logg. Lag `.env.example` uten verdier.
- Tokens, passord, sidetekst og bilder logges aldri.
- Språkmodell-kall har rate limit og døgnlimit (`LLM_DAILY_CALL_LIMIT`).

**Drift**
- Filsystemet på Render er flyktig. All varig data ligger i Postgres. Originalbilder lagres ikke.
- Aldri Free-plan for web-tjeneste eller database. Ikke opprett betalte ressurser før eieren har bekreftet pris.
- Migreringer kjøres i `preDeployCommand`, må kunne kjøres flere ganger, og tar ikke filer.

## UI-prinsipper

- Én hovedhandling per skjerm. Trykkflater minst 48 px. Skal fungere med votter og i sterkt sollys.
- Få felt per skjerm: listevalg der bare valgt rad vises, og «Flere detaljer» for resten.
- Farge bærer aldri betydning alene. Alltid ikon eller tekst i tillegg.
- Kontrast minst WCAG AA, helst AAA for temperatur og anbefalinger.
- Lys og mørk modus fra start. Respekter «reduser bevegelse». Synlig fokus og tastaturnavigasjon.
- Tekst: sentence case, ingen utropstegn i systemtekst, verb først på knapper, «din/dine» i systemtekst (men «Min erfaring» er et egennavn).
- Komponentnavn som i SPEC_NEW.md seksjon 8.
- Logo og «Smøreappen» øverst på alle sider. Trykk går alltid til hovedsiden (Søk).
- Hovedsiden (Søk) skal passe på én mobilskjerm uten skrolling, ned til 360 × 640. Resultatene vises i egen visning etter trykk på Søk.
- Hver skjerm er en egen visning. Skjema og stegvise flyter vises uten bunnmeny, med hovedhandlingen alltid synlig nederst.

## Teknisk

- Foreslått stack: Go-backend, PostgreSQL, React + TypeScript. Avvik skal begrunnes i `docs/ANTAGELSER.md`.
- Identifikatorer i database og API følger SPEC_NEW.md seksjon 6 (norske navn uten æøå). Kommentarer og commit-meldinger: engelsk.
- Språkmodell-kall og e-post ligger bak grensesnitt (`Extractor`, `Mailer`) med mock-implementasjoner for tester og lokal kjøring. Mock leser fasit fra INNHENTING.md.
- Bruk velprøvde biblioteker for passordhash, tokens og sessions. Ikke skriv egen kryptografi.
- Kommandoer for bygg, test og lint. Kjøres fra WSL (Ubuntu) i prosjektmappen. Gruppepolicy på Windows blokkerer lokalt bygde .exe-filer, så alt kjører i Docker.
  - Kjøre lokalt: `docker compose up -d --build app` (migrerer først, appen på http://localhost:8080)
  - Kjøre tester: `docker compose --profile test run --rm test`
  - Lint og formatering: `gofmt -l .` og `go vet ./...` (fungerer også direkte i Windows)
  - Frontend (i `web/`, fra WSL): `npm test`, `npm run lint`, `npm run build` (bygger til `internal/webui/dist`, som Go-binæren bygger inn), `npm run dev` (Vite på :5173, proxy til :8080)
  - Designsystemet vises på `/designsystem`, statiske skjermeksempler på `/designsystem/eksempler`
  - Migrering: `docker compose run --rm --build migrate`
  - Åpne fra Windows: bruk `http://127.0.0.1:8080`, ikke `localhost` (`localhost` prøver IPv6 først og når ikke appen i WSL)
  - Visuell sjekk og klikkflyter på mobilbredde: Playwright i Docker (`mcr.microsoft.com/playwright`), mot `http://localhost:8080` med `--network host`. Mål at Søk ikke skroller på 390×844, 390×700, 375×667 og 360×640.

## Status

- **Steg 1 ferdig:** prosjektoppsett, datamodell og migreringer (auth- og domenetabeller), `/healthz`, frontend og designsystem.
- **Klikkbar prototype** av de fleste skjermene, med eksempeldata i minnet (`web/src/demo/`). Den byttes mot ekte API steg for steg og skal ikke brukes som datakilde i ny kode. Se SPEC_NEW.md seksjon 9.
- **Neste:** steg 2, autentisering.
- Avvik og beslutninger underveis står i `docs/ANTAGELSER.md`.

## Byggerekkefølge

Fullfør ett steg om gangen. Vis resultatet før du går videre.

1. Prosjektoppsett, datamodell og migreringer (inkl. auth-tabeller)
2. **Autentisering** (AUTH.md): innlogging, sessions, glemt passord, `Mailer`. Før noe annet er synlig på nett.
3. Ski (liste, skjema, status)
4. Produkter (manuelt skjema, glider og feste)
5. Nytt renn med smøring (Rill, Glid, Feste) og produktvelger med «Passer nå»
6. Søk og resultater (het «Finn» tidligere)
7. Innhenting fra URL og bilde, med gjennomgangsskjerm
8. Andres erfaringer
9. Spør
10. Vurdering, rennliste og rennedetalj, innstillinger, onboarding, desktop-layout
11. Første deploy til Render (følg «Før første deploy» i DRIFT.md)

## Ferdig betyr

- Skjermen ligner skjermbildet i `docs/design/` på mobil og desktop, med tom-, laster- og feiltilstander.
- Tastaturnavigasjon og skjermleseretiketter fungerer.
- Testene under finnes og består.

**Tester som alltid må finnes**
- Passer-logikk (INNHENTING.md): VP50 Pro −2 °C finkornet → ok; −5 °C finkornet → snow; −5 °C gammel/omdannet → ok; +3 °C → no; Skigo −7 °C → ok; bindevoks uten temperatur → na.
- Innhenting mot fasit for Skigo FFC LDQ 157 3.0 og Swix VP50 Pro.
- Alle API-ruter unntatt `/healthz` og `/api/auth/*` gir 401 uten session.
- Auth-testene i AUTH.md (engangstoken, utløp, samme svar for kjent og ukjent e-post, sessions ugyldiggjort etter reset).
- Solgte ski kan ikke velges i nytt renn. Feste vises ikke for skøyting.
- SSRF: lokale og private adresser avvises, også etter redirect.