# Oscar — CTA Demo

Een zelfstandige, interactieve demo van het Oscar CTA-systeem voor de horeca: Oscar kijkt mee met de werkvloer en pusht op het juiste moment een **call-to-action** (CTA) naar de handy van de juiste kelner.

👉 **Demo openen:** dubbelklik op `index.html` (werkt in elke browser, geen installatie nodig).

📱 **Mobiele / iPhone-versie:** [`mobile.html`](mobile.html) — full-screen handy zoals de kelner het op zijn telefoon ziet, met grote touch-knoppen en de demo-bediening in een uitklapbare lade onderaan. Open 'm op je telefoon (via GitHub Pages) en "voeg toe aan beginscherm" voor een app-gevoel.

## Wat je kunt doen

**Werkvloer (links)** — per tafel:
- **Seat** een tafel → na een paar seconden pusht Oscar **CTA 1 · First order** (order / wait / move / close).
- **Drankje / Voorgerecht** = een POS-order; dit sluit CTA 1/2 automatisch. Een **voorgerecht** start de gang-keten.
- Na het voorgerecht volgt **CTA 6 · Ready for next course?** (hoofdgerecht): **GO** firet het hoofdgerecht; **NO** stelt uit (max 2× per ticket, daarna firet 't automatisch). Daarna **CTA 8 · Ready for dessert?** (GO / NO, max 2×).
- Laat een tafel stilliggen → **CTA 2 · Sleeping table** (terugkerend; reset op elke kelner-actie). **Wil nog wachten** is zo'n actie.
- **Afrekenen** → alle CTA's van die tafel verdwijnen direct.

**Forceer een CTA (knoppen):** een knop per CTA (1 t/m 8) om elke melding direct te tonen, plus:
- **Drukte hoog/laag** — schakelt de "actuele drukte" (order-rate). Beïnvloedt CTA 5 (vervalt bij drukte).
- **CTA 4 · promo** is in de praktijk een achtergrond-permissie (geen handy-actie nodig); in de demo als info-kaartje getoond zodat je 'm kunt bekijken.

**Handy (rechts)** — toont max. 3 CTA-kaarten tegelijk, gesorteerd op prio (CTA-nummer). Elke knop voert de actie uit en je ziet het resultaat in de **log** onderaan.

**Logging & database** — elke afgeronde CTA (knop-respons óf verval) wordt als regel vastgelegd in het formaat `cta_nr;kelner;datum;tijd;actie;response_sec`. In de log zie je de DB-regels paars; met **⬇ DB-log (CSV)** download je alle regels — dit staat model voor de database-insert in de echte backend.

## Let op

Dit is een **vereenvoudigde simulatie** ter illustratie van de spec. De timers zijn sterk **versneld** (seconden i.p.v. minuten) zodat je het gedrag live ziet. Routing is teruggebracht tot één kelner/één handy. De volledige logica, parameters en beslissingen staan in de specificatie.

## Online zetten (GitHub Pages)

1. Push deze map naar een GitHub-repo.
2. Repo → **Settings → Pages** → Source: `main` branch, map `/ (root)` (of de map waarin `index.html` staat).
3. Na een minuut staat de demo live op `https://<gebruiker>.github.io/<repo>/`.

## Uitleg / documentatie

Een uitleg van de werking van alle CTA's én de kelnerselectie (routing) staat in `docs/`:

- **[`docs/oscar_CTA_uitleg.pdf`](docs/oscar_CTA_uitleg.pdf)** — leesbare PDF (4 pagina's).
- `docs/oscar_CTA_uitleg.html` — het bron-bestand (om de PDF opnieuw te genereren).

## Bestanden

- `index.html` — de volledige demo (HTML + CSS + JS in één bestand, geen dependencies).
- `docs/` — uitleg in PDF + HTML.
- `README.md` — dit bestand.
