/**
 * De poort — SPEC §2.15.
 *
 * Beslist of een CTA daadwerkelijk verstuurd wordt. Pure functies: alles wat
 * nodig is gaat erin, er komt een besluit uit. Geen database, geen klok, geen
 * netwerk — zodat een test iets kan bewijzen in plaats van alleen groen zijn.
 */

export type CtaStatus = 'ENABLED' | 'DISABLED' | 'DELETED';

/** Waarom een CTA niet verstuurd wordt. Wordt gelogd (SPEC §6.3). */
export type Tegenhouding =
  | 'DISABLED'
  | 'DELETED'
  | 'BUSY'
  | 'TEMPO'
  | 'GEEN_WIJK'
  | 'GEEN_WIJK_NAAR_LG';

export interface PoortInvoer {
  ctaNr: number;
  /** Status van deze CTA voor deze locatie. SPEC §2.10. */
  status: CtaStatus;
  /** Geldt de kelner-druk-gate voor deze CTA? SPEC §2.7. */
  blockByBusy: boolean;
  /** Seconden sinds de laatste actie van de doelkelner. `null` = geen bekend. */
  secSindsKelnerActie: number | null;
  /** SPEC §7.1, per niveau. */
  kelnerIdleSec: number;
  /** Aantal CTA's dat in het venster al getoond is op deze handy. SPEC §2.8. */
  getoondInVenster: number;
  ctaMaxPerVenster: number;
}

export type PoortBesluit =
  | { verstuur: true }
  | { verstuur: false; reden: Tegenhouding; loggen: boolean };

export const ROEP_LG = 12;

/**
 * De mens-CTA's (SPEC §2.15): een medewerker heeft gemeld dat er iets nodig is.
 *
 * Deze worden **nooit tegengehouden** door block by busy (§2.7) of de
 * tempo-limiet (§2.8). Die remmen beschermen een kelner tegen een melding die
 * kan wachten; hier staat er iemand voor hem die dat niet kan.
 *
 * Ze **tellen wel mee** voor het venster van §2.8 — dat is de taak van de
 * aanroeper, die elke getoonde CTA in het venster bijschrijft, van welk soort
 * dan ook. Zo treden Oscars eigen timer-CTA's terug als de vloer aan het melden
 * is, en blijft het maximum betekenen wat het zegt.
 */
export const MENS_CTA: readonly number[] = [9, 10, 11, 12];

export function isMensCta(ctaNr: number): boolean {
  return MENS_CTA.indexOf(ctaNr) !== -1;
}

export function magVerzenden(invoer: PoortInvoer): PoortBesluit {
  // 1 · Status voor deze locatie. SPEC §2.10.
  if (invoer.status === 'DELETED') {
    return { verstuur: false, reden: 'DELETED', loggen: false };
  }
  if (invoer.status === 'DISABLED') {
    // Niet tonen, wél loggen: zo zie je hoe vaak hij zou afgaan (shadow-log).
    return { verstuur: false, reden: 'DISABLED', loggen: true };
  }

  // Mens-CTA's slaan de remmen over. SPEC §2.7, §2.8.
  if (isMensCta(invoer.ctaNr)) {
    return { verstuur: true };
  }

  // 2 · Block by busy. SPEC §2.7.
  if (
    invoer.blockByBusy &&
    invoer.secSindsKelnerActie !== null &&
    invoer.secSindsKelnerActie < invoer.kelnerIdleSec
  ) {
    return { verstuur: false, reden: 'BUSY', loggen: true };
  }

  // 3 · Tempo-limiet. SPEC §2.8.
  if (
    invoer.ctaMaxPerVenster > 0 &&
    invoer.getoondInVenster >= invoer.ctaMaxPerVenster
  ) {
    return { verstuur: false, reden: 'TEMPO', loggen: true };
  }

  return { verstuur: true };
}

/**
 * Prio-volgorde. SPEC §2.3.
 *
 * Nummer 4 ontbreekt: dat was de promo-permissie, die geen kaart is (§2.14).
 * De mens-CTA's 9 t/m 12 staan vlak achter 1 en 2 — daar wacht iemand die het
 * al gemeld heeft. CTA 13 en 14 staan achteraan: die helpen de gast die er nu
 * zit niet.
 */
export const PRIO: readonly number[] = [1, 2, 9, 10, 11, 12, 3, 5, 6, 7, 8, 13, 14];

export function prioVan(ctaNr: number): number {
  const i = PRIO.indexOf(ctaNr);
  return i === -1 ? Number.MAX_SAFE_INTEGER : i;
}

export interface Kaart {
  ctaNr: number;
  gepushtOp: Date;
}

/** Maximaal drie kaarten tegelijk zichtbaar. SPEC §2.3. */
export const MAX_KAARTEN_ZICHTBAAR = 3;

/**
 * Welke kaarten er op de handy staan en welke in de wachtrij. Sorteert op prio,
 * bij gelijke prio op volgorde van binnenkomst.
 */
export function zichtbareKaarten<T extends Kaart>(
  kaarten: readonly T[],
  max: number = MAX_KAARTEN_ZICHTBAAR,
): { zichtbaar: T[]; wachtrij: T[] } {
  const gesorteerd = [...kaarten].sort(
    (a, b) =>
      prioVan(a.ctaNr) - prioVan(b.ctaNr) ||
      a.gepushtOp.getTime() - b.gepushtOp.getTime(),
  );
  return {
    zichtbaar: gesorteerd.slice(0, max),
    wachtrij: gesorteerd.slice(max),
  };
}
