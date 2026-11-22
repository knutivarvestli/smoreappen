# Antagelser og avvik

Beslutninger tatt der dokumentasjonen var uklar eller manglet. Nyeste nederst.

## Steg 1: prosjektoppsett

- **`readme.md` regnes som utgått.** Den er en eldre masterprompt og er uenig med `claude.md` på flere punkter (engelske identifikatorer, `/auth/register`, `DECISIONS.md`, `ANTHROPIC_MODEL`). `claude.md` og `docs/` gjelder.
- **`docs/SPEC.md` er avkuttet** midt i seksjon 5.4. Seksjon 6 (datamodell) og 8 (komponentnavn) mangler. Steg 1 inneholder derfor bare auth-tabellene fra AUTH.md. Domenetabellene venter på komplett SPEC.md.
- **`password_tokens.ny_epost`** er lagt til (ikke nevnt i AUTH.md). Trengs for «Bytt e-post», der ny adresse først tas i bruk etter bekreftelse. Påkrevd når `formal = 'epost'`, ellers tom.
- **`users.epost`** har CHECK på at verdien er lowercase. Appen normaliserer før lagring.
- **`auth_hendelser.ip`** er `text`, ikke `inet`, for å tåle tomme eller rare verdier fra proxy-hoder.
- **Migreringer:** `goose` med SQL-filer innebygd i binæren (`embed`). Ingen filer trengs ved kjøring, og goose hopper over versjoner som allerede er kjørt.
- **Ruter:** `chi`. **Database:** `pgx/v5`.
- **Én binær** `smoreappen` med underkommandoene `serve` (standard) og `migrate`. `auth reset-link` kommer i steg 2.
- **Lokal utvikling og tester kjører i Docker via WSL.** Gruppepolicy på utviklingsmaskinen blokkerer lokalt bygde .exe-filer, også testbinærer. Testene bruker `TEST_DATABASE_URL` og lager en ny database per test.
- **`DEV_INSECURE_COOKIES=true`** tillater cookie uten `Secure` lokalt over http (DRIFT.md, «Lokal utvikling»). Brukes i steg 2.
- **Frontend** legges i `web/` (React + TypeScript + Vite) og bygges inn i Go-binæren, slik at én Render-tjeneste holder. Settes opp når første skjerm lages (steg 2).
- **SPEC_NEW.md erstatter SPEC.md**, som er avkuttet. Skjermbildene i `docs/design/` mangler. Designet er bygget etter teksten i SPEC_NEW.md, AUTH.md og readme_design.md.
- **Datamodell (SPEC_NEW.md seksjon 6):**
  - Faste verdier lagres som ASCII-koder med CHECK (`klassisk`/`skoyting`, `nysno`, `kunstsno`, `stryk_pa` …). Frontend oversetter til norske etiketter (`web/src/lib/domene.ts`).
  - Snøtypen `gammel_omdannet` er lagt til, fordi festevoks-radene i INNHENTING.md bruker den.
  - Produktkategorier: `glider_fast`, `glider_flytende`, `pulver`, `festevoks`, `klister`, `bindevoks`, `rens`, `verktoy`.
  - `renn.vaer` er delt i `sol`, `vind` og `endret_underveis` (readme_design.md 5.3). `snoalder` og `utkast` er lagt til.
  - `user_id` ligger på toppnivå-tabellene og på koblingstabellene (`renn_ski`, `smore_lag`, `vurdering`). Sammensatte fremmednøkler på (user_id, id) gjør at databasen selv hindrer kobling mellom brukere. Rene undertabeller av produkt (`produkt_sno_rad`, `produkt_kilde`, `produkt_beskrivelse`) eies via produktet.
  - Databasen håndhever i tillegg til appen: solgte ski kan ikke legges til et renn (trigger), ski med renn kan ikke slettes (RESTRICT), feste kun på klassiske renn (trigger), samme domene kun én gang som ekstern kilde.
  - `ekstern_kilde` lagrer bare hash av sideinnholdet, aldri teksten.
- **Frontend:** React 19 + TypeScript + Vite + React Router, testet med Vitest og Testing Library. Ingen UI-bibliotek; stil er ren CSS med tokens fra SPEC_NEW.md seksjon 3. Tekster ligger direkte i komponentene (kun norsk).
- **Skrift:** systemfont (Inter hvis installert). Eksterne fonter er ikke tillatt av CSP-en.
- **Lys/mørk:** følger systemet, med manuell overstyring (System/Lys/Mørk) lagret per enhet.
- **Temperaturformat:** ekte minus, pluss foran positive tall («0 til +2 °C»), desimalkomma.
- **Ikoner:** enkle strekikoner tegnet i `Icon.tsx`. Egne snøtype-ikoner er ikke laget ennå.
- **Ruten `/` sender foreløpig til `/designsystem`.** Ikke-bygde skjermer viser en tomtilstand. Innlogging foran alt kommer i steg 2.
- **`robots.txt`** med `Disallow: /`, siden appen er privat.
## Skjermbilder (docs/design/Skjermbilde1–5.png)

- Filene heter ikke som i SPEC_NEW.md seksjon 10. Kobling: 1 = `01-finn`, 2 = nytt produkt (innganger), 3 = `03-ski-liste`, 4 = `06-produkt-festevoks` (gjennomgang), 5 = `09-nytt-renn-smoring`.
- Designsystemet er justert etter bildene: grå sekundærknapper, tertiær som grå tekst, ikonknapper med kant, disiplinvalg som to knapper med ikon, større temperaturtall uten skala, listevalg på én linje med ikon, «+» i hevet boks i bunnmenyen, fjell bak tittelen på Finn.
- **Avvik fra bildene:**
  - Eksempeldata med fluor («Fluorpulver kald», «Fluorholdig blokk») er byttet ut. Alt er fluorfritt.
  - «Min erfaring» og konfidensmerket vises som to merker, ikke ett («Min erfaring · Solid»), fordi SPEC_NEW.md krever ulik form per konfidensnivå.
  - Tipskort viser «Hentet <dato>» (SPEC_NEW.md 5.4), som ikke står på bildet.
  - Valgt disiplin har aksentfarge, tykk kant og fet tekst, slik at valget ikke vises med farge alene.
  - Disiplinikonene er egne: spor for klassisk, V for skøyting.
- Statiske skjermeksempler ligger på `/designsystem/eksempler`.

## Klikkbar prototype

- Hvert skjermbilde er en egen visning. Finn er hovedsiden (`/`). Hovedvisningene (Finn, Spør, Tips, Utstyr) har bunnmeny. Skjema og flyter (Nytt renn, Nytt produkt, Sjekk produktet, Ski-skjema, Innstillinger) vises i fullskjerm uten bunnmeny, som på skjermbildene.
- «+» (Logg) åpner Nytt renn direkte. Rennlista kommer i steg 10.
- Data ligger i minnet (`web/src/demo/DemoStore.tsx`) og forsvinner ved ny innlasting. Byttes mot API-et steg for steg.
- «Hent produkt» simulerer innhenting: lenker med «bull-ski» gir Skigo-fasiten, alle andre gir Swix VP50 Pro. «Ta bilde» gir VP50 Pro med færre felt og to «Sjekk»-felt.
- Passer-logikken (`web/src/lib/fit.ts`) er testet mot tilfellene i INNHENTING.md. Uten valgt snøtype regnes treff på temperatur som «Passer nå».
- Standardmetode når et lag legges til: glider fast → Stryk på, flytende → Tynt lag, pulver → Pulver, festevoks → Kork inn, klister → Tynt lag, bindevoks → Stryk på. Smørejerntemperatur fylles inn fra produktet.
- Bytte disiplin til skøyting fjerner festelag og ski av feil disiplin fra valget.

## Opprydding

- `readme.md` og `docs/SPEC.md` er slettet. Begge var utgått (se steg 1). `docs/SPEC_NEW.md` er spesifikasjonen.

## Spør og Andres erfaringer (prototype)

- **Andres erfaringer:** henting er simulert. Ny lenke gir tre utkast (høy, middels og lav sikkerhet). Samme domene kan ikke legges til to ganger; da tilbys «Oppdater kilden». Behandlede utkast blir stående på gjennomgangsskjermen med «Angre» til brukeren trykker «Ferdig».
- Godkjente tips deles med Finn og Spør via eksempelbutikken. Tips uten temperatur vises ikke i temperatursøk (aldri gjett).
- **Spør:** tolkningen er regelbasert i prototypen (`features/spor/tolk.ts`). Den ekte bruker språkmodellen bak et grensesnitt og returnerer bare et validert filter. Rangering og tall beregnes alltid i kode. Svarteksten er en mal med tall fra beregningen.
- «Kald» uten tall gir alltid et oppklaringsspørsmål. Mangler disiplin, spør appen. «I dag» bruker −7 °C som eksempel til værhenting finnes.
- Konfidens i Spør: 5 eller flere renn = Solid erfaring, 2–4 = Noe erfaring, 1 = Ett renn. Kravet om effektivt antall renn (SPEC/readme) kommer med den ekte rangeringen.

## Drift

- **`render.yaml`:** `preDeployCommand` bruker full sti `/app/smoreappen migrate`. `UPLOAD_DIR` er utelatt fordi bilder ikke lagres.
