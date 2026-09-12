/**
 * Proefrit — laat de poort een paar echte situaties beslissen en drukt af wat
 * hij doet en waarom.
 *
 * Geen database, geen WaiterPro, geen netwerk: dit draait de logica uit
 * packages/cta tegen verzonnen situaties. Bedoeld om te kunnen zien of de
 * beslissingen kloppen met wat er in de spec staat.
 *
 *   pnpm proefrit
 */

import {
  magVerzenden,
  zichtbareKaarten,
  type PoortInvoer,
} from '../../packages/cta/src/poort/gate.ts';
import {
  isDubbel,
  isRecentBesteld,
  type EerderSignaal,
} from '../../packages/cta/src/poort/dedupe.ts';
import {
  kiesOntvanger,
  kiesOntvangerVoorOproep,
} from '../../packages/cta/src/poort/ontvanger.ts';

// ---------------------------------------------------------------------------

/** ANSI-kleuren. Opgebouwd uit de charcode zodat er geen onzichtbare
 *  escape-tekens in de broncode staan. */
const ESC = String.fromCharCode(27);
const RESET = `${ESC}[0m`;
const DIM = `${ESC}[2m`;
const GROEN = `${ESC}[32m`;
const ROOD = `${ESC}[31m`;
const GEEL = `${ESC}[33m`;
const VET = `${ESC}[1m`;

let stap = 0;

function kop(tekst: string): void {
  console.log(`\n${VET}${tekst}${RESET}`);
  console.log(DIM + '─'.repeat(Math.min(tekst.length, 70)) + RESET);
}

function situatie(tekst: string): void {
  stap += 1;
  console.log(`\n${VET}${stap}.${RESET} ${tekst}`);
}

function uitkomst(gelukt: boolean, tekst: string, spec: string): void {
  const merk = gelukt ? `${GROEN}→${RESET}` : `${ROOD}✗${RESET}`;
  console.log(`   ${merk} ${tekst}  ${DIM}${spec}${RESET}`);
}

function logregel(tekst: string): void {
  console.log(`   ${GEEL}log${RESET} ${DIM}${tekst}${RESET}`);
}

// Instellingen zoals ze op niveau 1 zouden staan (SPEC §2.11, §7).
const KELNER_IDLE_SEC = 60;
const CTA_MAX_PER_VENSTER = 1;
const DEDUPE_VENSTER_SEC = 180;
const RECENTE_ORDER_VENSTER_SEC = 120;

const basis: PoortInvoer = {
  ctaNr: 1,
  status: 'ENABLED',
  blockByBusy: true,
  secSindsKelnerActie: 600,
  kelnerIdleSec: KELNER_IDLE_SEC,
  getoondInVenster: 0,
  ctaMaxPerVenster: CTA_MAX_PER_VENSTER,
};

const nu = new Date(2026, 8, 12, 19, 40, 0);
const geleden = (sec: number) => new Date(nu.getTime() - sec * 1000);

// ---------------------------------------------------------------------------

kop('Proefrit — zaterdagavond, RES Noord, CTA-niveau 1');

situatie('CTA 1 wil vuren op tafel 3, maar Rutger sloeg 10 seconden geleden iets aan');
{
  const b = magVerzenden({ ...basis, secSindsKelnerActie: 10 });
  uitkomst(
    b.verstuur,
    b.verstuur ? 'verstuurd' : `tegengehouden — ${b.reden.toLowerCase()}`,
    '§2.7 block by busy',
  );
  if (!b.verstuur && b.loggen) logregel('1;…;M-0412;3;busy;;;');
}

situatie('Een minuut later is Rutger rustig');
{
  const b = magVerzenden({ ...basis, secSindsKelnerActie: 70 });
  uitkomst(b.verstuur, b.verstuur ? 'verstuurd naar Rutger' : 'tegengehouden', '§2.7');
  logregel('1;…;M-0412;3;enabled;;;');
}

situatie('Een runner meldt "wil bestellen" op tafel 3 — 2 minuten na de vorige melding');
{
  const eerdere: EerderSignaal[] = [
    {
      id: 's-1',
      actie: 'WIL_BESTELLEN',
      tafelnr: 3,
      ontvangerNaam: 'Rutger',
      op: geleden(120),
    },
  ];
  const d = isDubbel({
    actie: 'WIL_BESTELLEN',
    tafelnr: 3,
    nu,
    dedupeVensterSec: DEDUPE_VENSTER_SEC,
    eerdere,
    doorgedrukt: false,
  });
  uitkomst(
    !d.dubbel,
    d.dubbel
      ? `al doorgegeven aan ${d.eerder.ontvangerNaam} (2 min geleden)`
      : 'aangenomen',
    '§10.3 ontdubbelen',
  );
  console.log(`   ${DIM}het tablet toont "toch opnieuw sturen"${RESET}`);

  const d2 = isDubbel({
    actie: 'WIL_BESTELLEN',
    tafelnr: 3,
    nu,
    dedupeVensterSec: DEDUPE_VENSTER_SEC,
    eerdere,
    doorgedrukt: true,
  });
  uitkomst(!d2.dubbel, 'runner drukt door → aangenomen', '§2.17 doorgedrukt');
}

situatie('Runner meldt "wil bestellen" op tafel 8, waar 30 seconden geleden is aangeslagen');
{
  const recent = isRecentBesteld({
    actie: 'WIL_BESTELLEN',
    laatsteOrderOp: geleden(30),
    nu,
    recenteOrderVensterSec: RECENTE_ORDER_VENSTER_SEC,
    doorgedrukt: false,
  });
  uitkomst(!recent, recent ? '"zojuist besteld — toch doorgeven?"' : 'aangenomen', '§5.9');
}

situatie('CTA 6 wil vuren, maar het venster van Rutger zit al vol');
{
  const b = magVerzenden({ ...basis, ctaNr: 6, getoondInVenster: 1 });
  uitkomst(
    b.verstuur,
    b.verstuur ? 'verstuurd' : `tegengehouden — ${b.reden.toLowerCase()}`,
    '§2.8 tempo-limiet',
  );
  if (!b.verstuur && b.loggen) logregel('6;…;M-0412;3;tempo;;;');
}

situatie('De bar roept de LG — terwijl datzelfde venster nog steeds vol zit');
{
  const b = magVerzenden({ ...basis, ctaNr: 12, getoondInVenster: 99 });
  uitkomst(b.verstuur, b.verstuur ? 'verstuurd' : 'tegengehouden', '§5.12 nooit weigeren');
  const o = kiesOntvangerVoorOproep(['M-0001', 'M-0002']);
  if (o.verstuur) {
    console.log(
      `   ${DIM}naar ${o.naar.length} leidinggevenden tegelijk; wie als eerste GO drukt pakt hem${RESET}`,
    );
  }
}

situatie('Wijk Zuid heeft geen eigenaar — niemand heeft er aangeslagen');
{
  const systeem = kiesOntvanger({
    soort: 'SYSTEEM',
    eigenaarMedewerkerId: null,
    eigenaarBereikbaar: false,
    zoneCollegaMedewerkerId: null,
    lgMedewerkerIds: ['M-0001'],
  });
  uitkomst(
    systeem.verstuur,
    systeem.verstuur ? 'verstuurd' : 'CTA 2 vervalt — niemand heeft iets gemist',
    '§3.4 systeem-CTA',
  );
  logregel('2;…;;14;geen_wijk;;;');

  const mens = kiesOntvanger({
    soort: 'MENS',
    eigenaarMedewerkerId: null,
    eigenaarBereikbaar: false,
    zoneCollegaMedewerkerId: null,
    lgMedewerkerIds: ['M-0001'],
  });
  uitkomst(
    mens.verstuur,
    mens.verstuur
      ? 'CTA 9 gaat naar de LG — daar wacht een gast'
      : 'vervallen',
    '§3.4 mens-CTA',
  );
  logregel('9;…;M-0001;14;geen_wijk_naar_lg;;;');
}

situatie('Rutger heeft vier kaarten openstaan');
{
  const t = (min: number) => new Date(2026, 8, 12, 19, min, 0);
  const { zichtbaar, wachtrij } = zichtbareKaarten([
    { ctaNr: 8, gepushtOp: t(10) },
    { ctaNr: 1, gepushtOp: t(25) },
    { ctaNr: 6, gepushtOp: t(15) },
    { ctaNr: 10, gepushtOp: t(30) },
  ]);
  console.log(
    `   ${GROEN}→${RESET} op de handy: CTA ${zichtbaar.map((k) => k.ctaNr).join(', ')}  ${DIM}§2.3${RESET}`,
  );
  console.log(
    `   ${DIM}in de wachtrij: CTA ${wachtrij.map((k) => k.ctaNr).join(', ')}${RESET}`,
  );
  console.log(
    `   ${DIM}CTA 10 is het nieuwst maar staat vooraan: daar wacht een gast die het al gemeld heeft${RESET}`,
  );
}

console.log(
  `\n${DIM}Alle beslissingen komen uit packages/cta. Wat hier gebeurt is dus wat er in\nproductie zou gebeuren — alleen met verzonnen situaties in plaats van de POS.${RESET}\n`,
);
