# Smøreappen: designbrief for prototype og designsystem

> **Til Claude Design:** Dette dokumentet beskriver en mobil-først webapp for skismøring i langrenn. Lag (1) et designsystem med tokens og komponentbibliotek og (2) klikkbare prototyper av alle skjermer i seksjon 6, i mobil (390 px, må fungere ned til 360 px) og desktop (1440 px). Bruk eksempeldataene i seksjon 9 slik at skjermene ser ekte ut. Der noe er uklart: velg den enkleste løsningen og list antagelsene dine i slutten av leveransen. Alt UI-språk er norsk bokmål.

---

## 1. Hva appen er

En personlig smøre-assistent og erfaringsdatabase for **klassisk** og **skøyting**.

Den gjør tre ting:
1. **Smørefinner:** brukeren velger forhold (disiplin, temperatur, snøtype) og får smøretips fra nettsider og fra egne tidligere renn.
2. **Tipsbibliotek:** brukeren limer inn URL til en nettside med smøretips. Appen trekker ut tipsene og strukturerer dem på snøtype og temperatur. Brukeren går gjennom og godkjenner før de blir søkbare.
3. **Rennlogg og erfaringsdatabase:** brukeren logger hvert renn eller hver trening (forhold, ski, smøring, vurdering). Over tid kan appen svare på spørsmål som *«Hva har faktisk fungert best for meg på kald kunstsnø rundt −7 °C?»*

**Klassisk vs. skøyting**
- Klassisk: **feste (kick) er like viktig som glid**. Rill er enklere og mindre kritisk.
- Skøyting: kun **glid og rill**.

Samme komponentsett for begge, men disiplinen skal alltid være tydelig synlig.

---

## 2. Brukere og bruksøyeblikk

**Hovedbruker:** en aktiv utøver, trener eller foresatt som smører ski til trening og renn. Teknisk middels, ofte stresset og i tidsnød.

**Bruksøyeblikk (design for disse):**
- *Kvelden før:* sitter hjemme, søker i tips, planlegger smøring. Ro, god tid.
- *På rennet / ved løypa:* kald, sol i øynene, votter eller kalde fingre, dårlig dekning, 30 sekunder til å sjekke «hva funket sist». **Dette er den harde brukssituasjonen.** Store trykkflater, høy kontrast, minimal skriving.
- *Etter rennet:* fyller inn vurdering mens inntrykket er ferskt. Må gå på under ett minutt.
- *Hjemme senere:* utforsker egen erfaring, stiller spørsmål til databasen.

---

## 3. Designprinsipper

1. **Mobil først, én hovedhandling per skjerm.**
2. **Temperatur og snøtype er de viktigste inputene.** De skal være raske å velge uten tastatur: stor temperaturvelger, snøtype som chips med ikon.
3. **Skille tydelig mellom kildene.** «Fra nettsider» (andres tips) og «Min erfaring» (egne renn) skal alltid kunne skilles visuelt (badge, ikon, aksent), aldri blandes uten merking.
4. **Ærlighet om datagrunnlag.** Erfaringssvar viser alltid antall renn og et konfidensmerke. Tynt grunnlag skal se tynt ut, ikke selvsikkert.
5. **Rolig og sportslig.** Ikke leken, ikke «gamified». Tenk presist måleinstrument, ikke app for barn.
6. **Fungerer i sterkt sollys og med votter.** Minimum 48 px trykkflater, stor tekst for nøkkeltall, kontrast minst WCAG AA (helst AAA for temperatur og anbefalinger).
7. **Spor alt tilbake til kilden.** Hvert tips viser kilde-domene. Hvert erfaringssvar kan åpnes ned til rennene det bygger på.

---

## 4. Visuell retning

**Stemning:** kald, ren, tydelig. Mye luft, tydelig hierarki, tall som hovedpersoner.

**Fargeforslag (juster fritt, men behold rollene):**
- Primær: dyp isblå / marineblå (handlinger, aktive tilstander)
- Nøytrale: kalde gråtoner, nesten-hvit bakgrunn («snø»), mørk skifer for tekst
- **Disiplinfarger:** klassisk og skøyting får hver sin aksentfarge (f.eks. klassisk = varm oransje/rav, skøyting = turkis/grønn). Brukes på disiplin-toggle, kantlinjer, badges og små markører. Må ikke bare være farge: legg alltid til tekst eller ikon.
- Kildefarge/-ikon: «Fra nettsider» (lenke-/globusikon, nøytral blå-grå) vs. «Min erfaring» (person-/flaggikon, tydelig aksent)
- Semantiske statusfarger: godkjent (grønn), utkast (gul/rav), forkastet (grå/rød), feil (rød), info (blå)
- Konfidensmerker har egen tre-trinns skala: *Solid erfaring* (sterk), *Noe erfaring* (middels), *Ett renn* (dempet)

**Typografi:** én nøytral sans-serif med gode tall (tabulære sifre) og tydelig minustegn (−). Skala: display (temperatur), tittel, overskrift, brødtekst, hjelpetekst, etikett. Temperaturer vises stort, f.eks. «−7 °C».

**Ikoner:** enkle strekikoner. Egne ikoner trengs for snøtyper (seksjon 5.2), disiplin, ski, voks, rill, termometer, kilde/lenke, renn/flagg.

**Form:** moderat avrunding (8–12 px), myke skygger kun for hevede elementer (modaler, bunnark), tydelige kantlinjer ellers (fungerer bedre i sol enn skygger).

**Mørk modus:** støtt fra start (mange bruker mobil tidlig morgen/kveld).

**Bevegelse:** minimal og funksjonell. Rolige overganger, ingen dekorative animasjoner. Respekter «reduser bevegelse».

---

## 5. Domeneinnhold som UI må støtte

### 5.1 Disiplin
`Klassisk` | `Skøyting`. Global toggle øverst på relevante skjermer. Valget huskes.

### 5.2 Snøtyper (med ikon, chips)
Nysnø · Snøfall · Finkornet · Grovkornet · Våt · Veldig våt (sørpe) · Isete/hard · Skitten · Rim

### 5.3 Andre forholdsfelt
- **Snøopprinnelse:** Naturlig · Kunstsnø · Blandet
- **Lufttemperatur** og **snøtemperatur** (to separate felt; snøtemp valgfritt)
- **Fuktighet:** Tørr · Normal · Fuktig
- **Løypehardhet:** Myk · Middels · Hard · Isete
- **Snøalder:** Fersk · Dager · Gammel
- **Vind:** Ingen · Lett · Sterk
- **Sol:** ja/nei
- **Forholdene endret seg underveis:** ja/nei
- Sted (tekst), dato

### 5.4 Smøring: lagmodell
Smøring er **lag på lag**, i rekkefølge (nederst først). Hvert lag har: rolle, produkt, metode, evt. strykertemperatur, notat.
- **Roller:** Glid · Feste · Bindevoks · Klister · Rill
- **Metoder:** stryk på, kork inn, gni, børst, pulver, tynt lag
- Feste og bindevoks gjelder kun klassisk.

### 5.5 Vurdering (rask, relativ)
- **Glid mot de andre skiene/feltet:** Langsommere · Lik · Raskere (segmentvalg)
- **Rangering** blant testede ski (1, 2, 3 …), valgfritt
- **Feste (kun klassisk):** Slurer · OK · Veldig bra
- **Stjerner 1–5** for glid og (klassisk) feste, som tilleggsvurdering
- **Hvor sikker er vurderingen:** Følelse · Testrunde · Resultat
- Fritt notat

### 5.6 Statusmodell for tips
`Utkast` → `Godkjent` eller `Forkastet`. Kun godkjente tips vises i søk og anbefalinger.

---

## 6. Skjermer og flyter

For hver skjerm: lag **mobil og desktop**, og vis relevante tilstander (tom, laster, feil, utfylt).

### Navigasjon
- **Mobil:** bunnnavigasjon med 5 faner: **Finn** (smørefinner), **Spør** (erfaringsdatabasen), **Logg** (renn, med fremhevet «+»-handling), **Tips** (kilder), **Utstyr** (ski og produkter). Profil/innstillinger via ikon øverst.
- **Desktop:** fast sidemeny med samme struktur, innhold i to kolonner der det passer.

### 6.1 Hjem / Smørefinner («Finn»)
Formål: raskeste vei fra «dagens forhold» til «hva smører jeg».
- Disiplin-toggle øverst.
- **Stor temperaturvelger** (slider/stepper med minusgrader, støtte for å trykke inn tall). Vis tallet som display-størrelse.
- Snøtype-chips (flervalg), snøopprinnelse (segment). «Flere valg»-utvidelse for snøtemp, fuktighet, hardhet.
- Snarvei «Bruk dagens vær» (fase 2, vis som deaktivert/kommer).
- **Resultatliste** under, i to tydelig merkede grupper:
  - *Min erfaring* (øverst hvis data finnes): kort med smøring, konfidensmerke, «bygger på N renn»
  - *Fra nettsider*: tipskort med kildebadge og domene
- Tomtilstand: «Velg forhold for å se tips».
- Ingen treff: «Ingen godkjente tips for disse forholdene. Legg til flere kilder?» med knapp.

### 6.2 Tipskort og tipsdetalj
**Tipskort (i liste):** disiplinmarkør, temperaturområde stort (f.eks. «−8 til −3 °C»), snøtype-chips, kort sammendrag (1–2 linjer), produktene som små piller i lagrekkefølge, kildebadge med domene, statusbadge hvis ikke godkjent.
**Tipsdetalj:**
- Overskrift: temperaturområde og snøtyper
- Lagvis smøring i rekkefølge (nummerert, rolle-ikon, produkt, metode, notat)
- Kilde: domene, tittel, «Åpne original» (ekstern lenke), dato hentet
- Handlinger: Rediger · Bruk i nytt renn (forhåndsutfyller loggen) · Forkast
- **Vis aldri hele artikkelteksten**, kun sammendrag og lenke.

### 6.3 Legg til kilde (URL) og gjennomgang av utkast
Dette er kjerneflyten for kunnskapsbasen.
1. **Legg til URL:** ett felt, lim inn, «Hent smøretips».
2. **Fremdrift:** trinnvis tilstand (henter side → leser innhold → trekker ut tips). Kan ta noen titalls sekunder, vis tydelig fremdrift og at brukeren kan gå videre.
3. **Gjennomgang:** liste over utkast. Hvert utkast viser uttrukne felt (disiplin, temp, snøtyper, lag/produkter, sammendrag) og **konfidens** («Høy / Middels / Lav sikkerhet»). Felt som er usikre markeres visuelt (f.eks. «Mangler snøtemperatur»).
   - Desktop: side om side, kildeinfo/lenke til venstre, redigerbare felt til høyre.
   - Mobil: kort for kort, med faner «Utkast» og «Kilde».
   - Handlinger per utkast: **Godkjenn · Rediger · Forkast**. Samlehandling: «Godkjenn alle med høy sikkerhet».
4. **Feiltilstander:** siden kunne ikke hentes · siden inneholder ingen smøretips · siden krever innlogging · allerede lagt til (tilby «Oppdater» hvis innholdet er endret).
5. **Kildeliste:** alle kilder med domene, antall godkjente tips, sist oppdatert, status, «Oppdater».

### 6.4 Spør erfaringsdatabasen («Spør»)
Dette er appens «wow»-skjerm, men den må føles pålitelig, ikke magisk.
- Tekstfelt med forslagschips: «Beste glid i dag» · «Siste renn med lignende forhold» · «Hva funket på kunstsnø?»
- **Etter innsending viser svarkortet, i denne rekkefølgen:**
  1. **«Jeg søkte etter:»** filterchips (f.eks. Skøyting · −7 ± 3 °C · Kunstsnø), alle redigerbare med ett trykk.
  2. **Kort svartekst** på norsk (2–4 setninger).
  3. **Rangert liste** over smøreoppskrifter: lagene i rekkefølge, **konfidensmerke** (Solid erfaring / Noe erfaring / Ett renn, tolkes forsiktig), «bygger på N renn», siste dato brukt, og en liten indikator for direkte sammenligninger («raskest i 4 av 5 direkte sammenligninger»).
  4. **Ekspanderbar «Se rennene bak svaret»** med dato, sted, forhold og vurdering per renn, klikkbare.
  5. Eventuelt en egen seksjon «Tips fra nettsider», tydelig merket som kilde, ikke egen erfaring.
- **Oppklaringstilstand:** hvis spørsmålet er uklart (f.eks. «kald» uten tall eller disiplin mangler) vises ett oppklaringsspørsmål med 2–4 trykkvalg.
- **Fallback uten egen erfaring:** «Jeg har ikke data på dette ennå.» + tips fra nettsider + oppfordring til å logge renn.
- **Tomtilstand ved lite data:** «Du har logget 2 renn. Etter 10–15 renn begynner svarene å bli nyttige.» Med fremdriftsindikator.
- Laster-, feil- og tom-tilstand.

### 6.5 Mine ski («Utstyr» → Ski)
- Liste: navn, merke/modell, disiplin-markør, lengde, aktiv/inaktiv, antall renn.
- Filter: disiplin, aktiv/inaktiv.
- **Skidetalj:** egenskaper (merke, modell, lengde, stivhet/pakke for klassisk, belegg, rill/slipt struktur, innkjøpsår, notater) og **historikk**: tidslinje over renn med forhold, valgt smøring og vurdering. Kort statistikk («brukt i 12 renn, oftest på −5 til −10 °C»).
- Ny/rediger-skjema.

### 6.6 Produkter («Utstyr» → Produkter)
- Liste med søk, filter på kategori (glidvoks blokk/flytende/pulver, bunnvoks, rens, hardvoks, klister, bindevoks, rilleverktøy), disiplin og merke.
- Produktkort: merke, navn, kategori-ikon, anbefalt temperaturområde (kan mangle, vis da «Ikke oppgitt», aldri gjett), fluor ja/nei.
- Ny/rediger-skjema.

### 6.7 Nytt renn («Logg» → +)
**Stegvis skjema** (fremdriftsindikator øverst, lagrer underveis som utkast, hurtigfunksjoner øverst):
- Hurtigknapper: **«Kopier fra forrige renn»** · **«Bruk et tips»** (velg fra søk/tips og forhåndsutfyll)
1. **Forhold:** dato (default i dag), sted, renntype (renn/trening), disiplin, lufttemp (stor velger), snøtemp (valgfri), snøopprinnelse, snøtype, fuktighet, løypehardhet, vær (sol/vind), notat. Resten under «Flere detaljer».
2. **Velg ski:** velg ett eller flere par. Mulighet til å merke «testet to par» og hvilket som ble valgt til rennet.
3. **Smøring per ski:** for hvert valgt par, tre seksjoner (Rill · Glid · Feste, kun klassisk). Legg til/fjern/flytt lag, velg produkt (søkbar liste), metode, evt. strykertemperatur. Vis en kompakt oppsummering av lagene.
4. **Vurdering (kan gjøres senere):** segmentvalg for glid mot feltet, rangering, feste (klassisk), stjerner, hvor sikker vurderingen er, notat.
- Etter lagring: bekreftelse, og **påminnelse om å fylle ut vurdering etter rennet** (vis som tilstand «Mangler vurdering» på renn i listen).
- Mobil: hvert steg er én skjerm, store kontroller, «Neste» alltid synlig nederst. Må kunne fylles ut raskt med én hånd.

### 6.8 Rennliste og rennedetalj («Logg»)
- Liste: dato, sted, disiplin-markør, lufttemp stort, snøtype-ikon, valgt smøring (kort), vurderingsindikator, status («Mangler vurdering»).
- Filter: disiplin, snøtype, temperaturområde, ski, tidsperiode. Søk.
- **Rennedetalj:** forholdspanel, ski som ble brukt (valgt markert), smøring lag for lag per ski, vurderinger, notater. Handlinger: Rediger · Kopier til nytt renn.

### 6.9 Innstillinger / profil
Profil, språk (nb først), tema (lys/mørk/system), enheter (°C), kontoadministrasjon, datautskrift/eksport, personvern.

### 6.10 Onboarding (første gang)
Kort, 3 steg: velg disiplin(er) → legg til første ski (kan hoppes over) → legg til første kilde eller logg første renn. Forklar at appen blir mer nyttig jo mer man logger.

---

## 7. Komponentbibliotek (navngi komponentene slik at de kan speiles 1:1 i React)

**Inputs**
- `TemperatureInput` (stor display, slider med minusgrader, +/− stepper, direkte tallinntasting; variant for enkelt tall og for område)
- `DisciplineToggle` (Klassisk / Skøyting, med fargeaksent)
- `SnowTypeChips` (flervalg og enkeltvalg, ikon + tekst)
- `SegmentedControl` (generell: snøopprinnelse, glid mot felt, feste osv.)
- `RatingStars` (1–5) og `RankPicker`
- `DateField`, `TextField`, `SelectField`, `SearchField`, `Switch`, `Checkbox`
- `ProductPicker` (søkbar liste i bunnark)

**Visning**
- `TipCard` (med `SourceBadge`)
- `ExperienceResultCard` (smøreoppskrift med `ConfidenceBadge`, antall renn, direkte sammenligning)
- `WaxLayerList` / `WaxLayerItem` (nummerert lag, rolle-ikon, produkt, metode; redigerbar variant og skrivebeskyttet variant)
- `ProductCard`, `SkiCard`, `RaceCard`
- `ConditionsSummary` (kompakt rad med temp, snøtype, opprinnelse, sol/vind)
- `FilterChips` (aktive filtre, redigerbare)
- `StatusBadge` (utkast/godkjent/forkastet), `ConfidenceBadge` (Solid/Noe/Ett renn), `SourceBadge` (nettside/min erfaring)
- `Timeline` (skihistorikk)
- `EmptyState`, `ErrorState`, `LoadingState` (skeleton + fremdriftstrinn)
- `StepProgress` (stegvis skjema)

**Navigasjon og overlays**
- `BottomNav` (mobil), `SideNav` (desktop), `TopBar`
- `BottomSheet` (mobil) / `Dialog` (desktop), `Toast`, `ConfirmDialog`
- `Tabs`, `Accordion` («Se rennene bak svaret»)

**Handlinger**
- `Button` (primær, sekundær, tertiær, destruktiv; størrelser inkl. stor trykkflate), `IconButton`, `FloatingAddButton`

Hver komponent: alle tilstander (standard, hover, fokus, trykket, deaktivert, feil), lys og mørk modus, mobil og desktop der det er forskjell.

---

## 8. Tokens som skal leveres

- **Farger:** primær, nøytrale (10 trinn), disiplin (klassisk, skøyting), kilde (nettside, erfaring), semantiske (suksess, advarsel, feil, info), konfidens (3 nivåer), bakgrunns- og overflatefarger, tekstfarger. Lys og mørk modus.
- **Typografi:** familie, størrelser, vekter, linjehøyder, tabulære tall. Egen «display temperatur»-stil.
- **Spacing:** 4 px-basert skala.
- **Radius, kantlinjer, skygger, z-nivåer.**
- **Brytepunkter:** 360 / 390 (mobil), 768 (nettbrett), 1024 og 1440 (desktop).
- **Trykkflater:** min. 48 × 48 px.
- **Bevegelse:** varigheter og easing.
- **Kontrast:** dokumenter kontrastforhold for tekst/bakgrunn-par.

---

## 9. Eksempeldata for prototypene (fiktiv, bruk i alle skjermer)

> Merk: Alle produktnavn, temperaturer og anbefalinger under er **illustrerende eksempeldata** for å få prototypen til å se ekte ut. De er ikke faktiske smøreanbefalinger.

**Ski**
| Navn | Disiplin | Lengde | Rill |
|---|---|---|---|
| Skøyteski #1 (renn) | Skøyting | 191 cm | Fin lineær |
| Skøyteski #2 (trening) | Skøyting | 191 cm | Kryss |
| Klassiske #1 | Klassisk | 201 cm | Standard |
| Klassiske #2 (reserve) | Klassisk | 201 cm | Standard |

**Produkter (eksempel):** «Glidvoks HF-blå» (glid blokk, −10 til −4 °C), «Glidvoks HF-lilla» (glid blokk, −4 til 0 °C), «Fluorpulver kald» (pulver), «Hardvoks grønn» (feste), «Hardvoks blå» (feste), «Klister universal» (klister), «Bindevoks» (binder), «Rilleverktøy lineær» (rill).

**Tips fra nettsider (eksempel)**
1. Skøyting · −8 til −3 °C · Nysnø, Finkornet · «Fluorholdig blokk i to lag, børst, pulver øverst.» · kilde: eksempel-smoring.no · Status: Godkjent
2. Klassisk · −6 til −2 °C · Finkornet · «Hardvoks i tre tynne lag, kork mellom hvert lag.» · kilde: skitips.example · Status: Godkjent
3. Skøyting · 0 til +2 °C · Våt, Veldig våt · «Flytende glid, kraftig rill.» · kilde: eksempel-smoring.no · Status: Utkast (lav sikkerhet, mangler snøtemperatur)

**Renn (eksempel, 6 stk. på kald kunstsnø rundt −7 °C, skøyting)**
Datoer fra 5. des. til 14. feb., steder som «Sjusjøen», «Lillehammer», «Trollhaugen skistadion». To av rennene har «testet to par» med direkte sammenligning. Vurderinger blandet mellom Raskere / Lik / Langsommere.

**Eksempelspørsmål og -svar for «Spør»-skjermen**
> *Spørsmål:* «Hva har fungert best for meg på kald kunstsnø rundt −7 °C?»
> *Filter:* Skøyting · −7 ± 3 °C · Kunstsnø
> *Svar:* «Ut fra 6 renn på kald kunstsnø rundt −7 °C (siste 14. feb.) har kombinasjonen **HF-blå + Fluorpulver kald** gjort det best for glid: raskest i 4 av 5 direkte sammenligninger. **Solid erfaring.** **HF-lilla alene** er brukt i 2 renn og kom midt i feltet, så tolk forsiktig. Du har ikke testet fluorfritt i disse forholdene.»

**Tomtilstander å vise:** ingen ski ennå · ingen kilder ennå · 2 renn logget («Etter 10–15 renn begynner svarene å bli nyttige») · ingen treff i søk.

---

## 10. Tilgjengelighet og bruksforhold

- WCAG AA minimum, helst AAA for temperatur og anbefalinger.
- Fargen alene bærer aldri betydning (disiplin, status, konfidens har alltid tekst/ikon i tillegg).
- Stor tekst støttes (opptil 200 % uten brudd i layout).
- Alle interaktive elementer har synlig fokus og tastaturnavigasjon på desktop.
- Skjermleser-etiketter på ikoner, temperaturvelger og segmentvalg.
- Kritiske handlinger (logg renn, se anbefaling) skal kunne gjøres med én hånd og votter.
- Design for **dårlig dekning:** vis tydelig «lagret lokalt, synkroniseres senere»-tilstand ved renn-logging (offline kommer i fase 2, men tilstanden bør finnes i designsystemet).

---

## 11. Leveranse fra Claude Design

1. **Designsystem:** tokens (seksjon 8) og komponentbibliotek (seksjon 7) med alle tilstander, lys og mørk modus.
2. **Klikkbare prototyper** av skjermene 6.1–6.10 i mobil og desktop, med flyter:
   - *Flyt A:* Finn forhold → se resultater → åpne tips → «Bruk i nytt renn»
   - *Flyt B:* Legg til URL → fremdrift → gjennomgang → godkjenn
   - *Flyt C:* Logg nytt renn (alle 4 steg) → lagre → «Mangler vurdering» → fyll ut vurdering
   - *Flyt D:* Spør «Hva har fungert best …?» → svarkort → ekspander underliggende renn
3. **Tilstandsoversikt:** tom, laster, feil og utfylt for hver hovedskjerm.
4. **Komponentnavn** som i seksjon 7, slik at de kan gjenbrukes direkte i React-implementasjonen.
5. **Kort notat** med antagelser du har gjort og forslag til forbedringer.

## 12. Utenfor omfanget for denne leveransen

Backend, database, API, URL-henting og språkmodell-integrasjon (dette bygges separat)