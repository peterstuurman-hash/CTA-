# Gepubliceerde artifacts

Eén regel per gedeelde pagina, met de bron en wat het is. Bij een wijziging
**dezelfde URL bijwerken** — publiceren zonder URL maakt een tweede artifact, en
wie de oude link in een appje heeft staan ziet dan voor altijd de oude versie.

| Artifact | URL | Bron | Gedeeld met |
|---|---|---|---|
| Oscar poortsimulator | https://claude.ai/artifact/P1Z2a2dUjWnDEMisshCsR3 | `docs/poortsimulator.html` | nog niemand |
| ~~Branding plattegrond~~ | https://claude.ai/artifact/DHSkqiydFuWoNyhPKdRCsC | `docs/plattegrond.html` | overbodig — zit nu als tab in de poortsimulator |

## Oscar poortsimulator

Twee tabbladen.

**De poort** — draai aan de instellingen uit SPEC §7 (CTA-niveau, `kelner_idle`,
`cta_max_per_window`, de twee vensters) en zie per situatie welke CTA's de handy
halen en welke worden tegengehouden, met de logregels die dat oplevert.

**Plattegrond** — wat de kelner ziet: de tafels van Branding met kleuren in
plaats van kaartjes. Donker binnen de lichte pagina, want het is een
voorvertoning van een handyscherm en geen bureau-gereedschap.

Tikken op een tafel opent WaiterPro, tenzij er een kaart staat die om iets
anders vraagt — afrekenen, een gang die door kan, een klopt-niet-melding. Dan
komt die kaart in beeld in plaats van het bestelscherm.

De LG ziet geen losse tafels maar vier gekleurde wijken, zodat hij in één
oogopslag ziet waar het knelt.

De URL is in september 2026 van vorm veranderd (`/code/artifact/` werd
`/artifact/`); het is dezelfde pagina.

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

**Een kelner ziet alleen zijn eigen wijk of wijken.** Hij kiest die niet — die
heeft hij. In het prototype kun je door de ogen van vier mensen kijken: Rutger
(RZ), Sanne (G), Daan (RN + K) en Mark (LG, ziet alles).

Tafels buiten zijn wijk verdwijnen niet helemaal maar blijven als lege contour
staan, zodat hij nog ziet wáár hij is. Weghalen maakt de kaart onleesbaar.

De vier wijken: G (Grill, 401-431), RN (Restaurant Noord, 1-32), RZ (Restaurant
Zuid, 41-81), K (Kas, 701-744).

**De kern van de proef:** CTA 1, 2, 5, 9 en 10 sluiten zichzelf zodra de kelner
het werk doet. Die tonen dus geen knop — alleen een kleur. Alleen CTA 3, 6, 8 en
11 vragen een echt antwoord en krijgen knoppen.

De tafelstanden lopen vanzelf mee, zodat te zien is of het scherm onrustig wordt.
De posities zijn op het oog van de plattegrond overgenomen: herkenbaar om op te
lopen, geen bouwtekening.
