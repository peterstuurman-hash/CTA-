# Oscar — CTA-specificatie

| | |
|---|---|
| **Document** | `oscar_cta_specs.md` — SPEC |
| **Project** | Oscar — CTA's op de handy |
| **Versie** | 2.0 (reconstructie) |
| **Datum** | 12-09-2026 |
| **Status** | Concept — §1.1 treedt in werking zodra dit "Definitief" is |
| **Bron van waarheid** | Dit document, zodra de status "Definitief" is — zie §1.1 |
| **Verwijzen als** | SPEC §x.y (in commits/branches: "implementeert SPEC §5.6") |

---

## §1 Grondslag

### §1.1 Bron van waarheid

**Dit document is leidend.** Bij tegenspraak wint deze spec; de andere documenten
zijn eruit afgeleid.

| Volgorde | Bron | Rol |
|---|---|---|
| 1 | `oscar_cta_specs.md` — dit document | **Leidend.** Wat hier staat wordt gebouwd. |
| 2 | `docs/oscar_CTA_uitleg.html` (juni 2026) | Leesbare samenvatting voor wie niet bouwt. Afgeleid. |
| 3 | `index.html` (juli 2026) | Illustratie van het gedrag, werkend. Afgeleid. |
| 4 | `Oscar_CTAs.pdf` (maart 2026) | Historie. Zie §8.1. |

Wijkt een afgeleid document af, dan is dat een fout in dát document en niet hier.
Wie het gedrag wil wijzigen, wijzigt eerst deze spec en daarna de rest.

**Zolang de status in de kop "Concept" is**, geldt nog de volgorde waaruit dit
document is gereconstrueerd: de juni-uitleg voor gedrag, `index.html` voor
logica-details, de maart-PDF alleen voor parameterwaarden. De maart-PDF is op zes
van de tien punten achterhaald (§8.1) en is hier uitsluitend als parameterbron
gebruikt.

### §1.2 Wat de demo níét is

De timerwaarden in `index.html` zijn **demo-versneld** — seconden waar productie
minuten telt (`CTA1_DELAY: 4` tegenover 120 seconden in productie). Neem uit de
demo de structuur en de logica over, nooit de getallen. De productiewaarden staan
in §7 en alleen daar.

De demo kent verder één kelner, één handy en vier tafels. Routing (§3) is er niet
in geïmplementeerd.

### §1.3 Doodlopende verwijzingen

- `docs/oscar_CTA_uitleg.html` verwijst in de voettekst naar `oscar_cta_specs.md`.
  Dat is dit bestand; tot 12-09-2026 bestond het niet.
- `Oscar_CTAs.pdf` zit niet in de repo. Hij is aangeleverd als los bestand.
- `docs/oscar_CTA_uitleg.html` **loopt achter** op §2.3 (prio-volgorde met een
  CTA 4 erin), §2.14 (promo als CTA genummerd) en §6.3 (kent alleen `disabled`).
  Er staat sinds 12-09-2026 een waarschuwing bovenaan dat document. De inhoud
  wordt bijgewerkt zodra de punten uit §9.1 beantwoord zijn; `oscar_CTA_uitleg.pdf`
  moet dan opnieuw gegenereerd worden uit de HTML.

### §1.4 Markeringen

- **TODO (code)** — niet beantwoord. Er wordt niet op gebouwd tot het antwoord er
  is. De code verwijst naar de openstaande vraag in §9.
- **AANNAME** — door ons ingevuld om door te kunnen. Vervalt zodra het echte
  antwoord er is. Een AANNAME is geen besluit.

---

## §2 Systeemregels

### §2.1 De handy is een dom scherm

De handy toont uitsluitend wat Oscar erop pusht. Alle logica, alle drempels en alle
aan/uit-schakelaars zitten in de backend, per locatie instelbaar. Er zit geen
beslislogica in de handy-app.

### §2.2 Eén melding, één handy

Elke CTA gaat naar precies één kelner (§3). Liever geen melding dan de verkeerde:
een gemiste melding is geen verslechtering ten opzichte van de nullijn, een
verkeerd geroute melding wel.

### §2.3 Maximaal drie kaarten, prio bepaalt welke

Maximaal drie CTA-kaarten tegelijk zichtbaar per handy. Zijn er meer, dan staat de
rest in de wachtrij. De zichtbare drie worden gekozen op prio, bij gelijke prio op
volgorde van binnenkomst.

Prio-volgorde: **1, 2, 9, 10, 3, 5, 6, 7, 8**

CTA 9 en 10 staan vlak achter 1 en 2 omdat daar een gast op staat te wachten.

Nummer 4 ontbreekt: dat was de promo-permissie, die geen kaart is en dus geen prio
heeft. Zie §2.14. Het nummer blijft leeg zodat 5 t/m 10 niet hoeven te schuiven.

### §2.4 Afhandelen is verplicht

Een kaart verdwijnt alleen door een kelner-actie of door verval. Pas dan schuift de
volgende CTA uit de wachtrij door. Er is geen wegklikken zonder registratie.

### §2.5 Ticket afgerekend = alle CTA's van die tafel direct weg

Zonder vertraging, zonder uitzondering.

### §2.6 Een tafel sluiten is altijd een kelnerbeslissing

Geen enkele CTA en geen enkel systeemproces sluit zelf een tafel.

### §2.7 Block by busy

Zolang de kelner net iets deed — een POS-aanslag, een betaling, een
"wil nog wachten" — wacht Oscar met pushen. CTA's komen op een rustig moment.

Per CTA aan of uit te zetten in de backend. CTA 3 staat uit, want die wordt juist
dóór een kelner-actie getriggerd. Defaults per CTA: §7.4.

Dit staat los van de venue-brede drukte (§4). Een CTA die hierop wordt
tegengehouden wordt gelogd (§6.3).

Parameter: `kelner_idle` (§7.1).

### §2.8 Tempo-limiet

Per handy maximaal `cta_max_per_window` getoonde CTA's binnen `cta_window`. Boven
dat aantal wordt niet meer gepusht. De limiet hangt aan het CTA-niveau (§2.11).

Dit is de derde rem, naast §2.3 en §2.7, en hij werkt op een andere as: hij begrenst
het totaal per dienst, ook als de kelner steeds net rustig was. Een CTA die hierop
sneuvelt wordt gelogd (§6.3).

### §2.9 Vibratie

Per CTA staat in de backend of de handy trilt bij een push. Dit is niet zichtbaar
op de kaart en de kelner kan er niets mee — het is een instelling van het huis.
Defaults per CTA: §7.4.

### §2.10 Status per CTA per locatie

| Status | Gedrag |
|---|---|
| `enabled` | Normaal: pushen, tonen, loggen |
| `disabled` | **Niet** tonen, wél loggen bij elke keer dat hij zou afgaan (shadow-logging, §6.3) |
| `deleted` | Niets: niet tonen, niet loggen |

`disabled` bestaat om te kunnen meten of een CTA de moeite waard is vóór hij op de
vloer komt, en om na invoering te zien of kelners beter worden — minder zou-fires
betekent dat ze het zelf al doen.

### §2.11 CTA-niveau (adoptie-ramp)

Eén knop per locatie bepaalt hoeveel CTA's aan staan én hoe streng de rem. Start op
niveau 1 zodat kelners het accepteren; schaal op als de logs daar aanleiding toe
geven.

| Niveau | CTA's aan | `kelner_idle` | `cta_max_per_window` |
|---|---|---|---|
| 1 · Introductie | 1, 6, 8, 9, 10 | 60 sec | 1 |
| 2 · Gemiddeld | 1, 2, 3, 6, 8, 9, 10 | 20 sec | 3 |
| 3 · Volledig | alle | TODO (O1) | 6 |

`cta_window` is op elk niveau 600 sec.

Uitgeschakelde CTA's staan op `disabled`, niet op `deleted` — ze blijven
shadow-loggen.

De promo-permissie (§2.14) staat buiten de niveaus: die is geen melding en valt dus
niet onder de adoptie-ramp.

### §2.14 Promo-permissie

Hangt aan het reserveringsticket de tag `promo`, dan mag iedere kelner voor dat
ticket gerechten en drank offreren. De permissie staat automatisch aan zolang de
tag erop zit.

Geen kaart, geen push, geen knoppen, geen rol-rechten en geen blokkade — de
aanbieding is immers al goedgekeurd op de reservering. De kelner merkt er niets
van; hij kan simpelweg offreren.

Dit heette tot 12-09-2026 "CTA 4". Het is geen CTA: er komt niets op een handy, dus
het heeft geen prio (§2.3), geen levensduur en geen instellingen per CTA (§7.4).
Het nummer 4 is leeggelaten in plaats van hergebruikt.

In `index.html` wordt de promo als info-kaartje getoond. Dat is een demo-concessie
om hem te kunnen laten zien, en **geen gewenst productiegedrag**.

### §2.12 Knoptaal

Alle knoppen Engels en over alle CTA's consistent:

| Betekenis | Knoppen |
|---|---|
| Doe het nu | `ORDER` · `GO` · `YES` · `NEW` · `PULL` · `PRINT` |
| Later | `WAIT` |
| Weiger | `NO` |

`CLOSE TABLE` staat apart, is rood en vraagt een bevestiging — beschermd tegen
mistaps. Elke tik geeft directe feedback op het scherm.

Terugmeldingen noemen **geen tijden** ("extra wait", niet "15 minuten extra"). Dat
voorkomt discussie op de vloer over wat de handy beloofd zou hebben.

### §2.13 CTA-hygiëne

Per CTA meet Oscar via de log of het gewenste effect volgt. Een CTA die structureel
genegeerd wordt gaat eruit of wordt vervangen. Liever een paar effectieve CTA's dan
veel ruis.

---

## §3 Kelnerselectie (routing)

### §3.1 Wijken

Een wijk is een vast bereik tafelnummers, vooraf ingesteld per locatie.
Voorbeeld: wijk "RES Noord" = tafels 1 t/m 19.

### §3.2 Eigenaarschap geldt op wijk-niveau

De eigenaar van een wijk krijgt de CTA's van álle tafels in dat bereik. Niet per
tafel.

### §3.3 Wie is de eigenaar

De eerste kelner die in een wijk aanslaat op de POS wordt eigenaar van de hele
wijk.

Het eigenaarschap verschuift automatisch zodra een andere kelner de meerderheid
(±70%) van de recente tickets in die wijk heeft aangeslagen, binnen een
tijdvenster. Eén losse aanslag — een collega die bijspringt — kapt de wijk dus niet
over.

Parameters: `routing_meerderheid_pct`, `routing_venster` (§7.1) — beide TODO (O2).

**Eigenaarschap vervalt niet vanzelf.** Geen verval op tijd, geen reset bij een
servicewissel, geen reset aan het eind van de dag. Bezit eindigt alleen door
overname hierboven, of doordat CTA 7 de kelner uit het overzicht haalt (§3.5).

Aanvaard gevolg: bij het begin van een nieuwe service is de eigenaar van de vorige
service nog steeds eigenaar. De eerste meldingen kunnen naar iemand gaan die niet
werkt, tot een collega genoeg tickets heeft aangeslagen of tot CTA 7 vuurt. CTA 7
is daarmee de **enige** schoonmaak van het kelneroverzicht, en die vuurt pas na
inactiviteit. Zet `cta7_inactief_drempel` (O7) daar naar: hij bepaalt hoe lang een
wijk verkeerd kan staan.

### §3.4 Geen eigenaar = CTA vervalt

Heeft niemand in de wijk aangeslagen, dan vervalt een CTA voor die wijk. Bewust
geaccepteerd, volgens §2.2. Geen seeding, geen fallback naar een willekeurige
kelner. Het verval wordt gelogd als `geen_wijk` (§6.3).

### §3.5 Het overzicht schoonhouden

CTA 7 (§5.7) haalt kelners die weg of op pauze zijn uit het kelneroverzicht, zodat
Oscar niet blijft routeren naar iemand die er niet is.

Antwoordt de kelner `NO` of `BREAK`, dan **komt de wijk vrij** — hij heeft dan geen
eigenaar. CTA's voor die wijk vervallen en worden gelogd als `geen_wijk` (§6.3),
tot een kelner erin aanslaat; die wordt eigenaar volgens §3.3.

Het eigenaarschap gaat dus **niet** automatisch naar een collega, ook niet naar wie
er het laatst heeft aangeslagen. Dat kan iemand zijn die één keer bijsprong, en dat
is precies wat de meerderheidsregel wil voorkomen.

### §3.6 Randgeval — eerste tafel van de wijk

CTA 1 kan vuren vóór er ook maar iets is aangeslagen in een verse wijk. Er is dan
nog geen eigenaar en die ene CTA vervalt. Bewust geaccepteerd.

---

## §4 Drukte

> **Fase 2 — niet bouwen in de eerste oplevering.** De enige functionele afnemer is
> CTA 5 (§5.5), en die staat pas op niveau 3 aan (§2.11). De druktemeter op het
> LG-dashboard toont alleen. Zie §8.2, 12-09-2026.

"Druk" is de **actuele werkdruk nu**: de order-rate (POS-orders per tijdseenheid
over een recent venster) ligt boven een drempel.

Gebruikt door:

- CTA 5 (§5.5) — geen gift tijdens drukte
- de druktemeter op het LG-dashboard

De meter loopt vanzelf terug als de zaak leegloopt, zodat een nalopende tafel op
een uitgelopen avond "druk" niet kunstmatig hoog houdt.

CTA 3 gebruikt géén drukte, maar puur "seater actief" (§5.3).

Parameters: `drukte_venster`, `drukte_drempel` (§7.1) — beide TODO (O3).

---

## §5 De CTA's

### §5.1 CTA 1 — First order

**Doel** De eerste bestelling binnenhalen.

**Trigger** `cta1_check_delay` na seaten zonder POS-order.

**Kaart** `Tafel [nr] ([naam]) — first order` · naam weglaten als de reservering er
geen heeft.

| Knop | Actie |
|---|---|
| `ORDER` | Open WaiterPro. Bij POS-order sluit de CTA automatisch. |
| `WAIT` | Uitstellen tot `cta1_postpone_time`. |
| `MOVE` | Brontafel selecteren, bon + seat overnemen. |
| `CLOSE TABLE` | Rood, met bevestiging. Tafel sluiten, alle CTA's van de tafel weg. |

**Terugkerend** Zolang er niets besteld is komt de kaart terug, tot de eerste order
binnen is of `cta1_max_levensduur` verloopt. Daarna neemt CTA 2 het over.

**Sluit automatisch** bij een POS-order via welke weg dan ook. Orders uit de
seating-app tellen niet mee.

### §5.2 CTA 2 — Sleeping table

**Doel** Een tafel die stilligt oppikken.

**Trigger** Geen kelner-actie op de tafel gedurende `cta2_sleep_threshold`.

**Kaart** `Tafel [nr] ([naam]) — checken`

| Knop | Actie |
|---|---|
| `ORDER` | Open WaiterPro. Sleep-timer reset. |
| `WAIT` | "Wil nog wachten" registreren. Timer reset. |
| `MOVE` | Bon + seat overnemen. |
| `CALL LG` | Niemand aanwezig: push naar LG. Puur informatief, **de tafel blijft open** (§2.6). |

**De timer meet vanaf de laatste kelner-actie**, niet vanaf seaten. Elke
POS-aanslag én elke "wil nog wachten" reset hem. Typisch vuurt deze CTA dus ná het
eten: tijd voor dessert, koffie, de rekening.

**Terugkerend**, geen eigen levensduur. Loopt niet zolang CTA 1 voor dezelfde tafel
open staat.

### §5.3 CTA 3 — Seater actief (why not seated?)

**Doel** Tafels vangen die buiten de seater om geopend worden.

**Trigger** Een kelner opent een niet-geseate tafel terwijl de seater actief is.

**Seater actief** = `cta3_seater_detect_acties` plaatsingen binnen
`cta3_seater_detect_window`.

**Kaart** `Tafel [nr] — Not seated. Previous table?`

| Knop | Actie |
|---|---|
| `NEW` | Nieuwe gasten. Tafel openen. Type later afleiden uit de orders. |
| `PULL` | Gasten komen van een andere tafel. Sub-vraag "Pull table: [oude tafel] → deze tafel". Oscar haalt bon + seat over, de oude tafel komt vrij. |

**Blokkerend** De tafel gaat pas open ná de keuze. Eén kaart, geen herhaling.

**Block by busy staat uit** voor deze CTA (§2.7) — hij wordt juist dóór een
kelner-actie getriggerd.

**LG-dashboard metric** Percentage tafels dat bruut geopend wordt (niet geseat
terwijl de seater actief is), per locatie.

### §5.4 — vervallen

Wat hier stond ("CTA 4 — Promo") is geen CTA maar een achtergrond-permissie en is
op 12-09-2026 verhuisd naar **§2.14**.

Dit nummer blijft leeg staan. Verwijzingen uit commits en oudere documenten naar
"CTA 4" komen hier uit en worden doorverwezen, in plaats van bij een andere CTA die
het nummer had overgenomen.

### §5.5 CTA 5 — Loyalty, offer a coffee

> **Fase 2 — niet bouwen in de eerste oplevering.** Staat pas op niveau 3 aan
> (§2.11) en hangt aan §4, dat ook fase 2 is. O3, O5 en O6 hoeven daarom nu niet
> beantwoord te worden.

**Doel** Een gulle tafel belonen met een kleine attentie: een gratis koffie.

**Trigger** Niet druk (§4) **én** besteding per persoon ≥ `cta5_bedrag_pp`.

**Kaart** `Tafel [nr] ([naam]) — offer a coffee` (paarse kaart)

| Knop | Actie |
|---|---|
| `ORDER` | Open WaiterPro. Gift registreren. Cooldown starten. |
| `WAIT` | Uitstellen tot `cta5_postpone_time`. Vervalt alsnog zodra het druk wordt. |
| `NO` | De kelner vindt het niet nodig. CTA 5 vervalt voor dit ticket. |

**Bewust simpel** Eén bedrag per locatie. Geen percentielen, geen rolling averages,
geen tijdvakken, geen vaste evaluatietijd — dat was overbodige complexiteit voor
een gratis koffie (§8.2, 14-06-2026).

**Cooldown** `cta5_cooldown_dagen`, per herkende gast (reservering of Amigo).

### §5.6 CTA 6 — Ready for next course (hoofdgerecht)

**Doel** Het hoofdgerecht op tijd doorzetten.

**Trigger** `cta6_after_starter` ná het voorgerecht, zolang het hoofdgerecht nog
niet gefired is.

**Kaart** `Tafel [nr] ([naam]) — ready for next course?`

| Knop | Actie |
|---|---|
| `GO` | Hoofdgerecht firen ("kan door" naar de keuken). |
| `NO` | Uitstellen, komt terug na `cta6_repush`. |

**Maximaal `cta6_max` kaarten per ticket.** Na de laatste `NO` komt er geen kaart
meer en firet het hoofdgerecht automatisch na `cta6_autofire`, zodat de keuken niet
blijft hangen.

Reageert de kelner helemaal niet, dan blijft de kaart staan tot hij hem afhandelt
(§2.4).

### §5.7 CTA 7 — Actief-check kelner

**Doel** Het kelneroverzicht en daarmee de routing schoonhouden (§3.5).

**Trigger** Een kelner is `cta7_inactief_drempel` inactief in zijn wijk.

**Kaart** `Hoi [kelner], ben jij nu nog steeds actief in wijk [wijk]?`

| Knop | Actie |
|---|---|
| `YES` | Blijft eigenaar van de wijk. |
| `NO` | Uit het kelneroverzicht. Geen routing meer naar hem. |
| `BREAK` | Idem, tijdelijk. |

**Fail-safe** Geen antwoord betekent **niet** droppen. De kelner blijft behouden en
Oscar vraagt het later gewoon opnieuw. Nooit iemand uit de routing halen op een
gemist tikje.

Deze CTA hangt aan een kelner, niet aan een tafel.

### §5.8 CTA 8 — Ready for dessert

**Doel** Het dessert doorzetten.

**Trigger** `cta8_after_main` ná het **firen** van het hoofdgerecht — niet na het
bestellen.

**Kaart** `Tafel [nr] ([naam]) — ready for dessert?`

| Knop | Actie |
|---|---|
| `GO` | Dessert firen. |
| `NO` | Komt terug na `cta8_repush`, maximaal `cta8_max` keer per ticket. |

Zelfde principe als CTA 6, met één verschil: **na de laatste `NO` firet er niets
automatisch.** De kaart verdwijnt en het blijft aan de kelner.

### §5.9 CTA 9 — Gast wil bestellen

**Doel** Een bestelverzoek van de gast bij de kelner krijgen.

**Trigger** Een runner — geen kelner — tikt op het externe iPad-scherm de tafel aan
plus "bestellen". De gast heeft het aan de runner gevraagd. Oscar pusht naar de
eigenaar van de wijk (§3).

**Kaart** `Tafel [nr] ([naam]) — wil bestellen`

| Knop | Actie |
|---|---|
| `ORDER` | Open WaiterPro en neem de bestelling op. Status "opgepakt" terug naar de runner-iPad. |
| `NO` | Wegklikken. Status "afgewezen" terug naar de runner-iPad. |

**De statusterugkoppeling naar de iPad is verplicht.** Zonder die lus krijg je
dubbele kaarten en een gast die blijft wachten.

**Geen levensduur.** CTA 9 en 10 vervallen niet. De kaart blijft staan tot de
kelner hem afhandelt (§2.4) en de runner-iPad blijft tot dat moment op "gemeld"
staan. Bewust: ze staan vooraan in de prio (§2.3) en vallen daardoor op.

Aanvaard gevolg: reageert de kelner niet, dan is er geen tweede signaal. Geen
verval, geen escalatie naar de LG, geen terugkoppeling "niet opgepakt". Dit geldt
voor beide CTA's van de runner-lus.

### §5.10 CTA 10 — Gast wil betalen

**Doel** Een betaalverzoek bij de kelner krijgen.

**Trigger** Als CTA 9, maar de runner kiest "betalen".

**Kaart** `Tafel [nr] ([naam]) — wil betalen`

| Knop | Actie |
|---|---|
| `PRINT` | Afrekenen / de bon afdrukken. Status "klaar" terug naar de runner-iPad. |
| `NO` | Wegklikken. Status "afgewezen" terug naar de runner-iPad. |

---

## §6 Logging en database

### §6.1 Twee lagen

| Laag | Inhoud | Doel |
|---|---|---|
| Live log (backend) | Rollend, laatste ~500 regels | Snelle monitoring |
| Database (persistent) | Elke regel apart ge-insert, volledige historie | LG-dashboard, analyses |

### §6.2 Recordformaat

```
cta_nr;datum;tijd;kelner;tafelnr;status;actie;response_sec
1;2026-06-12;19:42:13;Peter;14;enabled;ORDER;12
```

`response_sec` is de tijd tussen push en kelner-actie. Bij verval en bij
onderdrukking blijft hij leeg.

Vastgelegd wordt elke **afgeronde** CTA — een kelner-respons óf een verval — en
elke CTA die wél zou afgaan maar de handy niet haalt (§6.3). Een CTA die nog open
staat, staat nog niet in de database.

De kolom `kelner` blijft leeg bij `geen_wijk` (§6.3): er was dan per definitie geen
kelner om naar te routeren.

Analyses waar dit voor bedoeld is: response-tijden, CTA-volume per kelner en per
tijdvak, hoe vaak CTA's vervallen, en hoeveel de remmen tegenhouden.

**Het formaat blijft ongewijzigd — met deze beperkingen.** Er zit geen locatie,
geen wijk en geen ticket in het record:

- **Locatie** wordt afgeleid uit de backend die de regel schreef, niet uit de regel
  zelf. Een vergelijking over locaties heen vraagt dus om aggregatie op
  backend-niveau; de metric uit §5.3 is niet uit deze tabel alleen te maken.
- **Wijk** ontbreekt, dus routing is niet na te rekenen: hoe vaak een wijk leeg
  stond of het eigenaarschap verschoof (§3.3) is niet uit de log te halen.
- **Ticket** ontbreekt, dus CTA's zijn niet aan één tafelbezoek te koppelen.
  Meerdere bezoeken aan dezelfde tafel op één avond lopen in de data door elkaar.

Beloof geen dashboard dat hier niet uit te halen is. Na de eerste productie-inserts
is het formaat niet meer vrij te wijzigen.

### §6.3 Onderdrukte meldingen

Een CTA die zou afgaan maar de handy niet haalt, wordt toch vastgelegd: met een
lege `actie`, een lege `response_sec`, en in de `status`-kolom de **reden**.

| `status` | Betekenis | Zie |
|---|---|---|
| `enabled` | Getoond, en afgehandeld of vervallen | — |
| `disabled` | De CTA staat uit voor deze locatie (shadow) | §2.10 |
| `busy` | De kelner deed net iets | §2.7 |
| `tempo` | De tempo-limiet van het venster was vol | §2.8 |
| `geen_wijk` | Er was geen eigenaar voor de wijk | §3.4 |

`deleted` logt niets — dat is het enige verschil met `disabled`.

Zonder deze regels is niet te zien hoeveel meldingen de remmen tegenhouden, en dus
ook niet of niveau 1 te streng staat om naar niveau 2 te gaan (§2.11). Dat maakt
opschalen een gok in plaats van een beslissing.

---

## §7 Parameters

Elk getal in de bouw komt hiervandaan. Staat een getal alleen in §5 en niet hier,
dan is dat een fout in dit document.

### §7.1 Systeembreed

| Parameter | Default | Herkomst | Wat |
|---|---|---|---|
| `max_kaarten_zichtbaar` | 3 | uitleg | Kaarten tegelijk op een handy (§2.3). **Vast** — niet per locatie instelbaar |
| `log_live_regels` | 500 | uitleg | Lengte van het rollende live log (§6.1) |
| `kelner_idle` | 60 / 20 / TODO (O1) | demo, per niveau | Geen CTA binnen X sec na de laatste kelner-actie (§2.7) |
| `cta_max_per_window` | 1 / 3 / 6 | demo, per niveau | Tempo-limiet per handy (§2.8) |
| `cta_window` | 600 sec | demo | Venster voor de tempo-limiet |
| `routing_meerderheid_pct` | TODO (O2) | uitleg noemt "±70%" | Drempel voor verschuiving eigenaarschap (§3.3) |
| `routing_venster` | TODO (O2) | — | Tijdvenster waarover de tickets geteld worden |
| `drukte_venster` | TODO (O3) | — | Venster waarover de order-rate wordt gemeten (§4) |
| `drukte_drempel` | TODO (O3) | — | Order-rate waarboven het "druk" is |

### §7.2 Per CTA

| Parameter | Default | Herkomst | Wat |
|---|---|---|---|
| `cta1_check_delay` | 120 sec | maart 2026 | Timer na seaten voor de check |
| `cta1_postpone_time` | 300 sec | maart 2026 | Wachttijd bij `WAIT` |
| `cta1_max_levensduur` | 900 sec | maart 2026 | CTA vervalt na 15 min |
| `cta2_sleep_threshold` | 1800 sec | maart 2026 | Tijd zonder kelner-actie voor trigger |
| `cta3_seater_detect_acties` | 2 | maart 2026 | Min. plaatsingen om de seater actief te noemen — **let op (O4)** |
| `cta3_seater_detect_window` | 300 sec | maart 2026 | Detectievenster |
| `cta5_bedrag_pp` | TODO (O5) | — | Besteding per persoon vanaf welke de koffie mag |
| `cta5_postpone_time` | TODO (O6) | — | Wachttijd bij `WAIT` |
| `cta5_cooldown_dagen` | 30 | maart 2026 | Min. dagen tussen gifts per herkende gast |
| `cta6_after_starter` | 1200 sec | uitleg ("default 20 min") | Na het voorgerecht → kaart |
| `cta6_repush` | 300 sec | demo (backend-waarde) | Terugkomen na `NO` |
| `cta6_autofire` | 300 sec | uitleg ("na 5 min") | Automatisch firen na de laatste `NO` |
| `cta6_max` | 2 | uitleg + demo | Max. kaarten per ticket |
| `cta7_inactief_drempel` | TODO (O7) | — | Inactiviteit voor de actief-check |
| `cta8_after_main` | 1200 sec | uitleg ("default 20 min") | Na het firen van het hoofdgerecht → kaart |
| `cta8_repush` | 300 sec | demo (backend-waarde) | Terugkomen na `NO` |
| `cta8_max` | 2 | uitleg + demo | Max. kaarten per ticket |

CTA 9 en 10 hebben geen parameters — zie §5.9. De promo-permissie (§2.14) ook niet.

### §7.3 Vervallen parameters

Deze stonden in de maart-PDF en gelden niet meer. Ze staan hier zodat niemand ze
per ongeluk terugbouwt.

| Parameter | Waarom vervallen |
|---|---|
| `cta2_postpone_time` | `WAIT` reset nu dezelfde sleep-timer; een aparte wachttijd bestaat niet meer |
| `cta2_max_levensduur` | CTA 2 is terugkerend zonder eigen levensduur |
| `cta3_piek_lunch_start` / `_eind` | Piekuren geschrapt: CTA 3 kijkt alleen nog naar "seater actief" |
| `cta3_piek_diner_start` / `_eind` | idem |
| `cta3_forecast_lunch_min` | Forecast geschrapt (§8.2, 14-06-2026) |
| `cta3_forecast_diner_min` | idem |
| `cta5_eval_moment` | Vaste evaluatietijd geschrapt |
| `cta5_drempel_percentiel` | Percentielen vervangen door één vast bedrag |
| `cta5_tijdvak_bf` / `_lunch` / `_diner` | Benchmarks per tijdvak geschrapt |
| `cta6_fire_delay` | CTA 6 is geen automatische fire meer maar een `GO`/`NO`-kaart |
| `cta6_fire_user` | idem |

### §7.4 Instellingen per CTA

Naast de tijden in §7.2 staan per CTA per locatie drie schakelaars. Dit zijn de
defaults; een locatie kan ervan afwijken.

| CTA | `status` (§2.10) | `block_by_busy` (§2.7) | `vibratie` (§2.9) |
|---|---|---|---|
| 1 · First order | enabled | aan | aan |
| 2 · Sleeping table | enabled | aan | aan |
| 3 · Seater actief | enabled | **uit** | aan |
| 5 · Offer a coffee | enabled | aan | uit |
| 6 · Ready for main | enabled | aan | uit |
| 7 · Actief-check | enabled | aan | uit |
| 8 · Ready for dessert | enabled | aan | uit |
| 9 · Gast wil bestellen | enabled | aan | aan |
| 10 · Gast wil betalen | enabled | aan | aan |

De `status`-kolom wordt overschreven zodra er een CTA-niveau is ingesteld (§2.11).
De promo-permissie (§2.14) staat hier niet in: die kent geen van deze drie
schakelaars.

Herkomst: de demo. TODO (O8) — het vibratiepatroon (alleen 1, 2, 3, 9 en 10) is
nergens apart besloten; bevestigen of dit de gewenste productiedefaults zijn.

---

## §8 Beslislog

### §8.1 Wat er tussen maart en juni 2026 veranderd is

| # | Maart 2026 | Nu |
|---|---|---|
| 1 | Eerste drankje, NL-knoppen | Ongewijzigd van opzet; knoppen Engels, `CLOSE TABLE` beschermd |
| 2 | Trigger = geen *order* sinds 30 min | Trigger = geen *kelner-actie*; "wil nog wachten" reset ook |
| 3 | Tafel bij drukte: piekuren + forecast + seater | Alleen "seater actief"; knoppen `NEW`/`PULL` |
| 4 | Aanbieden bij escalatie, rol-rechten bij drukte | Geen CTA meer: achtergrond-permissie op een `promo`-tag (§2.14). Nummer 4 is leeg |
| 5 | Loyalty drankje, percentielen en rolling averages | Loyalty koffie, één vast bedrag per persoon |
| 6 | Auto kan door: systeem firet zelf | `GO`/`NO`-kaart, autofire pas na de laatste `NO` |
| 7–10 | bestonden niet | Actief-check · Ready for dessert · Gast wil bestellen · Gast wil betalen |
| — | geen routing beschreven | Wijken, eigenaarschap, ±70%-verschuiving (§3) |
| — | — | Block by busy, tempo-limiet, vibratie per CTA, CTA-niveau 1–3, shadow-logging |

### §8.2 Beslist

| Datum | Besluit | Waarom |
|---|---|---|
| 12-06-2026 | CTA 3 knoppen worden `NEW` / `PULL` | "Openen" en "verplaatsen" dekten de vraag niet: het gaat om waar de gasten vandaan komen |
| 12-06-2026 | DB-record per afgeronde CTA + CSV-export | Zonder meting geen oordeel over welke CTA's blijven (§2.13) |
| 12-06-2026 | CTA 8 telt vanaf het **fire**-moment, niet vanaf de bestelling | Anders loopt de dessert-timer tijdens het wachten op de keuken |
| 13-06-2026 | CTA 4 wordt promo-achtergrond; oude CTA 6 vervalt | De escalatie-variant bleek in de praktijk niet te bestaan |
| 13-06-2026 | Nieuwe CTA 6 = `ready for main` met `GO`/`NO` | De kelner ziet of de tafel klaar is; het systeem niet |
| 13-06-2026 | CTA 3 hernoemd naar "Seater actief (why not seated?)" | De naam "bij drukte" klopte niet meer na het schrappen van forecast en piekuren |
| 13-06-2026 | Block by busy per CTA instelbaar, CTA 3 standaard uit | CTA 3 wordt dóór een kelner-actie getriggerd (§2.7) |
| 13-06-2026 | CTA 9 en 10 toegevoegd via runner/iPad | De gast vraagt het aan wie langsloopt, niet aan zijn eigen kelner |
| 13-06-2026 | Prio-volgorde 1, 2, 9, 10, 3, 4, 5, 6, 7, 8 | Bij 9 en 10 staat een gast te wachten |
| 13-06-2026 | CTA 5 wordt koffie in plaats van een drankje | Kleinere attentie, lagere drempel om hem te geven |
| 13-06-2026 | Vibratie per CTA in de backend, label weg van de kaart | Instelling van het huis, niet iets waar de kelner iets mee moet |
| 13-06-2026 | Toasts noemen geen tijden | Voorkomt discussie op de vloer over wat de handy beloofd zou hebben |
| 14-06-2026 | CTA 5 versimpeld naar niet-druk + bedrag per persoon | Percentielen en rolling averages waren overbodige complexiteit voor een gratis koffie |
| 14-06-2026 | "Reeds aangeboden"-check op CTA 5 weer verwijderd | Ingevoerd op 13-06, dag erna teruggedraaid: onbeperkt, de cooldown doet het werk al |
| 14-06-2026 | Verwachte drukte geschrapt, alleen actuele order-rate | Een forecast voorspelde niet wat er op dat moment op de vloer gebeurde |
| 14-06-2026 | CTA 4 zonder rol-rechten | De aanbieding is al goedgekeurd op de reservering |
| 14-06-2026 | Status `enabled` / `disabled` / `deleted` + shadow-logging | Meten of een CTA de moeite waard is vóór hij op de vloer komt |
| 14-06-2026 | CTA-niveau 1–3 als adoptie-ramp | Acceptatie door kelners gaat vóór volledigheid |
| 14-06-2026 | Eén knoptaal, `CLOSE TABLE` beschermd, CTA 7 fail-safe, statuslus naar de runner | UX-advies verwerkt |
| 09-07-2026 | Handy-meldingen als native push: lockscreen, swipe-to-act, tril en geluid | De handy is een telefoon; een webpagina voelde niet als een melding |
| 12-09-2026 | Deze spec wordt de bron van waarheid (§1.1); uitleg-PDF en demo worden afgeleid | Een bouwer bouwt uit de spec. Drie documenten naast elkaar lopen vroeg of laat uit elkaar |
| 12-09-2026 | De tempo-limiet (§2.8) is beleid, geen demo-vondst | Begrenst het totaal per dienst op een andere as dan §2.3 en §2.7 |
| 12-09-2026 | Onderdrukte CTA's worden gelogd met de reden (§6.3) | Zonder die regels is niet te zien hoeveel de remmen tegenhouden, en is opschalen naar een hoger niveau een gok |
| 12-09-2026 | Eigenaarschap vervalt niet op tijd en niet bij een servicewissel (§3.3) | Alleen overname en CTA 7 maken een wijk vrij. Het gevolg — een oude eigenaar aan het begin van een service — is aanvaard en staat in §3.3 |
| 12-09-2026 | Na `NO` of `BREAK` op CTA 7 komt de wijk vrij, niemand erft hem (§3.5) | Doorgeven aan wie het laatst aansloeg kan een collega zijn die één keer bijsprong |
| 12-09-2026 | Drukte (§4) en CTA 5 (§5.5) gaan naar fase 2 | CTA 5 is de enige functionele afnemer van drukte en staat pas op niveau 3 aan. Een order-rate per locatie ijken voor één gratis koffie kan wachten |
| 12-09-2026 | CTA 4 is geen CTA meer maar de promo-permissie (§2.14); nummer 4 blijft leeg | Er komt niets op een handy, dus prio, levensduur en instellingen sloegen nergens op. Nummer leeg laten zodat oude verwijzingen niet bij een andere CTA uitkomen |
| 12-09-2026 | CTA 9 en 10 krijgen geen levensduur (§5.9) | Ze staan vooraan in de prio en vallen daardoor op. Het gevolg — geen tweede signaal als de kelner niet reageert — is aanvaard |
| 12-09-2026 | Bevestigd: `cta2_postpone_time` en `cta2_max_levensduur` zijn vervallen (§7.3) | `WAIT` reset dezelfde sleep-timer en CTA 2 is terugkerend zonder eigen levensduur |
| 12-09-2026 | Recordformaat (§6.2) blijft ongewijzigd, zonder locatie, wijk of ticket | Locatie volgt uit de backend die de regel schrijft. De beperkingen staan in §6.2 zodat er geen dashboard wordt beloofd dat er niet uit te halen is |
| 12-09-2026 | Status blijft "Concept" tot de fase-1-punten uit §9.1 beantwoord zijn | Tot die tijd blijft de juni-uitleg formeel leidend voor gedrag (§1.1) |
| 12-09-2026 | De juni-uitleg krijgt een waarschuwing bovenaan in plaats van een inhoudelijke correctie | Hij wordt in één keer bijgewerkt zodra §9.1 rond is, in plaats van twee keer |

### §8.3 Nog niet gebouwd

Beschreven in dit document, niet aanwezig in `index.html`:

- Routing (§3) in zijn geheel — de demo kent één kelner en één handy
- Drukte als gemeten order-rate (§4) — in de demo een handmatige schakelaar
- De statuslus terug naar de runner-iPad (§5.9, §5.10)
- De promo-permissie als échte achtergrondregel (§2.14) — in de demo een info-kaartje

---

## §9 Openstaande beslissingen

Één voor één af te werken, in deze volgorde: elk antwoord kan het volgende punt
verschuiven. Er wordt niet op een open punt gebouwd.

### §9.1 Fase 1 — beantwoorden vóór de bouw

| Code | Vraag | Blokkeert | Wie |
|---|---|---|---|
| O2 | `routing_meerderheid_pct` staat in de uitleg als "±70%" — wat is het exacte getal, en over welk tijdvenster worden de tickets geteld? | Alle routing (§3), en daarmee elke CTA | Oscar |
| O7 | Na hoeveel inactiviteit vraagt CTA 7 of de kelner er nog is? | CTA 7, én hoe lang een wijk verkeerd kan staan (§3.3) | Oscar |
| O4 | De maart-PDF zegt "meer dan 2 plaatsingen in het venster", de juni-uitleg zegt "een seat-actie binnen de laatste X minuten". Eén plaatsing of twee? | CTA 3 | Oscar |
| O1 | `kelner_idle` op niveau 3 staat in de demo op 3 seconden. Dat lijkt een demo-waarde. Wat is het in productie? | Niveau 3 | Oscar |
| O8 | Trillen alleen CTA 1, 2, 3, 9 en 10, zoals nu in §7.4? Dat patroon is nooit apart besloten. | Niets — defaults zijn instelbaar | Oscar |

### §9.2 Fase 2 — pas nodig bij §4 en §5.5

| Code | Vraag | Wie |
|---|---|---|
| O5 | Wat is `cta5_bedrag_pp` — de besteding per persoon vanaf welke de koffie mag? Eén bedrag per locatie. | Oscar / bedrijfsleiding |
| O3 | Wat is de order-rate-drempel voor "druk", en over welk venster gemeten? | Oscar |
| O6 | Hoe lang stelt `WAIT` op CTA 5 uit? | Oscar |

---

*Gereconstrueerd op 12-09-2026 uit `docs/oscar_CTA_uitleg.html` (juni 2026),
`index.html` (juli 2026), `Oscar_CTAs.pdf` (maart 2026) en 41 commits.
Ter herziening.*
