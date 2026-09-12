/**
 * Ontdubbelen en de recente-bestelling-check — SPEC §10.3.
 *
 * Deze twee zitten vóór de remmen: ze voorkomen dat er überhaupt een CTA
 * ontstaat. De bron toont de waarschuwing en stuurt bij "toch doorgeven"
 * hetzelfde commando opnieuw, met `doorgedrukt`.
 */

export type SignaalActie =
  | 'WIL_BESTELLEN'
  | 'WIL_AFREKENEN'
  | 'CHECK_BESTELLING'
  | 'ROEP_LG';

export interface EerderSignaal {
  id: string;
  actie: SignaalActie;
  tafelnr: number | null;
  /** Naar wie het toen ging, als dat bekend was. */
  ontvangerNaam: string | null;
  op: Date;
}

export interface DedupeInvoer {
  actie: SignaalActie;
  tafelnr: number | null;
  nu: Date;
  dedupeVensterSec: number;
  /** Aangenomen signalen van deze locatie, nieuwste eerst of willekeurig. */
  eerdere: readonly EerderSignaal[];
  /** De melder zag de waarschuwing en koos toch te versturen. */
  doorgedrukt: boolean;
}

export type DedupeBesluit =
  | { dubbel: false }
  | { dubbel: true; eerder: EerderSignaal };

/**
 * Dezelfde tafel plus hetzelfde actietype binnen het venster levert geen tweede
 * CTA op.
 *
 * Let op: `ROEP_LG` heeft geen tafelnummer. Twee oproepen vanaf verschillende
 * plekken zijn geen duplicaat — die worden samengevoegd op de handy van de LG
 * (SPEC §5.12), niet hier tegengehouden.
 */
export function isDubbel(invoer: DedupeInvoer): DedupeBesluit {
  if (invoer.doorgedrukt) return { dubbel: false };
  if (invoer.actie === 'ROEP_LG') return { dubbel: false };
  if (invoer.tafelnr === null) return { dubbel: false };

  const grens = invoer.nu.getTime() - invoer.dedupeVensterSec * 1000;

  const treffers = invoer.eerdere
    .filter(
      (e) =>
        e.actie === invoer.actie &&
        e.tafelnr === invoer.tafelnr &&
        e.op.getTime() > grens,
    )
    .sort((a, b) => b.op.getTime() - a.op.getTime());

  const eerder = treffers[0];
  return eerder ? { dubbel: true, eerder } : { dubbel: false };
}

export interface RecenteOrderInvoer {
  actie: SignaalActie;
  laatsteOrderOp: Date | null;
  nu: Date;
  recenteOrderVensterSec: number;
  doorgedrukt: boolean;
}

/**
 * "Zojuist besteld — toch doorgeven?" Alleen bij `WIL_BESTELLEN`: bij afrekenen
 * of een klopt-niet-melding zegt een recente order niets. SPEC §5.9.
 */
export function isRecentBesteld(invoer: RecenteOrderInvoer): boolean {
  if (invoer.doorgedrukt) return false;
  if (invoer.actie !== 'WIL_BESTELLEN') return false;
  if (invoer.laatsteOrderOp === null) return false;

  const grens = invoer.nu.getTime() - invoer.recenteOrderVensterSec * 1000;
  return invoer.laatsteOrderOp.getTime() > grens;
}
