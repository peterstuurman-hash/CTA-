# Oscar — CTA-specificatie

| | |
|---|---|
| **Document** | `oscar_cta_specs.md` — SPEC |
| **Project** | Oscar — CTA's op de handy |
| **Versie** | 2.1 — Beachalert als bron (§10) |
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

**Dit geldt alleen voor systeem-CTA's** (§2.15). Die ontstaan uit een timer; komt
er niets, dan heeft niemand iets gemist.

Voor een **mens-CTA** gaat de redenering niet op. Daar heeft een medewerker al
gezien dat er iets nodig is en er een handeling voor gedaan. Verdwijnt dat signaal,
dan wacht de gast nog steeds en is er werk gedaan dat nergens heen ging — en de
melder ziet het niet, want die heeft "verzonden" op zijn scherm gehad. Mens-CTA's
krijgen daarom wél een fallback en een escalatie (§2.16).

### §2.3 Maximaal drie kaarten, prio bepaalt welke

Maximaal drie CTA-kaarten tegelijk zichtbaar per handy. Zijn er meer, dan staat de
rest in de wachtrij. De zichtbare drie worden gekozen op prio, bij gelijke prio op
volgorde van binnenkomst.

Prio-volgorde: **1, 2, 9, 10, 11, 12, 3, 5, 6, 7, 8, 13, 14**

CTA 9 t/m 12 staan vlak achter 1 en 2: dat zijn de mens-CTA's (§2.15), waar iemand
op staat te wachten die het al gemeld heeft.

CTA 13 en 14 staan achteraan (§5.13, §5.14). Ze helpen de gast die er nu zit niet,
en mogen dus nooit een operationele kaart uit beeld duwen.

Nummer 4 ontbreekt: dat was de promo-permissie, die geen kaart is en dus geen prio
heeft. Zie §2.14. Het nummer blijft leeg zodat de rest niet hoeft te schuiven.

### §2.4 Afhandelen is verplicht

Een kaart verdwijnt alleen door een kelner-actie of door verval. Pas dan schuift de
volgende CTA uit de wachtrij door. Er is geen wegklikken zonder registratie.

### §2.5 Ticket afgerekend = alle CTA's van die tafel direct weg

Zonder vertraging, zonder uitzondering.

Dit gaat over CTA's die op dat moment openstaan. Een CTA die ná het sluiten
ontstaat valt er niet onder — zie CTA 13 (§5.13), die juist op het sluiten wacht.

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

**Uitzondering: CTA 12** (§5.12). Het volume van oproepen aan de LG wordt begrensd
door samen te voegen, niet door te weigeren.

**Uitzondering: CTA 12** (§5.12). Het volume van oproepen aan de LG wordt begrensd
door samen te voegen, niet door te weigeren.

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
| 1 · Introductie | 1, 6, 8, 9, 10, 11, 12 | 60 sec | 1 |
| 2 · Gemiddeld | 1, 2, 3, 6, 8, 9, 10, 11, 12 | 20 sec | 3 |
| 3 · Volledig | alle | TODO (O1) | 6 |

`cta_window` is op elk niveau 600 sec.

Uitgeschakelde CTA's staan op `disabled`, niet op `deleted` — ze blijven
shadow-loggen.

De promo-permissie (§2.14) staat buiten de niveaus: die is geen melding en valt dus
niet onder de adoptie-ramp.

### §2.12 Knoptaal

Alle knoppen Engels en over alle CTA's consistent:

| Betekenis | Knoppen |
|---|---|
| Doe het nu | `ORDER` · `GO` · `YES` · `NEW` · `PULL` · `PRINT` |
| Klaar, opgelost | `FIXED` |
| Geen oordeel | `MAYBE` |
| Later | `WAIT` |
| Weiger | `NO` |
| Haal er iemand bij | `CALL LG` |

`CALL LG` is de enige knop die een nieuwe CTA veroorzaakt in plaats van er een af te
sluiten. Hij staat op CTA 2 (§5.2) en CTA 11 (§5.11).

`CLOSE TABLE` staat apart, is rood en vraagt een bevestiging — beschermd tegen
mistaps. Elke tik geeft directe feedback op het scherm.

Terugmeldingen noemen **geen tijden** ("extra wait", niet "15 minuten extra"). Dat
voorkomt discussie op de vloer over wat de handy beloofd zou hebben.

### §2.13 CTA-hygiëne

Per CTA meet Oscar via de log of het gewenste effect volgt. Een CTA die structureel
genegeerd wordt gaat eruit of wordt vervangen. Liever een paar effectieve CTA's dan
veel ruis.

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

### §2.15 Bronnen van CTA's, en de poort

Een CTA kan uit twee soorten bron komen:

| Soort | Wie merkt iets op | Voorbeelden |
|---|---|---|
| **Systeem** | Oscar zelf, op een timer of een gebeurtenis | CTA 1, 2, 3, 5, 6, 7, 8 |
| **Mens** | Een medewerker meldt iets | CTA 9, 10, 11, 12 — via een tablet, of via een systeemproduct op de handy (§5.12) |

**Alle bronnen gaan door dezelfde poort.** De backend beslist of er een CTA-record
wordt weggeschreven; WaiterPro leest dat record en toont het op de handy. Een bron
schrijft dus nooit rechtstreeks naar een handy.

In die poort zitten, in deze volgorde:

1. Status van de CTA voor deze locatie (§2.10)
2. Routing: wie is de eigenaar (§3)
3. Block by busy (§2.7)
4. Tempo-limiet (§2.8)
5. Loggen wat er gebeurde, ook bij tegenhouden (§6.3)

De begrenzing tot drie zichtbare kaarten (§2.3) gebeurt daarna, bij het tonen.

Een nieuwe bron — een vloertablet, een keukenscherm, wat er ook bij komt — erft
deze poort automatisch. Wie een bron bouwt die de poort omzeilt, bouwt een tweede
meldingssysteem naar dezelfde handy zonder gedeelde rem, en dat is precies wat
§2.13 wil voorkomen.

### §2.16 Levering en escalatie van mens-CTA's

Geldt **alleen voor mens-CTA's** (§2.15): CTA 9, 10, 11 en 12. Systeem-CTA's kennen
geen van deze stappen — die vervallen stilletjes en dat is de bedoeling (§2.2).

**1 · Delivery-check vooraf.** Vóór het wegschrijven kijkt de poort in de
devicedata of de handy van de doelkelner online is en of er iemand op ingelogd
staat. Zo niet, dan gaat de CTA meteen naar de fallback. Er wordt niet blind
verzonden om vervolgens af te wachten.

**2 · Fallback-volgorde.** Eigenaar → collega in dezelfde zone, indien bekend →
LG. Elke overgeslagen stap wordt gelogd met de reden (§6.3).

Dit is de uitzondering op §3.5, waar niemand een wijk erft. Daar ging het om
eigenaarschap, hier alleen om deze ene melding: de collega wordt geen eigenaar van
de wijk.

**3 · Leveringsbevestiging.** Komt er binnen `mens_delivery_timeout` geen
bevestiging van WaiterPro én geen respons, dan geldt de CTA als niet afgeleverd en
volgt alsnog de fallback.

**4 · Escalatietimer.** Niet afgehandeld binnen de timer van zijn actietype
(§7.5)? Dan gaat er óók een CTA naar de LG. De oorspronkelijke kaart **blijft
staan** — de escalatie is een extra melding, geen verplaatsing. Anders verdwijnt
het werk van de handy van degene die er het dichtst bij staat.

**5 · Terugkoppeling.** De uitkomst wordt vastgelegd op het signaal en is zichtbaar
op het bronscherm zodra iemand dezelfde tafel opnieuw intoetst (§5.11).

Aanvaard gevolg: de melder krijgt **geen** actieve waarschuwing dat zijn signaal
geëscaleerd is. Hij heeft "verzonden" gezien en loopt door. Dat is aanvaardbaar
omdat de escalatie bij de LG landt, die kan handelen — maar het betekent dat een
runner niet weet dat hij er nog een keer langs moet.

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

Heeft niemand in de wijk aangeslagen, dan hangt het af van het soort CTA (§2.15):

| Soort | Gedrag |
|---|---|
| **Systeem-CTA** (1–8) | Vervalt. Geen seeding, geen fallback naar een willekeurige kelner. Gelogd als `geen_wijk` (§6.3) |
| **Mens-CTA** (9–12) | Gaat naar de LG, met de vermelding "geen tafeleigenaar gevonden". Gelogd als `geen_wijk_naar_lg` |

Het verschil zit in §2.2: bij een systeem-CTA heeft niemand iets gemist, bij een
mens-CTA staat er iemand te wachten die het al gemeld heeft.

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

## §4 Drukte en stilte

Er zijn drie verschillende dingen die "druk" of "stil" kunnen heten, en ze worden
makkelijk door elkaar gehaald. Ze meten iets anders en worden voor iets anders
gebruikt.

| | Gaat over | Gebruikt door |
|---|---|---|
| §4.1 Drukte van de zaak | de hele locatie | CTA 5, druktemeter LG |
| §4.2 Drukte van de kelner | één kelner in zijn wijk | LG-dashboard, escalatie |
| §4.3 "Doet niets meer" | één kelner, stilte | CTA 7, routing |

Block by busy (§2.7) hoort in geen van drieën thuis: dat kijkt alleen of de kelner
in de laatste seconden iets deed, en staat los van werkdruk.

### §4.1 Drukte van de zaak

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

### §4.2 Drukte van de kelner

De drukte van de zaak zegt niets over of **deze** kelner het aankan. Iemand kan
verzuipen in een rustige zaak en het prima doen op een volle avond. Voor "de LG
kan gaan helpen" is dat laatste nodig, niet §4.1.

Twee assen, allebei uit gegevens die er al zijn:

**Werklast** — wat er op zijn bord ligt:

- open tafels in zijn wijk
- tafels waar een gang onderweg is (voorgerecht gefired, hoofdgerecht nog niet)
- tafels die nog niets besteld hebben

**Achterstand** — of hij het bijhoudt:

- openstaande CTA's op zijn handy
- CTA's die hij in het laatste venster liet verlopen
- mediane responstijd in het laatste venster

**Allebei zijn nodig.** Werklast alleen zegt te weinig: acht tafels is voor de een
veel en voor de ander niets. Achterstand alleen ook: nul openstaande CTA's kan
betekenen dat hij het goed doet, of dat er niets gebeurt in zijn wijk.

Kleur per wijk op het LG-dashboard:

| Kleur | Betekenis |
|---|---|
| Groen | Werklast normaal, geen achterstand |
| Oranje | Werklast hoog **óf** achterstand zichtbaar |
| Rood | Werklast hoog **én** achterstand |

**Rood is een verzoek om te gaan helpen, geen oordeel over de kelner.** Dat
onderscheid moet uit het scherm zelf blijken — zie §11.4. Een wijk kleurt, geen
persoon.

Parameters: §7.6, alle drempels TODO (O13).

### §4.3 "Doet niets meer"

Drie toestanden die uit elkaar gehouden moeten worden, omdat ze een ander gevolg
hebben:

| Toestand | Hoe vastgesteld | Gevolg |
|---|---|---|
| **Onbereikbaar** | Handy offline of niemand ingelogd (devicedata) | Mens-CTA's naar de fallback (§2.16). Geen CTA 7 — vragen heeft geen zin |
| **Stil** | Geen POS-aanslag en geen CTA-respons binnen `cta7_inactief_drempel`, **terwijl er open tafels in zijn wijk staan** | CTA 7 actief-check (§5.7) |
| **Klaar** | Geen open tafels in zijn wijk | Niets. Niet stil — er is gewoon niets te doen |

**"Doet niets meer" is de toestand Stil.** De derde regel is er om te voorkomen
dat een kelner met een leeggelopen wijk elk kwartier gevraagd wordt of hij er nog
is. Stilte is alleen een signaal als er werk ligt.

Twee dingen tellen mee als bezig zijn:

- Een kelner die "wil wachten" aanslaat is bezig. Dat is een POS-handeling en een
  bewuste beslissing over de tafel (§5.2).
- Een kelner die een CTA beantwoordt is bezig, ook als hij `NO` of `WAIT` drukt.

De fail-safe van §5.7 blijft gelden: geen antwoord op CTA 7 betekent nooit
automatisch uit het overzicht.

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

**Trigger** Een medewerker die de tafel niet bedient — meestal een runner — geeft
de tafel door plus "wil bestellen". De gast heeft het aan hem gevraagd. Oscar pusht
naar de eigenaar van de wijk (§3).

De ingang is het vloertablet (Beachalert, §10). Later kunnen de seating-app en het
dashboard hetzelfde signaal afgeven; die kennen wél de ingelogde medewerker, het
tablet niet. Voor de CTA maakt de ingang niets uit.

**Kaart** `Tafel [nr] ([naam]) — wil bestellen`

| Knop | Actie |
|---|---|
| `ORDER` | Open WaiterPro en neem de bestelling op. Status "opgepakt" terug naar de runner-iPad. |
| `NO` | Wegklikken. Status "afgewezen" terug naar de runner-iPad. |

**De statusterugkoppeling naar het tablet is verplicht.** Zonder die lus krijg je
dubbele kaarten en een gast die blijft wachten.

**Mens-CTA** (§2.15): delivery-check, fallback en escalatie volgens §2.16, met
`escalatie_bestellen` als timer (§7.5).

**Geen levensduur.** De kaart vervalt niet en blijft staan tot de kelner hem
afhandelt (§2.4), óók nadat hij geëscaleerd is naar de LG.

**Recente-bestelling-check** Is er minder dan `recente_order_venster` geleden op
deze tafel aangeslagen, dan vraagt het tablet eerst om bevestiging ("zojuist
besteld — toch doorgeven?") vóór er iets wordt weggeschreven. Zie §10.3.

### §5.10 CTA 10 — Gast wil betalen

**Doel** Een betaalverzoek bij de kelner krijgen.

**Trigger** Als CTA 9, maar de runner kiest "wil afrekenen".

**Kaart** `Tafel [nr] ([naam]) — wil betalen`

| Knop | Actie |
|---|---|
| `PRINT` | Afrekenen / de bon afdrukken. Status "klaar" terug naar het tablet. |
| `NO` | Wegklikken. Status "afgewezen" terug naar het tablet. |

**Mens-CTA** (§2.15): delivery-check, fallback en escalatie volgens §2.16, met
`escalatie_afrekenen` als timer (§7.5).

**Auto-close.** Laat de orderstatus zien dat de rekening is aangeslagen of het
ticket gesloten, dan wordt een openstaande CTA 10 automatisch afgehandeld — niemand
hoeft af te vinken. Gelogd als `auto_close` in de `actie`-kolom (§6.2). Dit is
naast §2.5, dat alle CTA's van een afgerekende tafel sowieso weghaalt; auto-close
vuurt ook als de rekening is aangeslagen zonder dat het ticket al dicht is.

### §5.11 CTA 11 — Bestelling klopt niet

**Doel** Een klopt-niet-melding bij de kelner zelf krijgen, niet bij de LG.

**Trigger** Een medewerker tikt op het vloertablet de tafel aan plus "bestelling
klopt niet" (§10.3).

**Kaart** `Tafel [nr] ([naam]) — check je bestelling` · met, als ze beschikbaar
zijn, de laatste orderregels van de tafel eronder.

| Knop | Actie |
|---|---|
| `FIXED` | Opgelost. CTA afgehandeld, geen escalatie. |
| `CALL LG` | De kelner komt er niet uit. Push naar de LG met tafel en orderregels. |

**Gaat eerst naar de kelner, niet naar de LG.** Die staat er het dichtst bij en
lost het meestal zelf op. De LG komt erbij via `CALL LG` of via de escalatietimer,
niet meteen.

**Mens-CTA** (§2.15): delivery-check, fallback en escalatie volgens §2.16, met
`escalatie_check` als timer (§7.5).

### §5.12 CTA 12 — Roep LG

**Doel** Een medewerker die de leidinggevende nodig heeft, zonder hem te gaan
zoeken.

**Dit is geen Beachalert-CTA.** De LG wordt door van alles en iedereen gezocht.
Vier ingangen, allemaal dezelfde CTA:

| Ingang | Hoe |
|---|---|
| Runner, vloertablet | De knop "Roep LG", met locatie en categorie (§10.4) |
| Bar, pas, seat | Hetzelfde tablet, of een tablet op die plek |
| Kelner | Een **systeemproduct** op de handy aanslaan: "LG nodig" |
| Kelner, vanuit een melding | De knop `CALL LG` op CTA 11 (§5.11) |

Het systeemproduct is de ingang voor wie geen tablet in de buurt heeft. Het komt
binnen via de monitor (§11.1) in plaats van via de poort-API, maar is verder een
gewone mens-CTA (§2.15).

**Kaart** `LG gevraagd — [locatie]` · met de categorie eronder als die gekozen is,
en het aantal oproepen als er meer zijn samengevoegd.

| Knop | Actie |
|---|---|
| `GO` | De LG komt eraan. CTA afgehandeld. |
| `NO` | Wegklikken. |

**Hangt niet aan een tafel.** `tafelnr` blijft leeg in de log (§6.2), net als bij
CTA 7.

#### Nooit weigeren

Voor deze CTA gelden §2.7 en §2.8 **niet**:

- **Block by busy** beschermt een kelner die aan het bedienen is tegen een melding
  die kan wachten. Een LG die gestoord wordt, wordt gestoord vóór zijn werk — dat
  ís zijn werk.
- **De tempo-limiet** begrenst hoeveel meldingen er op een handy landen. Bij een
  oproep om ergens naartoe te komen is dat de verkeerde reactie.

"We kunnen nu de LG niet oproepen" is het slechtst denkbare antwoord. De melder
gaat dan alsnog zoeken, met een omweg erbij, en gebruikt het tablet de volgende
keer niet meer.

#### Wel samenvoegen

Het volumeprobleem wordt opgelost door bundelen, niet door blokkeren. Meerdere
oproepen voor dezelfde LG binnen `cta12_samenvoegvenster` worden één kaart die
meegroeit:

```
LG gevraagd — 3 oproepen
bar · seat · pas
```

Dat kost één van de drie kaartslots in plaats van drie, en de LG ziet in één
oogopslag waar het vastloopt. Elke oproep blijft apart in de log staan (§6.2), dus
het aantal is gewoon te meten.

#### Waarom deze CTA vroeg aan moet

De LG wordt nu gezocht: door de bar, door de seater, door de pas, door een kelner.
Eén por op zijn handy vervangt dat zoeken. Iedereen op de vloer ziet dat het werkt,
en het tablet krijgt meteen een reden om gebruikt te worden.

Daarom staat CTA 12 in niveau 1 (§2.11) en niet achteraan in de adoptie-ramp.

**Routing** Naar de LG-handy. Wie dat is komt uit de devicedata (de rol van de
ingelogde medewerker) óf uit een instelling per zaak. Beide paden bestaan; welke
geldt staat per locatie in `lg_routing` (§7.5).

**Mens-CTA** (§2.15): delivery-check en fallback volgens §2.16. Wat er gebeurt als
de LG niet bereikbaar is of niet reageert, staat open — O10.

### §5.13 CTA 13 — Uitnodigen? (voorstel)

> **Voorstel, nog niet besloten.** Peter, 12-09-2026. Zie O17.

**Doel** Vastleggen welke gasten je in de toekomst wilt uitnodigen, beoordeeld
door degene die ze de hele avond heeft bediend.

**Trigger** `cta13_vertraging` ná het sluiten van het ticket, **en** niet druk
(§4.1).

**Kaart** `Tafel [nr] · vertrokken [tijd] — uitnodigen in de toekomst?`

| Knop | Actie |
|---|---|
| `YES` | Markeren als gast die je terug wilt zien. |
| `MAYBE` | Geen oordeel. Wordt vastgelegd als "weet niet", niet als "nee". |
| `NO` | Geen uitnodiging. |

#### De flow

Het afrekenen is het ankerpunt, maar de kaart komt er niet tijdens.

| Moment | Wat er gebeurt |
|---|---|
| Rekening aangeslagen | Niets. Een openstaande CTA 10 wordt auto-closed (§5.10) |
| Betaling verwerkt, ticket gesloten | §2.5: alle CTA's van die tafel verdwijnen |
| Ticket gesloten + `cta13_vertraging` | CTA 13 verschijnt — als het op dat moment niet druk is |

De vertraging is er om één reden: bij het afrekenen staat de kelner met zijn handy
áán tafel, met de pin in zijn hand. Dat is het slechtste moment om een
beoordelingsvraag in beeld te hebben. De kaart komt pas als hij is weggelopen.

**Niet tijdens drukte.** Is het druk op het moment dat de kaart zou komen, dan
wacht hij op een rustig moment, tot uiterlijk `cta13_levensduur` na het sluiten.
Daarna vervalt hij. Een oordeel dat drie kwartier later gevraagd wordt, gaat over
een tafel die de kelner zich niet meer scherp herinnert — dan is de vraag stellen
erger dan hem overslaan.

**De vertrektijd staat op de kaart, de gastnaam niet.** Tafel 3 kan inmiddels
opnieuw geseat zijn; zonder tijdstip beoordeelt de kelner misschien de verkeerde
gasten. `vertrokken 21:40` is genoeg om het gezelschap terug te halen, en verraadt
niets aan wie meekijkt.

`MAYBE` is een nieuwe knop in §2.12. Hij is er omdat "weet niet" en "zeker niet"
echt verschillende dingen zijn, en omdat een kelner die moet kiezen tussen ja en
nee bij twijfel altijd ja kiest — en dan is de vraag zinloos geworden.

**Eén keer per ticket.** Geen herhaling, geen `WAIT`.

**Systeem-CTA** (§2.15): geen escalatie, geen fallback. Komt er geen antwoord, dan
is er geen oordeel. Dat is een prima uitkomst.

#### Wat hier anders is dan bij alle andere CTA's

Dit is de eerste CTA die de kelner vraagt een **gast** te beoordelen, en die dat
oordeel bewaart bij een persoon met een naam. Drie dingen volgen daaruit.

**De kaart mag de gastnaam niet tonen.** Bij elke andere CTA staat er
`Tafel 3 (Sanne)`; hier niet. De kelner staat met die handy áán tafel, en een gast
die meekijkt leest dat hij beoordeeld wordt. Het tafelnummer is genoeg — de kelner
weet wie daar zit.

**"Zeker niet" is een blijvend negatief label op een echt persoon.** Leg vast wie
het gaf en wanneer, laat het verlopen na een afgesproken termijn, en zorg dat het
nergens opduikt waar het als waarschuwing gelezen kan worden door iemand die de
context niet kent.

**De gast weet er niets van.** Dit is een verwerking van persoonsgegevens met een
ander doel dan de reservering. Laat toetsen vóór het aan gaat — O18.

### §5.14 CTA 14 — Wervingskaartje (voorstel)

> **Voorstel, nog niet besloten.** Peter, 12-09-2026. Zie O17.

**Doel** Personeelswerving onder gasten die in de buurt wonen. De CTA is het
zetje om het wervingskaartje te geven en te vragen of ze nog iemand kennen.

**Trigger** De postcode op de reservering valt binnen `cta14_postcodes`, **en**
het is niet druk (§4.1), **en** `cta14_moment` is bereikt.

**Kaart** `Tafel [nr] — wervingskaartje meegeven`

| Knop | Actie |
|---|---|
| `YES` | Gegeven. |
| `NO` | Niet gedaan — past niet bij deze tafel. |

**Eén keer per ticket.** Geen herhaling.

**Niet tijdens drukte**, om dezelfde reden als CTA 5 (§5.5): een kelner die het
druk heeft gaat geen wervingsgesprek voeren, en de vraag stellen kost dan alleen
maar aandacht.

**Systeem-CTA** (§2.15): geen escalatie.

**Let op bij de postcode.** Die is opgegeven voor een reservering, niet voor
werving. Een ander doel dan waarvoor het gegeven is verzameld, vraagt om een
grondslag — O18, samen met CTA 13.

Praktisch: bewaar niet de postcode zelf in de CTA-log, maar alleen dat de tafel
binnen het bereik viel. Dan staat er geen adresgegeven in een tabel die voor heel
andere analyses wordt gebruikt.

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
| `geen_wijk` | Er was geen eigenaar voor de wijk; systeem-CTA, dus vervallen | §3.4 |
| `geen_wijk_naar_lg` | Geen eigenaar; mens-CTA, dus doorgestuurd naar de LG | §3.4 |
| `offline_fallback` | Handy van de eigenaar offline of uitgelogd; naar de volgende in de fallback-volgorde | §2.16 |
| `niet_afgeleverd` | Geen bevestiging binnen `mens_delivery_timeout`; alsnog fallback | §2.16 |

De laatste drie horen bij mens-CTA's (§2.15); bij die regels is `actie` leeg maar
staat er wél een doelmedewerker in `kelner` — degene naar wie hij uiteindelijk
ging. Een escalatie naar de LG (§2.16, stap 4) is een gewone nieuwe CTA en krijgt
dus een eigen `enabled`-regel, niet een van deze.

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

**Let op bij `cta1_check_delay` en `cta2_sleep_threshold`.** Die twee komen uit de
maart-PDF en zijn sindsdien nooit herbevestigd. Ze bepalen samen hoe opdringerig
het systeem aanvoelt: 120 seconden na seaten is kort, en 1800 seconden zonder
kelner-actie is lang. In de gesprekken van 12-09-2026 vielen 360 en 900 als
voorbeeld — niet als besluit. Herijk ze vóór de eerste locatie live gaat, met de
shadow-log (§6.3) als grondslag in plaats van een schatting.

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
| 11 · Bestelling klopt niet | enabled | **uit** | aan |
| 12 · Roep LG | enabled | **n.v.t.** | aan |

De `status`-kolom wordt overschreven zodra er een CTA-niveau is ingesteld (§2.11).
De promo-permissie (§2.14) staat hier niet in: die kent geen van deze drie
schakelaars.

Herkomst: de demo. TODO (O8) — het vibratiepatroon (alleen 1, 2, 3, 9 en 10) is
nergens apart besloten; bevestigen of dit de gewenste productiedefaults zijn.

`block by busy` staat uit voor CTA 11: daar wacht een gast op, en die tegenhouden
omdat de kelner net iets deed stelt precies het verkeerde uit. Bij CTA 12 is de
schakelaar niet van toepassing — die wordt nooit tegengehouden (§5.12).

CTA 13 en 14 staan er nog niet in; die zijn nog een voorstel (§7.7).

### §7.5 Parameters voor mens-CTA's en Beachalert

| Parameter | Default | Herkomst | Wat |
|---|---|---|---|
| `mens_delivery_timeout` | 30 sec | opdracht Beachalert | Geen bevestiging én geen respons binnen deze tijd = niet afgeleverd (§2.16) |
| `escalatie_bestellen` | 240 sec | opdracht Beachalert | CTA 9 niet afgehandeld → ook naar LG |
| `escalatie_afrekenen` | 180 sec | opdracht Beachalert | CTA 10 niet afgehandeld → ook naar LG |
| `escalatie_check` | 180 sec | opdracht Beachalert | CTA 11 niet afgehandeld → ook naar LG |
| `escalatie_roep_lg` | TODO (O10) | — | CTA 12 onbeantwoord → naar wie? |
| `dedupe_venster` | 180 sec | opdracht Beachalert | Zelfde tafel + zelfde actie binnen deze tijd = geen tweede CTA (§10.3) |
| `recente_order_venster` | 120 sec | opdracht Beachalert | "Zojuist besteld — toch doorgeven?" bij CTA 9 (§5.9) |
| `lookup_cache` | 60 sec | opdracht Beachalert | Maximale leeftijd van de tafel-naar-kelner lookup (§10.2) |
| `lg_routing` | TODO (O12) | — | Per zaak: LG uit devicedata (rol) of uit een vaste instelling (§5.12) |
| `cta12_samenvoegvenster` | TODO (O20) | — | Binnen deze tijd worden oproepen aan dezelfde LG één kaart (§5.12) |

Deze staan per locatie in, net als §7.1 en §7.2.

### §7.6 Drukte van de kelner en inactiviteit

| Parameter | Default | Wat |
|---|---|---|
| `kelner_venster` | TODO (O13) | Venster waarover achterstand wordt gemeten (§4.2) |
| `kelner_werklast_tafels` | TODO (O13) | Open tafels vanaf waar de werklast "hoog" heet |
| `kelner_werklast_gangen` | TODO (O13) | Tafels met een gang onderweg, idem |
| `kelner_achterstand_open` | TODO (O13) | Openstaande CTA's vanaf waar er achterstand is |
| `kelner_achterstand_vervallen` | TODO (O13) | Vervallen CTA's in het venster, idem |
| `kelner_achterstand_respons` | TODO (O13) | Mediane responstijd vanaf waar er achterstand is |

"Stil" (§4.3) gebruikt geen eigen drempel maar `cta7_inactief_drempel` (§7.2) —
dezelfde grens die bepaalt wanneer CTA 7 vuurt. Eén getal, één betekenis.

### §7.7 Voorgestelde CTA's 13 en 14

Horen bij §5.13 en §5.14, die nog niet besloten zijn (O17).

| Parameter | Default | Wat |
|---|---|---|
| `cta13_vertraging` | TODO (O17) | Tijd na het sluiten van het ticket voordat de kaart komt |
| `cta13_levensduur` | TODO (O17) | Hoe lang de vraag nog zinvol is; daarna vervalt hij |
| `cta13_bewaartermijn` | TODO (O18) | Na hoeveel tijd een `NO` vervalt |
| `cta14_postcodes` | TODO (O17) | Postcodes of straal die als "uit de buurt" gelden, per locatie |
| `cta14_moment` | TODO (O17) | Wanneer het wervingskaartje wordt voorgesteld |

Beide starten op `disabled` (§2.10) en in CTA-niveau 3 (§2.11): eerst
shadow-loggen hoe vaak ze zouden vuren, dan pas beslissen of ze het waard zijn.

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
| 12-09-2026 | Alle bronnen van CTA's gaan door één poort in onze backend (§2.15) | Een bron die de poort omzeilt is een tweede meldingssysteem naar dezelfde handy zonder gedeelde rem |
| 12-09-2026 | Onderscheid systeem-CTA (1–8) en mens-CTA (9–12) (§2.15) | Bij een systeem-CTA heeft niemand iets gemist als hij vervalt; bij een mens-CTA staat er iemand te wachten die het al gemeld heeft |
| 12-09-2026 | Escalatie, delivery-check en fallback gelden alleen voor mens-CTA's (§2.16) | Timers op CTA 1–8 zouden de LG overspoelen met meldingen die niemand had aangevraagd |
| 12-09-2026 | Geen eigenaar: systeem-CTA vervalt, mens-CTA gaat naar de LG (§3.4) | Zelfde redenering als §2.2; de nullijn verschilt per soort |
| 12-09-2026 | CTA 11 (bestelling klopt niet) en CTA 12 (roep LG) toegevoegd | Beachalert brengt twee signalen die nog geen CTA hadden |
| 12-09-2026 | CTA 11 gaat eerst naar de kelner, niet naar de LG | Die staat er het dichtst bij en lost het meestal zelf op |
| 12-09-2026 | Beachalert volgt de routing van §3 (wijk), niet een lookup per tafel | Twee routings naast elkaar laten CTA 9 en CTA 1 voor dezelfde tafel bij verschillende kelners landen |
| 12-09-2026 | `beachalert_events` is de rijkere bron, §6.2 is de projectie ervan | Twee losse logs voor hetzelfde signaal geeft twee waarheden |
| 12-09-2026 | CTA 12 is geen Beachalert-CTA maar een systeembrede oproep met vier ingangen, waaronder een systeemproduct op de handy (§5.12) | De LG wordt door de bar, de seater, de pas en door kelners gezocht. Eén por vervangt dat zoeken |
| 12-09-2026 | Een oproep aan de LG wordt nooit tegengehouden; het volume wordt begrensd door samen te voegen (§5.12) | "We kunnen nu de LG niet oproepen" laat de melder alsnog zoeken, met een omweg erbij — dan gebruikt niemand het tablet nog |
| 12-09-2026 | CTA 11 en 12 staan aan vanaf niveau 1 (§2.11) | Beachalert is de reden dat ze bestaan; twee dode knoppen op het tablet is een halve oplevering. CTA 12 laat bovendien het snelst zien dat het systeem werkt |
| 12-09-2026 | Het rapport gaat per periode van vier weken, niet per week (§11.6) | Escalaties per kelner per week zijn te kleine getallen om ruis van beweging te onderscheiden. De vier weken staan er los in |
| 12-09-2026 | De kelner ziet zijn eigen deel op verzoek, via de staff-app (§11.6) | Inzagerecht bestaat sowieso; dit legt vast dat het via een kanaal loopt dat hij al kent |
| 12-09-2026 | Alle instellingen worden door kantoor beheerd (§11.3) | Eén plek, overal dezelfde getallen. Verschillen tussen zaken komen dan uit de vloer en niet uit de configuratie. Het gevolg — een LG kan in het moment niets — is aanvaard |
| 12-09-2026 | Beachalert geeft alleen een commando af — tafelnummer plus soort actie (§10.1) | Eén centrale applicatie bepaalt alle CTA's. Routing, dedupe, remmen, escalatie en levering horen daar, niet in een tablet-app. Welke applicatie dat wordt, wordt later bepaald |

### §8.3 Nog niet gebouwd

Beschreven in dit document, **niet aanwezig in de demo** `index.html`. Dat zegt
iets over de demo, niet per se over het productiesysteem — zie de eerste regel.

- Routing (§3) — **bestaat wél** aan Oscars kant: hij weet met grote zekerheid
  welke kelner in welke wijk loopt (Peter, 12-09-2026). De demo kent één kelner
  en één handy, dus daar zit hij niet in. Wat nog niet vastligt zijn de
  parameters: O2
- Drukte als gemeten order-rate (§4) — in de demo een handmatige schakelaar
- De statuslus terug naar de runner-iPad (§5.9, §5.10)
- De promo-permissie als échte achtergrondregel (§2.14) — in de demo een info-kaartje
- De CTA-backend (§11) in zijn geheel: monitor, triggers, poort, transport, log
- De poort (§2.15) als één doorgang voor alle bronnen
- Het LG-dashboard met wijk-kleuren (§4.2, §11.4)
- Het periodesrapport (§11.6)
- Levering, fallback en escalatie van mens-CTA's (§2.16)
- CTA 11 en CTA 12 (§5.11, §5.12) — bestaan alleen op papier
- Beachalert zelf (§10) — nog geen regel code

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
| O12 | Haalt de LG-routing de leidinggevende uit de devicedata (rol van de ingelogde medewerker) of uit een vaste instelling per zaak? Beide paden worden gebouwd; wat is de default? | CTA 12, en de fallback van §2.16 | Oscar |
| O10 | Wat gebeurt er als de LG niet bereikbaar is of niet reageert op een oproep (§5.12)? De LG is het eindpunt van elke andere escalatie. | CTA 12 | Peter |
| O20 | Hoe lang is `cta12_samenvoegvenster` — binnen welke tijd worden oproepen aan dezelfde LG één kaart? | CTA 12 | Oscar |
| O13 | De zes drempels voor de drukte van een kelner (§7.6). Beter te ijken op een paar weken echte data dan nu te schatten. | Het LG-dashboard (§4.2) | Oscar, na meting |
| O15 | Het periodesrapport (§11.6) registreert prestaties van individuele medewerkers. In Nederland geldt zoiets doorgaans als personeelsvolgsysteem, waar de OR instemmingsrecht op heeft. Vooraf laten toetsen. | Het periodesrapport, niet de rest | Peter / kantoor |
| O19 | De staff-app moet het eigen deel van het periodesrapport kunnen tonen. Welke app is dat, en hoe knopen we de ingelogde medewerker aan de kelner in de CTA-log? | Inzage voor de kelner | Peter |
| O17 | Komen CTA 13 (uitnodigen) en CTA 14 (wervingskaartje) er, en met welke momenten en drempels? | Alleen zichzelf | Peter |
| O18 | CTA 13 legt een oordeel over een gast vast; CTA 14 gebruikt de postcode voor een ander doel dan de reservering. Grondslag en bewaartermijn laten toetsen vóór invoering. | CTA 13 en 14 | Peter / kantoor |

### §9.2 Fase 2 — pas nodig bij §4 en §5.5

| Code | Vraag | Wie |
|---|---|---|
| O5 | Wat is `cta5_bedrag_pp` — de besteding per persoon vanaf welke de koffie mag? Eén bedrag per locatie. | Oscar / bedrijfsleiding |
| O3 | Wat is de order-rate-drempel voor "druk", en over welk venster gemeten? | Oscar |
| O6 | Hoe lang stelt `WAIT` op CTA 5 uit? | Oscar |

---

## §10 Beachalert — het vloertablet als bron

### §10.1 Wat het is

Beachalert is een vloer-app op kiosk-tablets waar een runner of andere medewerker
een tafelnummer intoetst en met één tap een signaal doorgeeft. Het is **geen eigen
meldingssysteem**: het is een bron van mens-CTA's (§2.15) die door dezelfde poort
gaat als alle andere.

Het vloertablet is de **eerste** ingang, niet de enige: de seating-app en het
dashboard kunnen dezelfde signalen later ook afgeven. Die kennen de ingelogde
medewerker, het tablet niet — dat is een gedeeld device zonder login. Voor de CTA
maakt het niets uit wie hem afgaf.

**Beachalert beslist niets.** Hij geeft één commando af — tafelnummer plus soort
actie — en toont wat de poort antwoordt. Routing, dedupe, de remmen, escalatie en
levering zitten allemaal in de poort, niet in het tablet. Zo blijft er één plek
waar bepaald wordt of er een CTA komt, ook als er straks meer bronnen bij komen.

| Actie op het tablet | Wordt |
|---|---|
| Wil bestellen | CTA 9 (§5.9) |
| Wil afrekenen | CTA 10 (§5.10) |
| Bestelling klopt niet | CTA 11 (§5.11) |
| Roep LG | CTA 12 (§5.12) |

### §10.2 Tafel → kelner

Na het intoetsen toont het tablet direct het tafelnummer plus de naam van de kelner
die de tafel heeft, zodat de melder ziet waar het heen gaat: "→ verzonden naar
Rutger". Cache maximaal `lookup_cache` — een wijkwissel moet snel doorkomen.

Het tablet **vraagt** die naam op bij de poort en leidt hem nergens uit af. De
lookup zelf gebruikt de routing uit §3: de eigenaar van de wijk waarin de tafel
valt. Bij het daadwerkelijk versturen bepaalt de poort opnieuw wie het wordt — de
getoonde naam is een weergave, geen afspraak.

**Dit wijkt af van de opdracht.** Die beschrijft een lookup per tafel — "wie heeft
de tafel open of aangeslagen". Dat geeft een andere uitkomst dan §3.2, waar
eigenaarschap op wijk-niveau ligt en pas verschuift bij een meerderheid. Twee
routings naast elkaar betekent dat een CTA 9 bij een andere kelner kan landen dan
een CTA 1 voor dezelfde tafel, op hetzelfde moment. **§3 is leidend.**

Onbekende tafel: melding op het tablet, geen verzending. Geen eigenaar: §3.4.

### §10.3 Dedupe en de recente-bestelling-check

**Dedupe.** Dezelfde tafel plus hetzelfde actietype binnen `dedupe_venster` levert
geen tweede CTA op. Het tablet toont "al doorgegeven aan [kelner] ([X] min geleden)"
met een knop "toch opnieuw sturen". Die knop schrijft wél een CTA weg en wordt apart
geteld.

**Recente-bestelling-check.** Bij "wil bestellen": is er korter dan
`recente_order_venster` geleden op die tafel aangeslagen, dan eerst "zojuist besteld
— toch doorgeven?" vóór er iets wordt weggeschreven.

**Beide beslissingen zitten in de poort, niet in het tablet** (§10.1). Het tablet
stuurt zijn commando, krijgt terug dat er al gemeld is of dat er net besteld is,
toont dat, en stuurt bij "toch doorgeven" hetzelfde commando opnieuw met een vlag
dat de melder de waarschuwing heeft gezien.

Ze komen vóór de remmen: ze voorkomen dat er een CTA ontstaat, en verschijnen dus
niet in de CTA-log van §6.2 — wel in `beachalert_events` (§10.5). Block by busy en
de tempo-limiet komen daarna en kunnen de CTA alsnog tegenhouden, mét logregel
(§6.3).

### §10.4 Roep LG

Twee stappen: eerst de locatie (bar/pas, seat, strandbar, eventlocatie), dan
optioneel een categorie (gast, personeel, technisch, anders) die overgeslagen mag
worden. Beide komen mee in de kaart van CTA 12.

### §10.5 Wat hier níét in staat

Deze paragraaf beschrijft Beachalert alleen als bron van CTA's. De rest staat in de
eigen opdracht en hoort niet in deze spec: de launcher met tegels en de configuratie
per tablet, de team-PIN op de buitentablet, de UI-eisen (touch-doelen, contrast,
taal, drie taps), en de eigen tabellen.

**Wel geldt dit over de tabellen.** `beachalert_events` legt meer vast dan de
CTA-log van §6.2: ook signalen die nooit een CTA werden, zoals dedupe-hits en
afgebroken bevestigingen. Het is de rijkere bron; §6.2 gaat alleen over wat er
daadwerkelijk naar een handy is gestuurd. Wat in beide staat moet uit dezelfde
schrijfactie komen, anders ontstaan er twee waarheden over hetzelfde signaal.

---

## §11 De CTA-backend

### §11.1 Vijf lagen

De backend is de centrale applicatie die alle CTA's bepaalt. Vijf lagen, elk met
één taak:

| Laag | Taak |
|---|---|
| **Monitor** | Leest continu de POS-database: tafels, tickets, aanslagen, wijken, kelners. Houdt de actuele toestand bij per tafel, per wijk, per kelner |
| **Triggers** | Bepaalt of er een CTA moet **ontstaan** (§11.2) |
| **Poort** | Bepaalt of die CTA ook **verstuurd** wordt (§2.15) |
| **Transport** | Schrijft het CTA-record weg; ontvangt de webhook met de respons |
| **Log** | §6.2 en §6.3, inclusief wat er is tegengehouden |

**Triggers en poort zijn niet hetzelfde.** Een CTA kan volkomen terecht ontstaan
en tóch niet verstuurd worden: de kelner deed net iets, het venster zit vol, of
die CTA staat voor deze zaak uit. Dat zijn andere instellingen, met andere
beheerders, en ze horen op andere schermen (§11.3).

Externe bronnen — Beachalert (§10), later de seating-app en het dashboard — komen
**niet** bij de monitor binnen maar rechtstreeks bij de poort. Dat is de reden dat
die laag apart staat: hij is het enige punt waar alles doorheen gaat.

### §11.2 Triggers: vaste logica, instelbare getallen

Elke trigger is code die doet wat §5 beschrijft. In de database staan alleen de
tijden en drempels, per locatie (§7).

Een nieuwe CTA is dus een bouwopdracht mét een nieuwe paragraaf in dit document.
Dat is bewust: zet je de triggers als records in een tabel, dan verhuist de
waarheid over het gedrag van de spec naar de database, en is er geen document
meer dat klopt.

Een nieuwe **drempel** is wel één veld en geen deploy.

Overwegen we later alsnog regels uit records, dan is het signaal daarvoor: de
derde of vierde keer dat er om een CTA gevraagd wordt die niets nieuws doet en
alleen andere getallen heeft. Tot die tijd is het complexiteit zonder aanleiding.

### §11.3 Instellingen

Drie soorten, en ze horen niet bij elkaar op één scherm:

| Soort | Voorbeelden | Wie |
|---|---|---|
| **Wanneer ontstaat een CTA** | `cta1_check_delay`, `cta2_sleep_threshold`, `cta6_after_starter` (§7.2) | Kantoor |
| **Wanneer wordt hij tegengehouden** | `kelner_idle`, `cta_max_per_window`, status per CTA, CTA-niveau (§7.1, §7.4, §2.11) | Kantoor |
| **Vaste inrichting** | Wijken en hun tafelbereik (§3.1), LG-routing (§7.5) | Kantoor |

**Alles wordt door kantoor ingesteld** (Peter, 12-09-2026). Eén plek, overal
dezelfde getallen, en verschillen tussen zaken komen dan uit de vloer en niet uit
de configuratie.

Aanvaard gevolg: een LG die op zaterdagavond merkt dat zijn team overspoeld wordt,
kan zelf niets. Dat maakt twee dingen belangrijker dan ze anders waren geweest:

- **Begin op niveau 1** (§2.11). Opschalen als het goed gaat is makkelijk;
  terugschalen nadat kelners zijn afgehaakt is dat niet.
- **Zorg dat een LG het wél kan melden**, en dat daar snel op gereageerd wordt.
  Een LG die drie weken op een wijziging wacht, gaat zijn team vertellen dat ze
  de meldingen mogen negeren — en dan is §2.13 niet meer te meten, want dan meet
  je alleen nog die afspraak.

**Twee niveaus.** Een systeembrede standaardwaarde, en per locatie een afwijking.
Een zaak die niets instelt volgt de standaard; een wijziging aan de standaard
werkt door bij iedereen die niets eigens heeft gezet.

**Elke wijziging wordt vastgelegd**: wat, van welke waarde naar welke, door wie en
wanneer. Zonder dat is een verandering in de logs (§2.13) niet te verklaren — je
ziet dat CTA 2 ineens vaker vuurt en weet niet dat iemand de drempel halveerde.

**De adoptie-ramp is één knop.** Het CTA-niveau (§2.11) zet in één keer de juiste
CTA's aan en de rem strak. Wie niet per parameter wil sleutelen, hoeft alleen dat
te bedienen — ook bij kantoor is dat de knop waar je in de praktijk aan draait.

### §11.4 Het LG-dashboard

De LG ziet zijn wijken, elk groen, oranje of rood volgens §4.2.

**Een wijk kleurt, geen persoon.** Rood betekent: hier is hulp nodig. Het betekent
niet dat de kelner tekortschiet — een wijk kan roodlopen omdat er drie tafels
tegelijk binnenkwamen.

Daarom gelden voor dit scherm de volgende regels:

- **Geen scores of ranglijsten achter namen.** Geen cijfer, geen percentage, geen
  volgorde van slechtste naar beste kelner.
- **Geen rekenregels op het scherm.** De LG hoeft niet te zien uit welke zes
  drempels de kleur volgt; hij moet zien wáár hij heen moet.
- **Wel de reden, in gewone taal.** "Vier tafels wachten op een eerste bestelling"
  zegt wat er te doen is. "Achterstandsscore 0,72" zegt niets en beschadigt.

Dit scherm beantwoordt één vraag: **waar moet ik nu heen?** Alles wat die vraag
niet beantwoordt, hoort er niet op — hoe interessant het ook is.

Wat een kelner over langere tijd nodig heeft, staat in het periodesrapport (§11.6).
Dat is een andere vraag, met een ander tempo. Een LG die midden in een service
"deze kelner heeft training nodig" in beeld krijgt, behandelt het als iets dat nu
moet, en dat is het niet.

### §11.5 Als de backend eruit ligt

| Onderdeel | Gedrag |
|---|---|
| Handy's | Blijven tonen wat er al staat. Knoppen blijven werken; responses lopen achter |
| Monitor en triggers | Stil. Er ontstaan geen nieuwe CTA's |
| Beachalert | Krijgt `POORT_ONBEREIKBAAR` en toont een handelingsperspectief (§10) |
| LG-dashboard | Toont wanneer de gegevens voor het laatst zijn bijgewerkt |

**Geen inhaalslag bij herstel.** Komt de backend terug na twintig minuten stilte,
dan worden de gemiste triggers **niet** alsnog afgevuurd. Dat zou een stapel
kaarten opleveren over tafels die inmiddels afgerekend zijn, precies op het moment
dat het toch al een rommeltje is. De triggers beginnen opnieuw vanaf de actuele
toestand.

Wat er wél gebeurt: de stilte wordt gelogd, zodat achteraf te zien is waarom er
een gat in de cijfers zit.

### §11.6 Het periodesrapport

Eén overzicht per zaak, per periode van vier weken: hoe staat het team ervoor.

**Waarom niet wekelijks.** Escalaties per kelner per week zijn kleine getallen.
Van drie naar vijf ziet eruit als zeventig procent meer en is vrijwel zeker ruis.
Over vier weken staat er genoeg onder om iets te durven zeggen, en het volgt het
periode-ritme dat er toch al is. Een trainingsgesprek voer je ook niet wekelijks.

De vier weken staan wél apart in het rapport, zodat te zien is of er iets
veranderde na week twee.

**Escalatie is het signaal.** Een kelner die het niet aankan wordt geholpen — dat
is wat escalatie doet (§2.16), en dat is meteen de belangrijkste waarneming. Dat
het bij dezelfde kelner blijft gebeuren, is wat je in een week terugziet. Er is
dus geen apart trainingsmechanisme nodig: het rapport kijkt terug op wat er toch
al gebeurde.

Het rapport komt volledig uit de log (§6.2, §6.3). Geen extra registratie, geen
aparte beoordeling, niets wat de kelner niet zelf ook kan navertellen.

#### Wat erin staat

- Hoe vaak er geëscaleerd is, per kelner en per wijk
- Waar het over ging: welke CTA's het vaakst tot een escalatie leidden
- Het verloop over de vier weken, en het verschil met de vorige periode
- Waarnemingen in gewone taal, met de omstandigheden erbij

#### Vergelijken met wat

Nooit met collega's op ruwe aantallen. De kelner met de drukste wijk krijgt de
meeste CTA's; een ranglijst op aantallen zet degene met de zwaarste sectie
onderaan, en dat is de omgekeerde conclusie.

Wel:

- **met zichzelf over tijd** — is het beter of slechter geworden
- **met het team bij vergelijkbare drukte** (§4.2) — niet bij vergelijkbare klok

#### Niet elke CTA zegt evenveel

| Signaal | Wat het zegt |
|---|---|
| **CTA 11** bestelling klopt niet | Orderaccuratesse. Schaalt nauwelijks met drukte — het scherpste signaal dat we hebben |
| **CTA 3** tafel buiten de seater om geopend | Procedure. Heeft weinig met drukte te maken |
| **CTA 6 / 8** tweemaal `NO`, dan autofire | Gangbewaking. Deels vakmanschap, deels keuken |
| **CTA 1 / 2** verlopen | Schaalt sterk mee met werklast. Alleen betekenisvol na normalisatie |
| **CTA 9 / 10** geëscaleerd | Responsiviteit — maar een handy in de broekzak ziet er in de data hetzelfde uit als onwil |

De onderste drie rijen zeggen weinig zonder de drukte erbij. Zet ze niet naast
elkaar alsof ze hetzelfde wegen.

#### Hoe het opgeschreven staat

Niet: *Daan — achterstandsscore 0,72.*

Wel: *Bij Daan verloopt CTA 1 ongeveer tweemaal zo vaak als bij de rest van het
team bij vergelijkbare drukte, vooral tussen 19:00 en 20:00.*

Het tweede is te bespreken en te weerleggen — misschien kreeg hij drie keer per
avond een groep van twaalf. Het eerste kun je alleen ondergaan. Dat verschil
bepaalt of een LG dit gebruikt of na drie weken wegklikt.

#### Wat er niet in staat

Geen ranglijst van slechtste naar beste, geen cijfer achter een naam, geen
voorspelling over wie gaat uitvallen. Het rapport is een vertrekpunt voor een
gesprek, niet de uitkomst ervan.

#### Wie het krijgt

| Wie | Wat |
|---|---|
| LG van de zaak | Het volledige rapport van zijn team |
| Kantoor | Alle zaken |
| Kelner | Zijn eigen deel, **op verzoek**, via de staff-app |

De kelner krijgt het dus niet uit zichzelf, maar kan het opvragen wanneer hij wil.
Dat vraagt van de staff-app een koppeling naar dit rapport en een manier om de
ingelogde medewerker aan de kelner in de CTA-log te knopen — zie O19.

Inzagerecht bestaat sowieso; "op verzoek" is dus het minimum en geen gunst. Wat
hier besloten is, is dat het via een bestaand kanaal loopt dat de kelner al kent,
in plaats van via een formulier bij kantoor.

Open: O15 (instemmingsrecht), O19 (koppeling staff-app).

---

*Gereconstrueerd op 12-09-2026 uit `docs/oscar_CTA_uitleg.html` (juni 2026),
`index.html` (juli 2026), `Oscar_CTAs.pdf` (maart 2026) en 41 commits.
Ter herziening.*
