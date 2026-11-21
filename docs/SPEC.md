# Smøreappen: beslutninger og spesifikasjon for Claude Code

> Dette dokumentet samler alle beslutninger fra designarbeidet. Det **supplerer og overstyrer** `readme_design.md` (opprinnelig designbrief). Der de er uenige, gjelder dette dokumentet.
>
> Relaterte dokumenter, som gjelder foran dette på sine områder:
> - `docs/AUTH.md`: innlogging, sessions, glemt passord, e-post, kontoinnstillinger
> - `docs/INNHENTING.md`: henting fra URL og bilde, sikkerhet, JSON-skjemaer, fasit for tester
> - `docs/DRIFT.md`: Render, miljøvariabler, plan, lokal utvikling
>
> Prototypene er laget som klikkbare HTML-widgets i en chat. Skjermbilder ligger i `docs/design/` (legges inn manuelt).

## 1. Hva appen er

Personlig smøre-assistent og erfaringsdatabase for langrenn, **klassisk og skøyting**. Privat bruk, én bruker, med innlogging. Kjører på Render. Mobil først (390 px, må fungere ned til 360 px), desktop 1440 px. UI-språk: norsk bokmål. Lys og mørk modus fra start.

Tre kjernefunksjoner:
1. **Finn:** velg forhold, få anbefalinger.
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

Fjellsilhuett (to flate, lave lag) i toppen av «Finn» og på innloggingsskjermene.

### Fargetokens (lys modus, mørk modus justeres tilsvarende kaldt)

| Rolle | Verdi |
|---|---|
| Bakgrunn («snø») | `#F3F7FA` |
| Overflate | `#FFFFFF` |
| Tekst (skifer) | `#14212E` |
| Sekundærtekst | `#4A5B6B` |
| Kantlinje («rim») | `#C3D0DB` |
| Primær (fjellmarine) | `#14304F` |
| Isblå (valgt/uthevet) | `#DCEBF6` |
| Klassisk (rav) | `#9A5410`, bakgrunn `#FBEBD3` |
| Skøyting (furu) | `#0B6E6C`, bakgrunn `#D6F0EE` |
| Nettside/andres erfaring | `#3F5A73`, bakgrunn `#E4EBF2` |
| Min erfaring | `#0B6E6C` (furu), flaggikon |
| Godkjent | `#1D5A22` på `#DFF1E0` |
| Utkast/advarsel | `#7A4108` på `#FBEBD3` |
| Feil | `#A32D2D` (bakgrunn `#FBE4E4`) |

Mørk modus: bakgrunn `#0D1620`, overflate `#16232F`, tekst `#E9F0F6`, primær `#8EC5EC`, aksenter lysere.

Typografi: én nøytral sans-serif med tabulære sifre. Ekte minustegn (−, U+2212) i alle temperaturer. Temperatur vises stort, f.eks. «−7 °C».

## 4. Navigasjon

Mobil: bunnnavigasjon med 5 faner: **Finn · Spør · Logg (fremhevet «+») · Tips · Utstyr**. Innstillinger via ikon øverst. Desktop: fast sidemeny med samme struktur.

**Tips-fanen heter «Andres erfaringer»** (motstykke til «Min erfaring»).

Uinnlogget bruker ser kun innloggingsskjermene (seksjon 5.8). Alle andre ruter sender til innlogging.

## 5. Skjermer og beslutninger

### 5.1 Finn
- Disiplin-toggle (Klassisk/Skøyting) øverst. Valget huskes.
- Stor temperaturvelger (stepper −/+, slider, direkte tall). Vises som display.
- **Snøtype og snøopprinnelse er listevalg der kun én rad vises** (kollapset rad som åpner liste). Snøtype tillater flere valg. Andre forholdsfelt (fuktighet, hardhet, snøalder, vind, snøtemperatur) følger samme mønster.
- Resultat i to merkede grupper: **Min erfaring** øverst (hvis data), **Andres erfaringer** under. Aldri blandet uten merking.
- Kort er kompakte: kilde/domene, temperaturområde, én linje tekst.
- Tom: «Ingen godkjente tips for disse forholdene. Legg til flere kilder?»
- Hvis flere kilder passer men anbefaler ulike løsninger: vis «Kildene anbefaler ulike løsninger. Din egen erfaring teller tyngst.»
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

Forslag til senere: autoforslag fra tidligere brukte slip-tekster for jevn skrivemåte. «Annet» merke bør åpne et tekstfelt.

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
- Statusmodell: `Utkast → Godkjent |