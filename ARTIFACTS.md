# Gepubliceerde artifacts

Eén regel per gedeelde pagina, met de bron en wat het is. Bij een wijziging
**dezelfde URL bijwerken** — publiceren zonder URL maakt een tweede artifact, en
wie de oude link in een appje heeft staan ziet dan voor altijd de oude versie.

| Artifact | URL | Bron | Gedeeld met |
|---|---|---|---|
| Oscar poortsimulator | https://claude.ai/code/artifact/b23cc9b3-94e6-423a-ae4e-be43a898eef2 | `docs/poortsimulator.html` | nog niemand |

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
