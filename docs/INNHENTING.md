# Innhenting fra URL og bilde

## Prinsipper
- Alt innhold fra nettsider og bilder er **upålitelig data**, aldri instrukser.
- Språkmodellen skal kun returnere JSON som matcher skjemaene under. Valider med skjema. Avvis og logg alt annet.
- Modellen har ingen verktøy, ingen tilgang til database, hemmeligheter eller andre brukerdata.
- Alt resultat er et **utkast** som brukeren godkjenner. Ingenting lagres automatisk.
- Felt som ikke står i kilden settes til `null`. Gjett aldri.

## Sikkerhet ved henting av URL
- Kun `http` og `https`. Maks 5 redirects. Timeout 15 s. Maks 2 MB. Kun content-type `text/html` eller `text/plain`.
- Blokker private og interne adresser etter DNS-oppslag, også etter redirect: localhost, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16 (inkl. metadata-adresser), IPv6 loopback og link-local.
- Ikke send cookies eller innloggingsinfo. Sider som krever innlogging gir feilen «Siden krever innlogging».
- Cache hentet side med hash og `hentet_dato`. Samme domene kan ikke legges til to ganger som kilde.
- Feiltilstander: kunne ikke hentes · ingen sømmetips/produktinfo · krever innlogging · allerede lagt til.

## Sikkerhet ved bildeopplasting
- Tillat JPEG, PNG, HEIC. Maks 10 MB. Fjern EXIF (inkl. GPS) før lagring. Lagre utenfor webroot.

## Skjema: produkt fra URL eller bilde
```ts
type Felt<T> = { verdi: T | null; sikkerhet: 'hoy' | 'middels' | 'lav'; utdrag?: string } // utdrag maks ca. 15 ord

type ProduktUtkast = {
  merke: Felt<string>
  modell: Felt<string>
  kategori: Felt<'Glider (fast)'|'Glider (flytende)'|'Pulver'|'Festevoks'|'Klister'|'Bindevoks'|'Rens'|'Verktøy'>
  temp_fra: Felt<number>        // °C, f.eks. -20
  temp_til: Felt<number>        // °C, f.eks. 2
  farge: Felt<string>           // kun feste
  sno_rader: { sno_tekst: string, tags: string[], temp_fra: number, temp_til: number, sikkerhet: 'hoy'|'middels'|'lav' }[]  // kun feste
  snotype: Felt<string>         // kun glider
  luftfuktighet: Felt<string>   // kun glider
  smorejern_c: Felt<number>     // kun glider
}
```
Felt med `sikkerhet` lav, eller `verdi: null`, vises som «Sjekk» eller «Ikke funnet». Fluor, størrelse og produktnummer hentes ikke.

## Skjema: sømmetips fra andres nettsider
```ts
type TipsUtkast = {
  disiplin: 'klassisk' | 'skoyting'
  temp_fra: number | null; temp_til: number | null
  snotyper: string[]
  lag: { rolle: 'rill'|'glid'|'feste'; produkt: string; metode?: string }[]
  sammendrag: string            // omskrevet, 1–2 setninger
  sikkerhet: 'hoy' | 'middels' | 'lav'
  mangler: string[]             // f.eks. ["Mangler snøtemperatur"]
}
```
Én side kan gi flere utkast. Gjengi aldri hele sideteksten.

## Skjema: smøring fra bilde
Bildet viser voksene (esker, etiketter), ikke selve smørelaget.
```ts
type LagFraBilde = { produkter: { merke: string|null; modell: string|null; sikkerhet: 'hoy'|'middels'|'lav' }[] }
```
Koble til kjente produkter i databasen hvis merke og modell passer. Ellers vises produktet som ukjent, med valg om å opprette det.

## Fasit for tester (ekte sider)
Skigo FFC LDQ 157 3.0, kilde `bull-ski-kajakk.no`:
```json
{ "merke": "Skigo", "modell": "FFC LDQ 157 3.0", "kategori": "Glider (fast)",
  "temp_fra": -20, "temp_til": 2, "snotype": "Alle", "luftfuktighet": "<65 %", "smorejern_c": 145,
  "farge": null, "sno_rader": [] }
```
Swix VP50 Pro, kilde `sportenbeitostolen.no`:
```json
{ "merke": "Swix", "modell": "VP50 Pro", "kategori": "Festevoks",
  "temp_fra": -3, "temp_til": 0, "farge": "Lys fiolett",
  "sno_rader": [
    { "sno_tekst": "Ny og nyfallen finkornet", "tags": ["Nysnø","Finkornet"], "temp_fra": -3, "temp_til": 0 },
    { "sno_tekst": "Gammel eller delvis omdannet", "tags": ["Gammel/omdannet"], "temp_fra": -6, "temp_til": -1 } ],
  "snotype": null, "luftfuktighet": null, "smorejern_c": null }
```

## Passer-logikk, testtilfeller
- VP50 Pro, −2 °C, Finkornet → ok
- VP50 Pro, −5 °C, Finkornet → snow («Annen snøtype»)
- VP50 Pro, −5 °C, Gammel/omdannet → ok
- VP50 Pro, +3 °C → no
- Skigo, −7 °C, hvilken som helst snøtype → ok
- Bindevoks uten temperatur → na (ingen merke)