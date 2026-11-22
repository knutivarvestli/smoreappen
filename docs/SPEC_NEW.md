# Smøreappen: beslutninger og spesifikasjon for Claude Code

> Dette dokumentet samler alle beslutninger fra designarbeidet. Det **supplerer og overstyrer** `readme_design.md` (opprinnelig designbrief). Der de er uenige, gjelder dette dokumentet.
>
> Relaterte dokumenter, som gjelder foran dette på sine områder:
>
> - `docs/AUTH.md`: innlogging, sessions, glemt passord, e-post, kontoinnstillinger
> - `docs/INNHENTING.md`: henting fra URL og bilde, sikkerhet, JSON-skjemaer, fasit for tester
> - `docs/DRIFT.md`: Render, miljøvariabler, plan, lokal utvikling
>
> Prototypene er laget som klikkbare HTML-widgets i en chat. Skjermbilder ligger i `docs/design/` (legges inn manuelt). Manglende skjermbilder er ikke til hinder for å bygge: følg teksten her.

**Slutt av fil-sjekk:** hvis denne filen ikke slutter med seksjon 10 («Prototypene») og ikke inneholder seksjon 6 (datamodell) og 8 (komponenter), er den avkuttet. Si fra til eieren.

## 1. Hva appen er

Personlig smøre-assistent og erfaringsdatabase for langrenn, **klassisk og skøyting**. Privat bruk, én bruker, med innlogging. Kjører på Render. Mobil først (390 px, må fungere ned til 360 px), desktop 1440 px. UI-språk: norsk bokmål. Lys og mørk modus fra start.

Tre kjernefunksjoner:

1. **Søk:** velg forhold, trykk Søk, få anbefalinger. (Het «Finn» i tidligere versjoner.)
2. **Andres erfaringer:** lim inn lenker til blogger og smøretips, godkjenn utkast.
3. **Logg:** logg renn med ski, smøring og vurdering. Over tid svarer appen på «hva har fungert best for meg ved …».

**Alt smøremateriell er fluorfritt.** Fluor finnes ikke som felt eller filter noe sted i appen.

## 2. Foreslått teknisk stack (kan endres)

- Backend: Go. Database: PostgreSQL (Render Postgres). Hosting: Render (se `DRIFT.md`).
- Frontend: React + TypeScript. Komponentnavn som i seksjon 8. PWA (manifest og service worker) slik at appen kan legges på hjemskjermen.
- Innhenting: hent HTML fra URL, trekk ut felt med språkmodell. Bildelesing med språkmodell med bildestøtte. Alt bak grensesnittet `Extractor`, med mock for tester (se `INNHENTING.md`).
- E-post bak grensesnittet `Mailer` (se `AUTH.md`).
- Alt utkast fra URL eller bilde **må godkjennes av brukeren** før det lagres.
- Appen er offentlig på internett og krever innlogging fra første deploy (se seksjon 5.8 og `AUTH.md`).

## 3. Design: visuell retning «vinter og fjell»

Kald, ren, tydelig. Mye luft, tall som hovedpersoner. Ingen gradienter eller dekor. Tydelige kantlinjer (1,5 px) i stedet for skygger, fordi det fungerer i sterkt sollys. Avrunding 8–12 px. Trykkflater minst 48 px. Kontrast minst WCAG AA, helst AAA for temperatur og anbefalinger. Farge bærer aldri betydning alene: alltid ikon eller tekst i tillegg. Respekter «reduser bevegelse».

Fjellsilhuett (to flate, lave lag) i toppen av «Søk» og på innloggingsskjermene.

**Logo:** eget merke (fjelltopp over to skispor) i primærfargen, sammen med teksten «Smøreappen». Følger lys og mørk modus. Samme merke er favicon. Se seksjon 4 for plassering.

**Mobil og plass:** hovedsiden (Søk) skal passe på én skjerm uten skrolling ned til 360 × 640, med bunnmenyen synlig. Trykkflater blir aldri mindre enn 48 px for å få plass. Temperaturdisplayet bruker 48 px (nedre grense) der plassen er knapp.

### Fargetokens

| Rolle | Lys modus | Mørk modus |
| --- | --- | --- |
| Bakgrunn («snø») | `#F3F7FA` | `#0D1620` |
| Overflate | `#FFFFFF` | `#16232F` |
| Tekst (skifer) | `#14212E` | `#E9F0F6` |
| Sekundærtekst | `#4A5B6B` | `#A5B6C5` |
| Kantlinje («rim») | `#C3D0DB` | `#34495B` |
| Primær (fjellmarine) | `#14304F` | `#8EC5EC` |
| Isblå (valgt/uthevet) | `#DCEBF6` | `#1D3447` |
| Klassisk (rav) | `#9A5410`, bakgrunn `#FBEBD3` | `#F0B261`, bakgrunn `#3A2A14` |
| Skøyting (furu) | `#0B6E6C`, bakgrunn `#D6F0EE` | `#5FD1CC`, bakgrunn `#12403F` |
| Nettside/andres erfaring | `#3F5A73`, bakgrunn `#E4EBF2` | `#A9C0D6`, bakgrunn `#22384B` |
| Min erfaring | `#0B6E6C` (furu), flaggikon | `#5FD1CC` |
| Godkjent | `#1D5A22` på `#DFF1E0` | `#8FD694` på `#17321B` |
| Utkast/advarsel | `#7A4108` på `#FBEBD3` | `#F0B261` på `#3A2A14` |
| Feil | `#A32D2D` på `#FBE4E4` | `#F09595` på `#3A1C1C` |

Konfidensmerker har tre trinn med ulik form i tillegg til farge: **Solid erfaring** (fylt), **Noe erfaring** (omriss med lys bakgrunn), **Ett renn** (stiplet kant).

Typografi: én nøytral sans-serif med tabulære sifre. Ekte minustegn (−, U+2212) i alle temperaturer. Temperatur vises stort, f.eks. «−7 °C» (display 48–56 px). Skala: display, tittel, overskrift, brødtekst, hjelpetekst, etikett.

## 4. Navigasjon

Mobil: bunnnavigasjon med 5 faner: **Søk · Spør · Logg (fremhevet «+») · Tips · Utstyr**. Innstillinger via ikon øverst. Desktop: fast sidemeny med samme struktur.

**Logo på alle sider:** logo og «Smøreappen» står øverst på alle sider, og et trykk går alltid til hovedsiden (Søk). Mobil: smal logolinje øverst. På Søk står logoen i fjellfeltet i stedet, så siden fortsatt passer uten skrolling. Desktop: øverst i sidemenyen.

**Hovedvisninger og flyter:** hver skjerm er en egen visning. Hovedvisningene (Søk, Resultater, Spør, Tips, Utstyr) har bunnmeny. Skjema og stegvise flyter (Nytt renn, Nytt produkt, Sjekk produktet, ski-skjema, gjennomgang av tips, Innstillinger) vises i fullskjerm uten bunnmeny, med tilbake-pil og hovedhandlingen alltid synlig nederst.

**Tips-fanen heter «Andres erfaringer»** (motstykke til «Min erfaring»).

Uinnlogget bruker ser kun innloggingsskjermene (seksjon 5.8). Alle andre ruter sender til innlogging.

## 5. Skjermer og beslutninger

### 5.1 Søk (hovedsiden) og Resultater

Skjermen het «Finn» tidligere. Hovedsiden har bare forholdene og selve søket. Resultatene vises i en egen visning.

**Søk (hovedsiden, `/`):**
- Disiplin-toggle (Klassisk/Skøyting) øverst. Valget huskes.
- Stor temperaturvelger (stepper −/+, slider, direkte tall). Vises som display.
- **Snøtype og snøopprinnelse er listevalg der kun én rad vises** (kollapset rad som åpner liste). Snøtype tillater flere valg. Andre forholdsfelt (fuktighet, hardhet, snøalder, vind, snøtemperatur) følger samme mønster.
- Lenke **«Se værmeldingen på yr.no»** (`https://www.yr.no/nb`, åpnes i ny fane), så det er lett å sjekke været før man velger forhold.
- Stor knapp **«Søk»** nederst. Ingen resultater på hovedsiden.

**Resultater (`/resultater`):**
- Forholdslinje øverst (disiplin · temp · snøtype, snøopprinnelse under) med «Endre», som går tilbake til hovedsiden med valgene beholdt.
- **Tre smøretips** i én nummerert liste, sortert med egen erfaring tyngst. Hvert kort viser alltid kilden: «Min erfaring» med konfidensmerke, eller domenet for andres tips. Aldri blandet uten merking.
- Sortering (prototype): egen erfaring vektes etter konfidens (Solid 3, Noe 2, Ett renn 1), andres godkjente tips etter sikkerhet (Høy 1,5, Middels 1, Lav 0,5). Solid og noe egen erfaring går dermed alltid foran andres tips. Ett enkelt eget renn kan havne bak et tips med høy sikkerhet. Ved lik vekt går egen erfaring først, så flest renn, så nærmest temperatur. Den ekte rangeringen (likhet, shrinkage) gjøres i backend.
- Under lista: to knapper, **Mine erfaringer (N)** og **Andres erfaringer (N)**, som åpner detaljvisningene `/resultater/mine` og `/resultater/andre` med alle treff i hver gruppe. Knappen er deaktivert når gruppen er tom.
- Visningen med tre tips og knappene skal passe uten skrolling ned til 360 × 640.
- «Søk» i menyen er markert på resultatvisningen og detaljvisningene.
- Kort er kompakte: kilde/domene, temperaturområde, én linje tekst (kuttes med «…»). Tips fra andre viser hentet-dato.
- Tom: «Ingen godkjente tips for disse forholdene. Legg til flere kilder?»
- Hvis flere kilder passer men anbefaler ulike løsninger: vis «Kildene anbefaler ulike løsninger. Din egen erfaring teller tyngst.» (i detaljvisningen for andres erfaringer).
- Min erfaring viser alltid antall renn og konfidensmerke (Solid erfaring / Noe erfaring / Ett renn).

### 5.2 Ski (Utstyr → Ski)

Liste: navn, disiplin, merke + modell, lengde, vektområde, årsmodell, status. Fargestripe for disiplin i tillegg til tekst.

**Skjema (rekkefølge):**

1. Navn (tekst)
2. Disiplin (segment: Klassisk/Skøyting)
3. **Merke** (listevalg: Fischer, Salomon, Atomic, Madshus, Rossignol, Annet)
4. **Modell** (tekstfelt)
5. Lengde (cm) og **Årsmodell** (firesifret år), side om side
6. **Vektområde (kg): fra og til** (to felt; validering: fra ≤ til)
7. **Slip** (fritekst)
8. **Beskrivelse** (flerlinjers tekst)
9. **Status:** Aktiv · Hvilende · **Solgt**

**Solgt** = vises som «Ikke tilgjengelig», kan ikke velges i nye renn. Historikk og statistikk beholdes. Aldri slett ski som har renn.

«Annet» merke åpner et tekstfelt. Forslag til senere: autoforslag fra tidligere brukte slip-tekster for jevn skrivemåte.

### 5.3 Produkter (Utstyr → Produkter)

**Nytt produkt har tre innganger:** lim inn lenke, ta bilde av eske/boks/etikett, eller manuelt.

- **Lenke** er sikrest (tekst, ikke tolkning). Feilmeldinger: siden kunne ikke hentes, inneholder ikke produktinfo, krever innlogging.
- **Bilde** gir færre felt. Felt appen ikke finner står som «Ikke funnet». Felt appen er usikker på markeres med «Sjekk» (amber kant + merke), og merket forsvinner når brukeren endrer feltet.
- Etter innhenting: **gjennomgangsskjerm** der alt kan endres før «Lagre produkt». Banner: «Alle felt ble funnet på siden» (grønt) eller «Appen var usikker på N felt» (amber).
- Kategorier: Glider (fast), Glider (flytende), Pulver, Festevoks, Klister, Bindevoks, Rens, Verktøy.
- Utkast, felt og sikkerhetsregler for innhenting: se `INNHENTING.md`.

**Felt for alle:** Merke, Modell, Kategori, Temperaturområde (fra/til °C, kan mangle, aldri gjett).

**Fjernet (ikke relevant):** fluor, størrelse/vekt på produktet, produktnummer.

**Glider** (under «Flere detaljer»): snøtype, luftfuktighet, smørejernstemperatur (°C).

**Festevoks / Klister / Bindevoks** viser i stedet:

- **Farge** (tekst + liten fargeprikk).
- **Etter snøtype:** rader med snøtype-tekst + fra/til °C. Temperatur for feste avhenger av snøen, så et produkt kan ha flere rader. Rader kan endres, fjernes og legges til.

**Produktbeskrivelse-knapp** (egen side): brukeren legger inn flere nettsider om produktet. «Oppsummer» lager en kort, omskrevet oppsummering i avsnitt (glider: Bruk, Holdbarhet, Påføring, Omtale. Feste: Bruk, Snø, Tips, Egenskaper). Regler:

- Aldri gjengi sideteksten. Kort, omskrevet. Lenke til hver original («Åpne original»).
- Salgspåstander merkes «ifølge selger».
- Endres kildene etterpå: vis «Du har endret kildene. Oppdater», knapp «Oppdater oppsummering».
- Motstridende opplysninger fra flere kilder vises som uenighet, ikke gjennomsnitt.
- Samme nettsted kan ikke legges til to ganger.

### 5.4 Andres erfaringer

- Lim inn URL → fremdrift (henter side, leser innhold, trekker ut tips) → **gjennomgang** → godkjenn.
- Utkast viser disiplin, temperaturområde (stort), snøtyper, lag/produkter, kort sammendrag, **sikkerhet (Høy/Middels/Lav)** og flagg som «Mangler snøtemperatur».
- Handlinger per utkast: **Godkjenn · Rediger (temperaturområde) · Forkast**, og «Angre». Samlehandling: «Godkjenn alle med høy sikkerhet».
- Statusmodell: `Utkast → Godkjent | Forkastet`. **Kun godkjente tips brukes i anbefalinger.**
- Kildeliste: domene, antall godkjente tips, sist oppdatert, «Oppdater».
- Samme domene kan ikke legges til to ganger. Da vises «… er allerede lagt til» med knappen «Oppdater kilden».
- Gjennomgangen er en egen fullskjermsvisning. Behandlede utkast blir stående med status og «Angre» til brukeren trykker «Ferdig». Hovedsiden for Tips viser «N utkast venter» når noe ikke er gjennomgått.
- Vis aldri hele artikkelteksten.
- Tips fra andre skal vise dato de ble hentet (blogger kan være gamle).

### 5.5 Nytt renn (stegvis, 4 steg)

Fremdriftsindikator øverst («Steg 3 av 4 · Smøring»). Lagrer underveis som utkast. Hurtigknapp: **Kopier fra forrige renn**.

1. Forhold.
2. Velg ski (solgte ski kan ikke velges).
3. Smøring.
4. Vurdering (kan gjøres senere).

**Steg 1 Forhold:** dato (default i dag), sted, renntype (renn/trening), disiplin, lufttemp (stor velger), snøtemp (valgfri), snøopprinnelse, snøtype, fuktighet, løypehardhet, vær (sol/vind), notat. Resten under «Flere detaljer».

**Steg 3 Smøring, per ski:**

- Forholdslinje øverst (disiplin · temp · snøtype), «Endre» åpner justering.
- Seksjoner **Rill · Glid · Feste**. **Feste vises kun for klassisk.** Bytte til skøyting tømmer festelag.
- Hvert lag: produkt + metode (Stryk på, Kork inn, Gni, Børst, Pulver, Tynt lag). Lag kan åpnes for å endre metode, flytte opp og fjerne.
- **Produktvelger** (egen skjerm): søk, kun produkter som hører til rollen. Gruppert i «Passer til forholdene» og «Andre produkter». Hvert produkt har merke: **Passer nå** (grønt), **Annen snøtype** (amber), **Utenfor område** (amber), ingen merke hvis temperatur ikke er oppgitt.
- Produkt med smørejerntemperatur fyller automatisk inn «Smørejern N °C» på laget.
- Etter lagring: tilstanden «Mangler vurdering» på renn i lista.

**Passer-logikk:**

```
fit(produkt, tempC, snøtype):
  hvis produkt har snø-rader:
    hvis en rad har lo<=temp<=hi OG snøtype i rad.tags -> ok
    ellers hvis en rad matcher temp men ikke snøtype -> snow
    ellers -> no
  ellers hvis produkt har lo/hi: temp innenfor -> ok, ellers no
  ellers -> na (ingen merke, ikke gjett)
Sortering: ok, snow, na, no
```

Forslag, ikke krav: brukeren velger alltid selv. Testtilfeller står i `INNHENTING.md`.

**Smøring fra bilde:** bilde av voksene (esker/etiketter), ikke av selve smørelaget. Appen leser produkter og foreslår lag. Usikre lag markeres «Sjekk». Brukeren kan endre rolle, produkt og metode, godkjenne («Ser riktig ut») eller fjerne. «Legg til lag» og «Legg inn manuelt» finnes alltid.

### 5.6 Spør

Se `readme_design.md` 6.4. Tillegg: svaret skiller tydelig mellom **egne renn** og **Andres erfaringer**. Konfidensmerke og «bygger på N renn» alltid synlig.

- Rekkefølge i svaret: «Jeg søkte etter» (filterchips), kort svartekst, rangert liste under **Min erfaring** (nummerert, med direkte sammenligninger), «Se rennene bak svaret», og til slutt **Andres erfaringer** merket «Tips fra nettsider, ikke din egen erfaring».
- Filterchips: disiplin byttes med ett trykk, temperatur og snøopprinnelse fjernes med ×.
- «Kald» uten tall og manglende disiplin gir et oppklaringsspørsmål med 2–4 trykkvalg. Spørsmålet tolkes aldri stille.
- Språkmodellen lager bare filteret (validert JSON). Tall, rangering og konfidens beregnes i kode. Svarteksten bygger bare på beregnede tall.

### 5.7 Vurdering (steg 4 i Nytt renn, prototypet uten lagring)

Se `readme_design.md` 5.5. Glid mot feltet (Langsommere/Lik/Raskere), rangering, feste (kun klassisk), stjerner, hvor sikker vurderingen er, notat.

### 5.8 Innlogging og konto

Full spesifikasjon i `AUTH.md`. Sammendrag:

- Appen har **ingen åpen registrering**. Eierens konto opprettes ved første oppstart fra `ADMIN_EMAIL`, og passord velges via lenke i e-post.
- **Uinnloggede skjermer (mobil først, med fjellsilhuett):** Logg inn · Glemt passord · Sjekk e-posten · Velg nytt passord · Lenken har utløpt · Passordet er endret.
- Innlogging: e-post og passord, «Vis passord»-knapp, «Glemt passord?». Feil er alltid «Feil e-post eller passord.» Etter gjentatte forsøk: «For mange forsøk. Prøv igjen om 15 minutter, eller bruk «Glemt passord»».
- Glemt passord: bruker skriver e-post, og får alltid samme svar («Hvis adressen finnes hos oss, har vi sendt en lenke.»). Lenken gjelder 30 minutter og kan brukes én gang. Passord: minst 12 tegn. Etter endring logges brukeren ut overalt og får bekreftelse på e-post.
- Sessions varer 30 dager rullerende.
- **Innstillinger (innlogget):** profil og e-post, bytt passord (krever nåværende), bytt e-post (bekreftes på ny adresse), aktive sessions, logg ut og logg ut overalt, tema (lys/mørk/system), språk (nb), enheter (°C), eksport av alle data, personvern.

### 5.9 Onboarding (første gang etter første innlogging)

Kort, 3 steg: velg disiplin(er) → legg til første ski (kan hoppes over) → legg til første kilde eller logg første renn. Forklar at appen blir mer nyttig jo mer man logger.

## 6. Datamodell (forslag)

| Tabell | Viktige felt |
| --- | --- |
| `ski` | id, navn, disiplin, merke, modell, lengde\_cm, arsmodell, vekt\_fra\_kg, vekt\_til\_kg, slip (tekst), beskrivelse (tekst), status (`aktiv`/`hvilende`/`solgt`) |
| `produkt` | id, merke, modell, kategori, temp\_fra, temp\_til (nullable), farge (nullable), snotype (nullable), luftfuktighet (nullable), smorejern\_c (nullable), kilde\_url (nullable) |
| `produkt_sno_rad` | id, produkt\_id, sno\_tekst, sno\_tags\[\], temp\_fra, temp\_til |
| `produkt_kilde` | id, produkt\_id, url, domene, hentet\_dato |
| `produkt_beskrivelse` | produkt\_id, avsnitt (json: overskrift, tekst), generert\_dato, kilder\_hash |
| `ekstern_kilde` | id, domene, url, sist\_hentet |
| `ekstern_tips` | id, kilde\_id, disiplin, temp\_fra, temp\_til, snotyper\[\], lag (json), sammendrag, sikkerhet (`hoy`/`middels`/`lav`), mangler\_tekst, status (`utkast`/`godkjent`/`forkastet`), hentet\_dato |
| `renn` | id, dato, sted, renntype, disiplin, lufttemp, snotemp, snoopprinnelse, snotyper\[\], fuktighet, loypehardhet, vaer, notat, vurdering\_mangler (bool) |
| `renn_ski` | renn\_id, ski\_id, valgt (bool) |
| `smore_lag` | id, renn\_id, ski\_id, rolle (`rill`/`glid`/`feste`), rekkefolge, produkt\_id, metode, strykertemp\_c, notat |
| `vurdering` | renn\_id, ski\_id, glid\_mot\_felt, rangering, feste, stjerner\_glid, stjerner\_feste, sikkerhet (`folelse`/`testrunde`/`resultat`), notat |

Auth-tabellene (`users`, `sessions`, `password_tokens`, `auth_hendelser`) er definert i `AUTH.md`. Alle brukerdata-tabeller bør ha `user_id`, selv om det bare er én bruker i første versjon.

Temperaturer lagres som heltall eller desimaltall i °C. Minus vises som U+2212.

## 7. Innholdsregler (tekst i UI)

Sentence case. Ingen utropstegn i systemtekst. Aktiv, verb først på knapper («Hent tips», «Lagre produkt»). Feil: si hva som skjedde, og hva brukeren kan gjøre. Tomtilstander er invitasjoner, ikke unnskyldninger. Bruker «din/dine», ikke «min» i systemtekst, men fanen/gruppen **«Min erfaring»** beholdes som egennavn.

Eksempeldata i prototypene (produktnavn merket «(eksempel)», Fischer Speedmax osv.) er illustrasjoner. Ekte produkter fra bruker: **Skigo FFC LDQ 157 3.0** (glider, −20 til +2 °C, smørejern 145 °C, luftfuktighet <65 %) og **Swix VP50 Pro** (festevoks, lys fiolett, −3 til 0 °C; ny/nyfallen finkornet −3 til 0, gammel/omdannet −6 til −1). Fasit i JSON-format står i `INNHENTING.md`.

## 8. Komponenter (navn speiles i React)

**Inndata:** `TemperatureInput` (stor display, slider med minusgrader, +/− stepper, direkte tallinntasting), `DisciplineToggle` (med fargeaksent), `PickRow` (listevalg der kun én rad vises; erstatter `SnowTypeChips`), `SegmentedControl`, `RatingStars`, `RankPicker`, `TextField`, `PasswordField` (med «Vis passord»), `SearchField`, `ProductPicker`.

**Visning:** `RecommendationCard` (ett av de tre smøretipsene, med plassering og kilde), `TipCard` (med `SourceBadge`), `ExperienceResultCard` (med `ConfidenceBadge`), `WaxLayerList` / `WaxLayerItem`, `ProductCard`, `SkiCard`, `RaceCard`, `ConditionsSummary`, `FilterChips`, `StatusBadge`, `FlagBadge` («Sjekk»/«Passer nå»), `StepProgress`, `ReviewBanner`, `Timeline`, `EmptyState`, `ErrorState`, `LoadingState`.

**Skjemadeler (lagt til under prototypingen):** `SelectField` (innebygd nedtrekksvalg), `TempRangeField` («−3 til 0»), `SnowRowList` (festevoks etter snøtype), `LinkRow` (rad som åpner underside eller ekstern lenke), `SourceInfo` («Hentet fra nettside»).

**Navigasjon og overlays:** `AuthLayout` (fjellsilhuett + innhold), `Brand` / `LogoMark` (logo + «Smøreappen», lenke til hovedsiden), `BottomNav`, `SideNav`, `TopBar` (med tilbake-pil, fjellfelt eller logo), `AppShell` (hovedvisning med bunnmeny eller flyt uten), `BottomSheet`/`Dialog`, `Toast`, `ConfirmDialog`, `Tabs`, `Accordion`.

**Handlinger:** `Button` (primær, sekundær, tertiær, destruktiv; stor trykkflate), `IconButton`, `FloatingAddButton`.

Alle komponenter: standard, hover, fokus, trykket, deaktivert, feil. Synlig fokus og tastaturnavigasjon på desktop. Skjermleseretiketter på ikoner, temperaturvelger og segmentvalg.

## 9. Status og åpne punkter

**Finnes som klikkbar prototype i appen (eksempeldata i minnet, ingenting lagres):** Søk og Resultater, Spør, Andres erfaringer med gjennomgang, Utstyr (ski og produkter), Nytt produkt og Sjekk produktet, Nytt renn med alle fire steg og produktvelger, Innstillinger (tema), designsystem. Backend har datamodell og migreringer, men ingen API for disse ennå.

**Ikke bygget ennå:**
- Innlogging og konto (`AUTH.md`), og at alt annet ligger bak innlogging.
- API og lagring for ski, produkter, renn, tips og vurdering. Ekte henting fra URL og bilde (`INNHENTING.md`), ekte rangering for Spør og Resultater.
- «Mangler vurdering»-flyt, rennliste, rennedetalj, onboarding.
- Smøring fra bilde og produktbeskrivelse («Oppsummer»).
- Offline («lagret lokalt, synkroniseres senere»): tilstanden finnes i designsystemet, selve offline kommer i fase 2.
- Værhenting inn i appen (fase 2). Til da lenker Søk til yr.no.
- Autoforslag for slip-tekst. Egne snøtype-ikoner.
- TOTP eller passkeys og flere brukere (se `AUTH.md`, «Senere»).
- **Byggerekkefølge:** prosjektoppsett og datamodell → autentisering → ski → produkter (manuelt) → nytt renn med smøring → Søk og resultater → URL/bilde-innhenting → Andres erfaringer → Spør → vurdering, rennliste, innstillinger, onboarding, desktop → første deploy.

## 10. Prototypene (for referanse)

Tretten skjermer er tegnet som statiske bilder (mobil, lys og mørk modus). De skal ligge i `docs/design/` med disse navnene:

`00-designsystem.png`, `01-finn.png`, `02-smoring-bilde.png`, `03-ski-liste.png`, `04-ski-skjema.png`, `05-produkt-glider.png`, `06-produkt-festevoks.png`, `07-andres-erfaringer.png`, `08-gjennomgang.png`, `09-nytt-renn-smoring.png`, `10-produktvelger.png`, `11-logg-inn.png`, `12-sjekk-epost.png`, `13-nytt-passord.png`.

Hvis `docs/design/` er tom, bygg etter teksten i dette dokumentet, `AUTH.md` og `readme_design.md`. Si fra til eieren at skjermbilder mangler, men ikke vent på dem.

**Lagt inn så langt:** fem skjermbilder med andre navn. `Skjermbilde1.png` = Finn/Søk (før resultatene ble flyttet til egen visning), `Skjermbilde2.png` = nytt produkt (innganger), `Skjermbilde3.png` = ski-liste, `Skjermbilde4.png` = sjekk produktet (festevoks), `Skjermbilde5.png` = nytt renn, smøring. Eksempeldata med fluor i bildene gjelder ikke: alt er fluorfritt. Der bildene og denne teksten er uenige, gjelder teksten.

--- SLUTT PÅ DOKUMENTET ---
