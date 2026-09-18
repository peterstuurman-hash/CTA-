# Gepubliceerde artifacts

Eén regel per gedeelde pagina, met de bron en wat het is. Bij een wijziging
**dezelfde URL bijwerken** — publiceren zonder URL maakt een tweede artifact, en
wie de oude link in een appje heeft staan ziet dan voor altijd de oude versie.

| Artifact | URL | Bron | Gedeeld met |
|---|---|---|---|
| Oscar poortsimulator | https://claude.ai/code/artifact/b23cc9b3-94e6-423a-ae4e-be43a898eef2 | `docs/poortsimulator.html` | nog niemand |
| Branding plattegrond | https://claude.ai/artifact/DHSkqiydFuWoNyhPKdRCsC | `docs/plattegrond.html` | nog niemand |

## Oscar poortsimulator

Draai aan de instellingen uit SPEC §7 — CTA-niveau, `kelner_idle`,
`cta_max_per_window`, de twee vensters — en zie per situatie welke CTA's de handy
halen en welke worden tegengehouden, met de logregels die dat oplevert.

De logica in de pagina is een kopie van `packages/cta/src/poort`. **Wijzigt die
logica, dan moet de pagina mee** — anders laat de simulator iets anders zien dan
het systeem doet, en dat is erger dan geen simulator.

Bouwcommando: geen. Het is één HTML-bestand zonder buildstap; publiceren gaat
vanaf `docs/poortsimulator.html`.

Het bestand staat ook op GitHub Pages:
https://peterstuurman-hash.github.io/CTA-/docs/poortsimulator.html

## Branding plattegrond

Proef of een gekleurde plattegrond op de handy rustiger werkt dan drie kaartjes.
Rood is prioriteit, oranje is aandacht, groen is in orde, grijs is leeg. Tik op
een tafel voor wat er speelt.

De vier wijken van Branding zitten erin: G (Grill, 401-431), RN (Restaurant
Noord, 1-32), RZ (Restaurant Zuid, 41-81) en K (Kas, 701-744). Kies een wijk en
de rest valt weg.

**De kern van de proef:** CTA 1, 2, 5, 9 en 10 sluiten zichzelf zodra de kelner
het werk doet. Die tonen dus geen knop — alleen een kleur. Alleen CTA 3, 6, 8 en
11 vragen een echt antwoord en krijgen knoppen.

De tafelstanden lopen vanzelf mee, zodat te zien is of het scherm onrustig wordt.
De posities zijn op het oog van de plattegrond overgenomen: herkenbaar om op te
lopen, geen bouwtekening.
