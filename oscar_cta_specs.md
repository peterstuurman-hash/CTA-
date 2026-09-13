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
- `docs/oscar_CTA_uitleg.html` is op 12-09-2026 herschreven naar de stand van dit
  document. Hij loopt dus niet meer achter, maar blijft een **samenvatting**: bij
  tegenspraak wint deze spec (§1.1). Wijzig je hier iets wat de uitleg ook noemt,
  werk hem dan mee bij — en genereer de PDF opnieuw:
  `chrome --headless=new --no-pdf-header-footer --print-to-pdf=docs/oscar_CTA_uitleg.pdf docs/oscar_CTA_uitleg.html`

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

**En er is één uitzondering:** een oproep aan de LG (§5.12) gaat naar álle
ingelogde LG's tegelijk. Deze regel gaat over een CTA die bij één bepaalde kelner
hoort; bij een oproep maakt het niet uit wie er komt.

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

Dit is de derde rem, naast §2.3 en §2.7, en hij werkt op een andere as: hij
begrenst de **dichtheid**, ook als de kelner steeds net rustig was. Een CTA die
hierop sneuvelt wordt gelogd (§6.3).

**Hij begrenst niet het totaal over een dienst.** Dat stond hier eerder wel, en
dat was onjuist. Het venster schuift mee, dus over een hele avond telt niemand
mee. Kies de waarde daarom op wat hij per uur betekent, niet op wat het getal
suggereert:

| Instelling | Per uur | Over een dienst van 5 uur |
|---|---|---|
| 1 per 15 min | 4 | ~20 |
| 2 per 15 min | 8 | ~40 |
| 3 per 15 min | 12 | ~60 |
| *6 per 10 min (oude demo-waarde)* | *36* | *~180* |

**Geen hard maximum per dienst.** Dat klinkt als de oplossing, maar dan valt het
systeem halverwege de avond stil — inclusief de meldingen die er wél toe doen.
Een gast die wil afrekenen krijgt dan niets omdat er 's middags te veel timers
zijn afgegaan. Stilte op het verkeerde moment is erger dan een melding te veel.

Een beheerscherm hoort de omrekening te tonen naast de instelling: wie alleen
`3` en `900` ziet, kan niet beoordelen of dat veel is.

**Uitzondering: de mens-CTA's** (9 t/m 12, §2.15). Die worden nooit tegengehouden
— maar ze **tellen wel mee** voor het venster.

Dat verschil is het hele punt. Kreeg een kelner net drie meldingen van de vloer,
dan houdt Oscar zijn eigen timer-CTA's even in. Menselijke signalen verdringen dus
de systeemmeldingen, en niet andersom: er staat iemand te wachten, en dat weegt
zwaarder dan een timer.

Zou je ze helemaal buiten de telling laten, dan begrenst niets hun aantal meer en
zegt het maximum niets meer over wat er binnenkomt.

**Uitzondering: de mens-CTA's** (9 t/m 12, §2.15). Die worden nooit tegengehouden
— maar ze **tellen wel mee** voor het venster.

Dat verschil is het hele punt. Kreeg een kelner net drie meldingen van de vloer,
dan houdt Oscar zijn eigen timer-CTA's even in. Menselijke signalen verdringen dus
de systeemmeldingen, en niet andersom: er staat iemand te wachten, en dat weegt
zwaarder dan een timer.

Zou je ze helemaal buiten de telling laten, dan begrenst niets hun aantal meer en
zegt het maximum niets meer over wat er binnenkomt.

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
| 2 · Gemiddeld | 1, 2, 3, 6, 8, 9, 10, 11, 12 | 20 sec | 2 |
| 3 · Volledig | alle | 10 sec | 3 |

`cta_window` is op elk niveau 900 sec. Wat dat per uur betekent, staat in §2.8.

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

**3 · Leveringsbevestiging.** De handy koppelt terug aan Oscar: afgeleverd,
gelezen, en de knop die is ingedrukt. Komt er binnen `mens_delivery_timeout` geen
bevestiging, dan geldt de CTA als niet afgeleverd en volgt alsnog de fallback.

Dat is een **bevestiging en geen gok**: een kelner die de kaart wél heeft gezien
maar even bezig is, krijgt dus géén uitwijk over zich heen. Alleen een melding die
de handy echt niet haalt, wijkt uit.

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

### §2.17 Het contract met een bron

Een bron praat op precies drie manieren met de poort. Deze paragraaf is de
**normatieve** definitie: de backend en het vloertablet staan in verschillende
repo's, en beide implementaties zijn hiervan afgeleid — niet van elkaar. Wijkt
code hiervan af, dan is dat een fout in die code (§1.1).

**1 · Welke acties staan aan?** Antwoord: de lijst signaal-acties die voor deze
locatie `enabled` zijn (§2.10). Een bron toont alleen die knoppen.

**2 · Wie heeft deze tafel?** Antwoord: bestaat de tafel, en de naam van de
huidige ontvanger. Alleen om te tonen; bij het versturen bepaalt de poort
opnieuw wie het wordt (§10.2).

**3 · Neem dit signaal aan.**

| Veld | Wat |
|---|---|
| `locatie` | Welke zaak |
| `bron` | `tablet` · `seating_app` · `dashboard` · `handy_pos` |
| `device` | Alleen bij een tablet |
| `melder` | Personeelsnummer, als de ingang de ingelogde medewerker kent |
| `actie` | `wil_bestellen` · `wil_afrekenen` · `check_bestelling` · `roep_lg` |
| `tafelnr` | Leeg bij `roep_lg` |
| `lg_locatie`, `lg_categorie` | Alleen bij `roep_lg` (§10.4) |
| `doorgedrukt` | De melder zag een waarschuwing en koos toch te versturen |

Het antwoord bevat de **uitkomst**, de naam van de ontvanger als er een is, het
**signaal-id** waarmee de bron zijn eigen registratie aan de onze kan knopen, en
bij `al_gemeld` het tijdstip van de vorige melding.

| Uitkomst | Wat de bron toont |
|---|---|
| `aangenomen` | "Verzonden naar Rutger" |
| `aangenomen_naar_lg` | "Geen kelner op deze tafel — doorgegeven aan de LG" |
| `onbekende_tafel` | Tafelnummer bestaat niet in deze zaak |
| `tafel_niet_open` | Nummer klopt, tafel is niet geseat |
| `al_gemeld` | "Al doorgegeven aan Rutger (2 min geleden)" + toch doorgeven |
| `recent_besteld` | "Zojuist besteld — toch doorgeven?" |
| `geweigerd` | Eigen tekst bij de meegestuurde reden |

Bij `geweigerd` stuurt de poort een **code** en geen zin: `cta_uit`, `te_druk`,
`tempo_vol` of `anders`. De bron schrijft zelf de tekst, zodat er nooit iets over
de motor op een scherm komt dat een gast kan zien (§11.4). Een code die de bron
niet kent, valt terug op een neutrale zin.

Is de poort onbereikbaar, dan is dat geen uitkomst maar een storing: de bron toont
een handelingsperspectief en belooft niets.

### §2.18 Actualiteit — geen loze meldingen

Een CTA heeft niet alleen een **trigger** maar ook een **geldigheidsvoorwaarde**:
de reden waarom hij bestaat. Die wordt op drie momenten opnieuw gecontroleerd:

1. bij het ontstaan
2. **op het moment dat hij getoond zou worden** — uit de wachtrij, of na uitstel
3. zolang hij op de handy staat

Is de reden weg, dan vervalt hij. Hij wordt niet getoond, en als hij al stond,
verdwijnt hij.

**Waarom dit nodig is.** Tussen ontstaan en tonen zit tijd. Er staan maximaal
drie kaarten op een handy (§2.3) en er is een tempo-limiet (§2.8), dus op
niveau 1 kan een CTA een kwartier in de wachtrij staan. In dat kwartier kan de
kelner precies datgene hebben gedaan waar de melding over ging.

Een voorbeeld waar het misgaat zonder deze regel:

```
19:02  CTA 1 ontstaat op tafel 3 — nog niets besteld
19:02  tegengehouden: de kelner deed net iets  → wachtrij
19:04  runner meldt "wil bestellen" op tafel 3 → CTA 9 gaat direct door (§2.8)
19:05  de kelner neemt de bestelling op
19:17  het venster loopt af → CTA 1 komt uit de wachtrij
```

Zonder controle komt er om 19:17 een kaart "tafel 3 — first order" op een tafel
die al twaalf minuten heeft besteld. Dat is precies de melding die kelners leert
dat het systeem niet meekijkt.

#### Wat per CTA de voorwaarde is

| CTA | Vervalt zodra |
|---|---|
| 1 · First order | er een POS-order op de tafel staat |
| 2 · Sleeping table | er sindsdien een kelner-actie is geweest |
| 3 · Seater actief | de tafel inmiddels geseat is |
| 5 · Offer a coffee | het druk is geworden (§4.1) |
| 6 · Ready for main | het hoofdgerecht al gefired is |
| 7 · Actief-check | de kelner inmiddels iets heeft aangeslagen |
| 8 · Ready for dessert | het dessert al gefired is |
| 9 · Gast wil bestellen | er ná het melden is aangeslagen op die tafel |
| 10 · Gast wil betalen | de rekening is aangeslagen of het ticket gesloten |
| 11 · Bestelling klopt niet | — de melding blijft geldig tot iemand hem afhandelt |
| 12 · Roep LG | een collega-LG hem heeft opgepakt (§5.12) |
| 13 · Uitnodigen | het druk is geworden |
| 14 · Wervingskaartje | het druk is geworden |

Voor élke CTA geldt daarnaast: een **gesloten ticket** laat hem vervallen. Dat is
§2.5, maar dan ook voor wat nog in de wachtrij staat.

#### Twee momenten bij CTA 9, en ze zijn niet hetzelfde

Bij "wil bestellen" wordt twee keer naar dezelfde tafel gekeken, met een ander
gevolg:

| Wanneer | Wat er gecheckt wordt | Gevolg |
|---|---|---|
| **Bij het intoetsen** | Is er binnen `recente_order_venster` vóór de melding aangeslagen? | Het tablet vraagt "zojuist besteld — toch doorgeven?" De runner kan doordrukken (§5.9) |
| **Vóór het tonen** | Is er ná de melding aangeslagen? | De CTA vervalt. Geen vraag, geen venster |

Het eerste is een **marge**: de kelner was er misschien net, en de runner weet dat
niet. Daar hoort een venster bij, en de runner mag het overrulen — hij heeft de
gast gesproken.

Het tweede is **geen marge maar een feit**: er is besteld nadat de gast erom
vroeg. Dan is de melding klaar, ook als de runner had doorgedrukt. Daar is geen
getal voor nodig.

**Nog een geval, als de POS het prijsgeeft.** Een kelner die tafel 3 open heeft
staan in de POS maar nog niets heeft verzonden, is er al mee bezig. Een melding
sturen heeft dan geen zin. Of die toestand uit WaiterPro te lezen is, staat open
— O25.

#### Loggen

Een CTA die hierop vervalt krijgt `actie = vervallen_aanleiding_weg` (§6.2), te
onderscheiden van `vervallen_levensduur`. Dat is een nuttig getal op zichzelf:
het zegt hoe vaak het systeem op het punt stond iets te melden dat al geregeld
was. Loopt dat op, dan staan de timers te scherp of is de wachtrij te lang.

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
| §4.4 Verwachte drukte | de bezetting van een service | CTA 3 |

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

### §4.4 Verwachte drukte (forecast)

De forecast is het aantal couverts dat voor een service verwacht wordt. Hij komt
uit het reserveringssysteem en zegt iets heel anders dan §4.1: niet hoe hard het
nú loopt, maar hoeveel er is ingekocht en ingeroosterd.

Daarom wordt hij maar voor één ding gebruikt: bepalen of er een **seater**
ingeroosterd staat (§5.3). Boven `cta3_forecast_min` couverts is dat altijd zo.

**Dit is geen terugkeer van de geschrapte "verwachte drukte".** Dat besluit
(§8.2, 14-06-2026) ging over werkdruk: een forecast voorspelt niet hoe hard het op
dat moment loopt, en daarvoor is de order-rate gebruikt. Hier gaat het niet over
werkdruk maar over bezetting — een roosterfeit, en dat is precies wat een forecast
wél voorspelt.

De forecast wordt nergens anders voor gebruikt. Zeker niet voor CTA 5 (§5.5), die
kijkt naar de actuele order-rate.

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

**Trigger** Een kelner opent een niet-geseate tafel terwijl er een seater staat.

**Er staat een seater** = de forecast voor deze service is ten minste
`cta3_forecast_min` couverts. Boven die grens wordt er altijd een seater
ingeroosterd, dus dat is een directer gegeven dan het afleiden uit plaatsingen
(§4.4).

Dat is meteen de reden dat deze CTA bestaat: juist als het druk is lopen gasten
langs de seater heen, en juist dan opent een kelner een tafel die niet geseat is.

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

Zoals voor elke mens-CTA gelden §2.7 en §2.8 hier niet — en bij een oproep aan de
LG is de reden het duidelijkst:

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

#### Routing

Wie de LG is komt uit de devicedata: de ingelogde medewerkers met de rol LG. Is er
niemand met die rol ingelogd, dan valt hij terug op de vaste instelling per zaak
(`lg_routing`, §7.5).

**Een oproep gaat naar álle ingelogde LG's tegelijk.** Wie als eerste `GO` drukt
pakt hem; bij de anderen verdwijnt de kaart direct, met de melding dat een collega
gaat.

```
LG gevraagd — bar        →  Mark
                         →  Sanne

Sanne drukt GO           →  bij Mark weg: "Sanne gaat"
```

Dit is een bewuste uitzondering op §2.2. Die regel gaat over een CTA die bij één
bepáálde kelner hoort, waar het uitmaakt wie hem krijgt. Bij een oproep maakt dat
niet uit: als er maar iemand komt. Breed uitzetten maakt bovendien de kans dat een
oproep blijft liggen een stuk kleiner, en dat is precies het risico uit §5.12.

**In de log** staat één regel per handy waar de kaart op kwam (§6.2): `go` bij
degene die hem pakte, `ingetrokken` bij de rest. Zo blijft de responstijd te meten
en is te zien hoeveel LG's er op dat moment beschikbaar waren.

#### Als de LG niet reageert

**Geen escalatieketen.** Geen tweede LG, geen kantoor, geen doorschuiven. Vijftien
jaar lang was de oplossing dat iemand ging lopen en hem opzocht. Dat blijft het
vangnet, en het werkt.

Het systeem doet drie dingen, en die zijn alle drie klein:

1. **De kaart blijft staan.** Hij vervalt niet en staat vooraan op de handy.
2. **Het tablet meldt het bij een volgende oproep** voor dezelfde plek: "vorige
   oproep (21:14) is niet opgepakt".
3. **Het bevestigingsscherm belooft niets.** "Doorgegeven aan de LG", niet "de LG
   komt eraan".

Punt 2 en 3 zijn er voor het enige dat door dit systeem echt slechter kan worden:
een melder die stopt met zoeken omdat hij denkt dat het geregeld is. Zonder tablet
bleef hij kijken. Dat gedrag moeten we niet afleren voor iets dat misschien niet
aankomt.

**Geen prioriteitsknop.** We kunnen niet weten of een oproep dringend is of onzin,
en de melder het zelf laten aangeven werkt niet — binnen een week is alles urgent.
De categorie (§10.4) geeft de LG een hint, verder is het aan hem. Hij kent zijn
zaak; het systeem niet.

**Eerst meten.** Hoe vaak een oproep niet wordt opgepakt staat in de log (§6.2).
Blijkt dat vaak te gebeuren, dán is er aanleiding voor een tweede ontvanger — met
cijfers erbij in plaats van vooraf bedacht (§2.13).

**Mens-CTA** (§2.15): delivery-check en fallback volgens §2.16. Is de handy van de
LG offline, dan geldt hetzelfde: de melder ziet het bij een volgende oproep, en
loopt.

### §5.13 CTA 13 — Uitnodigen? (voorstel)

> **Fase 1, maar `disabled`.** Besloten 12-09-2026. De trigger wordt gebouwd en
> shadow-logt vanaf dag één (§6.3), zodat er cijfers zijn tegen de tijd dat je wilt
> beslissen of hij aan gaat. Aanzetten kan pas als O18 rond is.

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

> **Fase 1, maar `disabled`.** Besloten 12-09-2026. De trigger wordt gebouwd en
> shadow-logt vanaf dag één (§6.3). Blijkt hij één keer per week te vuren, dan
> gaat hij er weer uit (§2.13).

**Doel** Personeelswerving onder gasten die in de buurt wonen. De CTA is het
zetje om het wervingskaartje te geven en te vragen of ze nog iemand kennen.

**Trigger** De postcode op de reservering staat in `cta14_postcodes` van deze
locatie, **en** het is niet druk (§4.1), **en** `cta14_moment` is bereikt.

**De postcode komt uit de reservering.** Staat er geen postcode op — een walk-in,
of een reservering zonder adresgegevens — dan gebeurt er niets. Geen CTA, geen
gok, geen afleiding uit iets anders.

Hoeveel tafels per avond er dan overblijven weet nu niemand. Dat is precies wat de
shadow-log (§6.3) laat zien in de weken dat hij op `disabled` staat: hoe vaak hij
zóú vuren. Blijkt dat één tafel per week, dan is het de moeite niet.

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
cta_nr;datum;tijd;medewerker_id;tafelnr;status;actie;gelezen_sec;response_sec
1;2026-06-12;19:42:13;M-0412;14;enabled;ORDER;4;12
```

**`medewerker_id` is het personeelsnummer**, hetzelfde nummer dat WaiterPro, de
staff-app en de loonadministratie gebruiken. Geen naam. De naam wordt erbij
opgezocht op het moment dat iets getoond wordt.

Twee redenen. Het rapport (§11.6) telt op over vier weken, en dat moet blijven
kloppen bij twee medewerkers met dezelfde voornaam of bij iemand die van
achternaam verandert. En de staff-app heeft iets nodig om "mijn eigen deel" op te
halen; een naam is daar geen sleutel voor.

Bijvangst: in de tabel waar alle analyses op draaien staat daarmee geen enkele
naam.

Twee tijden, en dat onderscheid is belangrijk (§6.4):

- `gelezen_sec` — tijd tussen push en het moment dat de kaart op de handy stond
- `response_sec` — tijd tussen push en de knopdruk

Bij verval en bij onderdrukking blijven ze allebei leeg.

Eén CTA kan meer dan één regel opleveren als hij naar meer dan één handy ging —
dat gebeurt alleen bij CTA 12 (§5.12). De regel van degene die hem pakte krijgt
`go`, de rest `ingetrokken`.

Vastgelegd wordt elke **afgeronde** CTA — een kelner-respons óf een verval — en
elke CTA die wél zou afgaan maar de handy niet haalt (§6.3). Een CTA die nog open
staat, staat nog niet in de database.

De kolom `medewerker_id` blijft leeg bij `geen_wijk` (§6.3): er was dan per
definitie geen kelner om naar te routeren.

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
staat er wél een `medewerker_id` — degene naar wie hij uiteindelijk ging. Een escalatie naar de LG (§2.16, stap 4) is een gewone nieuwe CTA en krijgt
dus een eigen `enabled`-regel, niet een van deze.

`deleted` logt niets — dat is het enige verschil met `disabled`.

Zonder deze regels is niet te zien hoeveel meldingen de remmen tegenhouden, en dus
ook niet of niveau 1 te streng staat om naar niveau 2 te gaan (§2.11). Dat maakt
opschalen een gok in plaats van een beslissing.

### §6.4 Afgeleverd, gelezen, beantwoord

De handy stuurt terug wat er met een kaart gebeurt: dat hij is afgeleverd, dat hij
is gelezen, en welke knop er is ingedrukt. Dat geeft drie momenten in plaats van
één, en het verschil ertussen meet iets anders.

| Van → naar | Wat het meet |
|---|---|
| Push → afgeleverd | Of het transport werkt: netwerk, handy aan, iemand ingelogd |
| Afgeleverd → gelezen | Of de kelner zijn handy in zicht heeft. Een lange tijd hier is een broekzak, geen onwil |
| Gelezen → knop | De beslissing van de kelner. Dít is zijn responstijd |

**Reken een kelner alleen af op de derde.** De eerste twee gaan over apparatuur en
omstandigheden. Zonder dat onderscheid meet je in het periodesrapport (§11.6) voor
een deel de dekking van het wifi, en presenteer je dat als het functioneren van een
medewerker.

Wat precies wordt teruggekoppeld staat nog niet vast — O22.

---

## §7 Parameters

Elk getal in de bouw komt hiervandaan. Staat een getal alleen in §5 en niet hier,
dan is dat een fout in dit document.

### §7.0 Startwaarden, geen besluiten

Elk getal hieronder is **per locatie instelbaar** en wordt beheerd door kantoor
(§11.3). Wat er staat is de waarde waarmee een zaak begint als er niets is
ingesteld — een startwaarde, geen vastgesteld beleid.

**Twee niveaus, en dat is een mechanisme en geen formaliteit.** In de backend
draait één systeembrede standaard; een locatie kan daarvan afwijken. Een zaak die
niets instelt volgt de standaard, en blijft die volgen: wordt de standaard later
gewijzigd, dan werkt dat bij haar door. Een zaak die wél een eigen waarde heeft
gezet, blijft daarbij tot iemand hem terugzet.

Het beheerscherm moet dat verschil tonen. "Volgt de standaard (1800)" is iets
anders dan "eigen waarde: 1800", ook al staat er hetzelfde getal. Zonder dat
onderscheid weet niemand waarom een wijziging aan de standaard bij vier zaken
werkte en bij drie niet.

Daarom staat er bij elk getal een **herkomst**. Drie soorten:

| Herkomst | Betekenis |
|---|---|
| maart 2026 | Uit de oude PDF. Nooit herbevestigd |
| besluit | Vastgesteld, met datum in §8.2 |
| startwaarde | Door ons ingevuld om te kunnen beginnen. Vervangen zodra er data is |

**Een startwaarde is geen AANNAME die blijft staan.** Vóór de eerste zaak live
gaat wordt er geijkt op de shadow-log (§6.3): zet de CTA's op `disabled`, laat ze
een paar weken meelopen, en kijk hoe vaak ze zóúden vuren. Dat is een beter
fundament dan een schatting aan tafel, en het kost niets — het loopt mee terwijl
er nog niets op de vloer gebeurt.

Wat níét op deze manier te bepalen is, staat in §9: een bedrag dat het huis moet
kiezen, een tegenspraak tussen twee bronnen, een grondslag die getoetst moet
worden. Die vragen gaan niet weg door te meten.

### §7.1 Systeembreed

| Parameter | Default | Herkomst | Wat |
|---|---|---|---|
| `max_kaarten_zichtbaar` | 3 | uitleg | Kaarten tegelijk op een handy (§2.3). **Vast** — niet per locatie instelbaar |
| `log_live_regels` | 500 | uitleg | Lengte van het rollende live log (§6.1) |
| `kelner_idle` | 60 / 20 / 10 sec | niveau 1 en 2 uit de demo, niveau 3 startwaarde | Geen CTA binnen X sec na de laatste kelner-actie (§2.7) |
| `cta_max_per_window` | 1 / 2 / 3 | besluit 12-09-2026, per niveau | Tempo-limiet per handy (§2.8) |
| `cta_window` | 900 sec | besluit 12-09-2026 | Venster voor de tempo-limiet |
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
| `cta3_forecast_min` | 150 couverts | besluit 12-09-2026 | Forecast vanaf waar er altijd een seater staat (§4.4, §5.3) |
| `cta5_bedrag_pp` | TODO (O5) | — | Besteding per persoon vanaf welke de koffie mag |
| `cta5_postpone_time` | TODO (O6) | — | Wachttijd bij `WAIT` |
| `cta5_cooldown_dagen` | 30 | maart 2026 | Min. dagen tussen gifts per herkende gast |
| `cta6_after_starter` | 1200 sec | uitleg ("default 20 min") | Na het voorgerecht → kaart |
| `cta6_repush` | 300 sec | demo (backend-waarde) | Terugkomen na `NO` |
| `cta6_autofire` | 300 sec | uitleg ("na 5 min") | Automatisch firen na de laatste `NO` |
| `cta6_max` | 2 | uitleg + demo | Max. kaarten per ticket |
| `cta7_inactief_drempel` | 1800 sec | startwaarde | Stilte voor de actief-check (§5.7) en de grens voor "stil" (§4.3) |
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
| `cta3_piek_lunch_start` / `_eind` | Piekuren geschrapt: CTA 3 kijkt naar de forecast, niet naar de klok |
| `cta3_piek_diner_start` / `_eind` | idem |
| `cta3_forecast_lunch_min` | Vervangen door één `cta3_forecast_min` voor beide services |
| `cta3_forecast_diner_min` | idem |
| `cta3_seater_detect_acties` | De seater wordt niet meer afgeleid uit plaatsingen maar uit de forecast (§4.4) |
| `cta3_seater_detect_window` | idem |
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
| 9 · Gast wil bestellen | enabled | **uit** | aan |
| 10 · Gast wil betalen | enabled | **uit** | aan |
| 11 · Bestelling klopt niet | enabled | **uit** | aan |
| 12 · Roep LG | enabled | **n.v.t.** | aan |

De `status`-kolom wordt overschreven zodra er een CTA-niveau is ingesteld (§2.11).
De promo-permissie (§2.14) staat hier niet in: die kent geen van deze drie
schakelaars.

Herkomst: de demo. TODO (O8) — het vibratiepatroon (alleen 1, 2, 3, 9 en 10) is
nergens apart besloten; bevestigen of dit de gewenste productiedefaults zijn.

`block by busy` staat uit voor alle mens-CTA's (9 t/m 12): daar wacht iemand op,
en die tegenhouden omdat de kelner net iets deed stelt precies het verkeerde uit
(§2.7). Bij CTA 12 is de schakelaar helemaal niet van toepassing.

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
| `lg_routing` | vaste instelling per zaak | besluit 12-09-2026 | Vangnet voor wanneer er niemand met de rol LG is ingelogd (§5.12) |
| `cta12_samenvoegvenster` | 300 sec | startwaarde | Binnen deze tijd worden oproepen aan dezelfde LG één kaart (§5.12) |

Deze staan per locatie in, net als §7.1 en §7.2.

### §7.6 Drukte van de kelner en inactiviteit

Allemaal startwaarden (§7.0). Deze zes bepalen wanneer een wijk oranje of rood
kleurt, en dat is bij uitstek iets om op echte data te ijken in plaats van te
schatten: laat het dashboard een paar weken meedraaien zonder dat iemand het ziet,
en kijk welke drempels overeenkomen met de avonden waarop het daadwerkelijk
misging.

| Parameter | Startwaarde | Wat |
|---|---|---|
| `kelner_venster` | 3600 sec | Venster waarover achterstand wordt gemeten (§4.2) |
| `kelner_werklast_tafels` | 6 | Open tafels vanaf waar de werklast "hoog" heet |
| `kelner_werklast_gangen` | 3 | Tafels met een gang onderweg, idem |
| `kelner_achterstand_open` | 2 | Openstaande CTA's vanaf waar er achterstand is |
| `kelner_achterstand_vervallen` | 2 | Vervallen CTA's in het venster, idem |
| `kelner_achterstand_respons` | 120 sec | Mediane responstijd vanaf waar er achterstand is |

"Stil" (§4.3) gebruikt geen eigen drempel maar `cta7_inactief_drempel` (§7.2) —
dezelfde grens die bepaalt wanneer CTA 7 vuurt. Eén getal, één betekenis.

### §7.7 CTA's 13 en 14

Horen bij §5.13 en §5.14. Beide gebouwd in fase 1, beide op `disabled`.

| Parameter | Default | Wat |
|---|---|---|
| `cta13_vertraging` | TODO (O17) | Tijd na het sluiten van het ticket voordat de kaart komt |
| `cta13_levensduur` | TODO (O17) | Hoe lang de vraag nog zinvol is; daarna vervalt hij |
| `cta13_bewaartermijn` | TODO (O18) | Na hoeveel tijd een `NO` vervalt |
| `cta14_postcodes` | leeg | Lijst 4-cijferige postcodes die als "uit de buurt" gelden. Per locatie in de backend (§11.3). Leeg = CTA 14 vuurt nooit |
| `cta14_moment` | TODO (O17) | Wanneer het wervingskaartje wordt voorgesteld |

Beide staan op `disabled` (§2.10) en in CTA-niveau 3 (§2.11): eerst shadow-loggen
hoe vaak ze zouden vuren, dan pas beslissen of ze aan gaan.

De shadow-log is de reden dat ze nú gebouwd worden en niet later. Op `disabled`
storen ze niemand en kosten ze geen kaartslot, maar de teller loopt wel. Begin je
er over een half jaar aan, dan begint het meten ook pas dan.

---

## §8 Beslislog

### §8.1 Wat er tussen maart en juni 2026 veranderd is

| # | Maart 2026 | Nu |
|---|---|---|
| 1 | Eerste drankje, NL-knoppen | Ongewijzigd van opzet; knoppen Engels, `CLOSE TABLE` beschermd |
| 2 | Trigger = geen *order* sinds 30 min | Trigger = geen *kelner-actie*; "wil nog wachten" reset ook |
| 3 | Tafel bij drukte: piekuren + forecast + seater-detectie | Alleen de forecast: boven `cta3_forecast_min` staat er een seater. Knoppen `NEW`/`PULL` |
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
| 12-09-2026 | Status blijft "Concept" tot de beleidspunten uit §9.1 beantwoord zijn | Tot die tijd blijft de juni-uitleg formeel leidend voor gedrag (§1.1) |
| 12-09-2026 | De juni-uitleg krijgt een waarschuwing bovenaan in plaats van een inhoudelijke correctie | Hij wordt in één keer bijgewerkt zodra §9.1 rond is, in plaats van twee keer |
| 12-09-2026 | Herzien: de uitleg is diezelfde dag alsnog volledig herschreven | Er was behoefte aan iets leesbaars om de huidige stand door te nemen. Wachten op §9.1 woog daar niet tegenop |
| 12-09-2026 | Alle bronnen van CTA's gaan door één poort in onze backend (§2.15) | Een bron die de poort omzeilt is een tweede meldingssysteem naar dezelfde handy zonder gedeelde rem |
| 12-09-2026 | Onderscheid systeem-CTA (1–8) en mens-CTA (9–12) (§2.15) | Bij een systeem-CTA heeft niemand iets gemist als hij vervalt; bij een mens-CTA staat er iemand te wachten die het al gemeld heeft |
| 12-09-2026 | Escalatie, delivery-check en fallback gelden alleen voor mens-CTA's (§2.16) | Timers op CTA 1–8 zouden de LG overspoelen met meldingen die niemand had aangevraagd |
| 12-09-2026 | Geen eigenaar: systeem-CTA vervalt, mens-CTA gaat naar de LG (§3.4) | Zelfde redenering als §2.2; de nullijn verschilt per soort |
| 12-09-2026 | CTA 11 (bestelling klopt niet) en CTA 12 (roep LG) toegevoegd | Beachalert brengt twee signalen die nog geen CTA hadden |
| 12-09-2026 | CTA 11 gaat eerst naar de kelner, niet naar de LG | Die staat er het dichtst bij en lost het meestal zelf op |
| 12-09-2026 | Beachalert volgt de routing van §3 (wijk), niet een lookup per tafel | Twee routings naast elkaar laten CTA 9 en CTA 1 voor dezelfde tafel bij verschillende kelners landen |
| 12-09-2026 | `beachalert_events` is de rijkere bron, §6.2 is de projectie ervan | Twee losse logs voor hetzelfde signaal geeft twee waarheden |
| 12-09-2026 | Fooi vastgelegd als idee zonder CTA-nummer (§12.1) | Nog niets over besloten. Een genummerde lege paragraaf leest als een gat in de spec, en niet elk idee wordt een CTA |
| 12-09-2026 | CTA 13 en 14 worden in fase 1 gebouwd, allebei op `disabled` (§5.13, §5.14) | Op `disabled` storen ze niemand en kosten ze geen kaartslot, maar de shadow-log loopt wel vol. Later beginnen betekent later kunnen beslissen |
| 12-09-2026 | "Er staat een seater" volgt uit de forecast, niet uit plaatsingen (§4.4, §5.3) | Boven 150 couverts wordt er altijd een seater ingeroosterd. Een roosterfeit is directer dan het afleiden uit gedrag, en het werkt vanaf de eerste tafel van de service |
| 12-09-2026 | Afgeleverd, gelezen en beantwoord worden apart vastgelegd (§6.4) | De handy koppelt dat terug (Peter, 12-09-2026). Zonder dat onderscheid meet het periodesrapport voor een deel de wifi-dekking en presenteert dat als het functioneren van een medewerker |
| 12-09-2026 | De log bevat het personeelsnummer, niet de naam (§6.2) | Het rapport telt op over vier weken en moet kloppen bij twee dezelfde voornamen of een naamswijziging; de staff-app heeft een sleutel nodig. Herziet het besluit "recordformaat ongewijzigd" op dit ene punt. Bijvangst: geen namen in de analysetabel |
| 12-09-2026 | "Uit de buurt" (CTA 14) is een lijst postcodes per locatie in de backend; de gastpostcode komt uit de reservering (§5.14) | Geen geocoding en geen externe dienst. Bij een strandlocatie is een straal voor de helft zee en onbereikbaar gebied; een lijst kun je precies snijden |
| 13-09-2026 | CTA 9 vervalt zodra er ná het melden is aangeslagen — zonder venster (§2.18) | Een order vóór de melding is een marge waar de runner overheen mag; een order ná de melding is een feit. Voor een feit is geen getal nodig |
| 13-09-2026 | Elke CTA krijgt een geldigheidsvoorwaarde die opnieuw wordt gecontroleerd vóór tonen (§2.18) | Tussen ontstaan en tonen kan een kwartier zitten. Zonder die controle komt er een kaart "first order" op een tafel die al lang besteld heeft — precies de melding die kelners leert dat het systeem niet meekijkt |
| 12-09-2026 | De remmen (§2.7, §2.8) gelden alleen voor systeem-CTA's; mens-CTA's gaan altijd door maar tellen wél mee voor het venster | Er staat iemand te wachten die het al gemeld heeft. Door ze te laten meetellen treden Oscars eigen timers terug als de vloer aan het melden is — en blijft het maximum betekenen wat het zegt |
| 12-09-2026 | Tempo-limiet naar 1 / 2 / 3 per 900 sec, en §2.8 gecorrigeerd | De oude waarden (1/3/6 per 600 sec) kwamen uit de demo en waren nooit gekozen: niveau 3 stond op ~180 meldingen per dienst. §2.8 beweerde bovendien dat de limiet het totaal per dienst begrenst, en dat doet hij niet |
| 12-09-2026 | Eén systeembrede standaard, per locatie te overschrijven; het beheerscherm toont het verschil (§7.0) | Een zaak die niets instelt volgt de standaard en blijft dat doen. Zonder dat onderscheid zichtbaar te maken snapt niemand waarom een wijziging bij vier zaken werkt en bij drie niet |
| 12-09-2026 | Getallen in §7 zijn startwaarden, geen besluiten; ijken gebeurt op de shadow-log (§7.0) | Negen van de vijftien open punten waren "welk getal". Meten met CTA's op `disabled` kost niets en levert een beter fundament dan een schatting aan tafel |
| 12-09-2026 | Een oproep gaat naar álle ingelogde LG's; de eerste die `GO` drukt pakt hem (§5.12) | Bij een oproep maakt het niet uit wie er komt, als er maar iemand komt. Uitzondering op §2.2, die over tafel-CTA's gaat |
| 12-09-2026 | De LG komt uit de devicedata, met de vaste instelling per zaak als vangnet (§5.12) | Volgt de dienst vanzelf, en valt niet stil als er niemand is ingelogd |
| 12-09-2026 | Geen escalatieketen als de LG niet reageert (§5.12) | De nullijn is lopen, en dat werkte vijftien jaar. Het systeem voorkomt alleen dat de melder stopt met zoeken omdat hij denkt dat het geregeld is. Eerst meten hoe vaak het misgaat, dan pas bouwen |
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

### §9.1 Beleid — alleen jullie kunnen dit beantwoorden

Geen van deze gaat weg door te meten.

| Code | Vraag | Blokkeert | Wie |
|---|---|---|---|
| O8 | Trillen alleen CTA 1, 2, 3, 9, 10, 11 en 12, zoals nu in §7.4? Dat patroon is nooit apart besloten. | Niets — instelbaar | Oscar |
| O15 | Het periodesrapport (§11.6) registreert prestaties van individuele medewerkers. In Nederland geldt zoiets doorgaans als personeelsvolgsysteem, waar de OR instemmingsrecht op heeft. Vooraf laten toetsen. | Het periodesrapport | Peter / kantoor |
| O25 | Is uit de POS te zien dat een kelner een tafel open heeft staan zonder iets verzonden te hebben? Dan kan CTA 9 vervallen omdat hij er al mee bezig is (§2.18). | Alleen dit extra geval | Oscar |
| O23 | Wat gebeurt er technisch bij het **omzetten** van een tafel? Verhuist het ticket-id mee, verhuist de reserveringsnaam mee, en blijven de productregels bestaan of worden ze tot één regel samengevat? | Of een bezoek achteraf te reconstrueren is, en of de naam als koppeling bruikbaar is | Oscar |
| O22 | Wat koppelt de handy precies terug — afgeleverd, gelezen, knop, iets anders (§6.4)? Daar hangt aan of `gelezen_sec` te vullen is, en daarmee of het periodesrapport eerlijk kan meten. | §6.4, en de eerlijkheid van §11.6 | Oscar |
| O21 | Waar komt de forecast vandaan en is hij voor de monitor beschikbaar op het moment dat een tafel geopend wordt (§4.4)? Zonder die koppeling vuurt CTA 3 niet. | CTA 3 | Oscar |
| O18 | CTA 13 legt een oordeel over een gast vast; CTA 14 gebruikt de postcode voor een ander doel dan de reservering. Grondslag en bewaartermijn laten toetsen vóór invoering. | CTA 13 en 14 | Peter / kantoor |

### §9.2 IJken — met de shadow-log, niet aan tafel

Deze hebben een startwaarde (§7.0) en blokkeren de bouw dus niet. Ze worden
vastgesteld vóór de eerste zaak live gaat, op de gegevens uit §6.3.

| Code | Wat | Startwaarde |
|---|---|---|
| O1 | `kelner_idle` op niveau 3 | 10 sec |
| O7 | `cta7_inactief_drempel` — ook de grens voor "stil" (§4.3) | 1800 sec |
| O13 | De zes drempels voor de drukte van een kelner (§7.6) | zie §7.6 |
| O20 | `cta12_samenvoegvenster` | 300 sec |
| — | `cta1_check_delay` en `cta2_sleep_threshold` — uit maart 2026, nooit herbevestigd (§7.2) | 120 / 1800 sec |

**O2 is anders.** De routing draait al bij Oscar (§8.3), dus
`routing_meerderheid_pct` en `routing_venster` hebben daar waarschijnlijk al een
waarde. Neem die over in plaats van een nieuwe te kiezen — twee implementaties met
verschillende drempels is erger dan een drempel die niet optimaal is.

### §9.3 Fase 2 — pas nodig bij §4.1 en §5.5

| Code | Vraag | Wie |
|---|---|---|
| O5 | Wat is `cta5_bedrag_pp` — de besteding per persoon vanaf welke de koffie mag? Eén bedrag per locatie. Dit is een keuze van het huis, geen meting. | Oscar / bedrijfsleiding |
| O3 | De order-rate-drempel voor "druk", en over welk venster gemeten | Oscar, te ijken |
| O6 | Hoe lang `WAIT` op CTA 5 uitstelt | Oscar, te ijken |

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

Is een eerdere oproep voor dezelfde plek niet opgepakt, dan staat dat erbij vóór
het versturen: *"Vorige oproep (21:14) is niet opgepakt."* Zo weet de melder dat
hij er beter zelf op af kan lopen (§5.12).

Het bevestigingsscherm zegt **"doorgegeven aan de LG"** en niet "de LG komt
eraan". Beloof niets wat je niet waarmaakt.

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
| **CTA 9 / 10** geëscaleerd | Responsiviteit. Dankzij `gelezen_sec` (§6.4) is een handy in de broekzak te onderscheiden van een kaart die wél gelezen is en bleef liggen |

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
De staff-app vraagt het op met het personeelsnummer van de ingelogde medewerker —
hetzelfde nummer dat in `medewerker_id` staat (§6.2). Verder is er geen koppeling
of mappingtabel nodig.

Inzagerecht bestaat sowieso; "op verzoek" is dus het minimum en geen gunst. Wat
hier besloten is, is dat het via een bestaand kanaal loopt dat de kelner al kent,
in plaats van via een formulier bij kantoor.

Open: O15 (instemmingsrecht), O19 (koppeling staff-app).

## §12 Ideeën, nog niet uitgewerkt

Dingen die we willen onthouden maar waar nog niets over besloten is. Ze hebben
bewust **geen CTA-nummer**: een genummerde lege paragraaf leest als een gat in de
spec, en niet elk idee wordt een CTA.

Wordt er iets van uitgewerkt, dan verhuist het naar §5 met een eigen nummer en
verdwijnt het hier.

### §12.1 Fooi

Peter, 12-09-2026. Verder niet uitgewerkt.

De kern: met fooi moeten we in de toekomst iets doen. Hoe, staat open.

**De eerste vraag is niet hoe de kaart eruitziet, maar of het wel een CTA is.**
Er zijn twee richtingen, en ze sluiten elkaar niet uit:

*Fooi als meting.* §2.13 zegt dat per CTA gemeten wordt of het gewenste effect
volgt. Dat is nu moeilijk: je ziet responstijden en afhandelingen, maar niet of de
gast er iets van gemerkt heeft. Fooi per tafel is een van de weinige signalen die
wél iets over de gast zegt. Als tafels die op tijd hun eerste drankje kregen
structureel beter geven, is dat het sterkste bewijs dat dit systeem werkt dat we
kunnen krijgen — en dan is fooi een uitkomstmaat en geen melding.

*Fooi als aanleiding.* Een CTA die ergens op reageert: een tafel die goed geeft,
of juist niet. Dat is verleidelijk en meteen het meest riskante, om twee redenen.
Het beoordeelt gasten (zie §5.13), en het beoordeelt kelners op iets waar ze maar
deels invloed op hebben. Een kelner die ziet dat tafel 3 slecht gaf, bedient tafel
3 anders — en dat is precies het gedrag dat je niet wilt kopen.

**Wat er in elk geval nodig is voordat hier iets mee kan:**

- Komt fooi überhaupt herleidbaar per tafel binnen uit de POS, of alleen als
  dagtotaal? Zonder dat eerste kan geen van beide richtingen.
- Wordt fooi individueel of in een pot verdeeld? Bij een pot zegt fooi per kelner
  vrijwel niets.
- Dezelfde toets als O15 en O18: dit raakt zowel gastgegevens als prestaties van
  medewerkers.

---

*Gereconstrueerd op 12-09-2026 uit `docs/oscar_CTA_uitleg.html` (juni 2026),
`index.html` (juli 2026), `Oscar_CTAs.pdf` (maart 2026) en 41 commits.
Ter herziening.*
