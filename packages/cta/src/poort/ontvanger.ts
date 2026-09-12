/**
 * Wie krijgt de melding — SPEC §3.4 en §2.16.
 *
 * Het verschil tussen een systeem-CTA en een mens-CTA zit hier (SPEC §2.15):
 * bij een systeem-CTA heeft niemand iets gemist als hij vervalt, bij een
 * mens-CTA staat er iemand te wachten die het al gemeld heeft.
 */

export type Soort = 'SYSTEEM' | 'MENS';

export type RouteReden =
  | 'EIGENAAR'
  | 'ZONE_COLLEGA'
  | 'LG_GEEN_EIGENAAR'
  | 'LG_ESCALATIE'
  | 'LG_VIA_KNOP'
  | 'LG_DIRECT';

export interface OntvangerInvoer {
  soort: Soort;
  /** Eigenaar van de wijk waarin de tafel valt, of `null`. SPEC §3. */
  eigenaarMedewerkerId: string | null;
  /** Is de eigenaar bereikbaar — handy online en ingelogd? SPEC §2.16 stap 1. */
  eigenaarBereikbaar: boolean;
  /**
   * Bereikbare collega in dezelfde zone. Zones komen uit Kelner Navigator en
   * die integratie is buiten scope, dus in de praktijk `null`.
   */
  zoneCollegaMedewerkerId: string | null;
  /** Bereikbare leidinggevenden. Bij een oproep gaan ze er allemaal heen. */
  lgMedewerkerIds: readonly string[];
}

export type OntvangerBesluit =
  | { verstuur: true; naar: string[]; reden: RouteReden }
  | { verstuur: false; reden: 'GEEN_WIJK' | 'GEEN_ONTVANGER' };

/**
 * De fallback-volgorde: eigenaar → collega in dezelfde zone → LG.
 *
 * Dit is de uitzondering op SPEC §3.5, waar niemand een wijk erft: het gaat hier
 * alleen om déze melding. De collega wordt geen eigenaar van de wijk.
 */
export function kiesOntvanger(invoer: OntvangerInvoer): OntvangerBesluit {
  if (invoer.eigenaarMedewerkerId !== null && invoer.eigenaarBereikbaar) {
    return {
      verstuur: true,
      naar: [invoer.eigenaarMedewerkerId],
      reden: 'EIGENAAR',
    };
  }

  // Vanaf hier is er geen bereikbare eigenaar.
  if (invoer.soort === 'SYSTEEM') {
    // Vervalt. Geen seeding, geen fallback naar een willekeurige kelner.
    // SPEC §3.4 — de nullijn is nul meldingen, dus niemand mist iets.
    return { verstuur: false, reden: 'GEEN_WIJK' };
  }

  // Mens-CTA: er staat iemand te wachten die het al gemeld heeft. SPEC §2.16.
  if (invoer.zoneCollegaMedewerkerId !== null) {
    return {
      verstuur: true,
      naar: [invoer.zoneCollegaMedewerkerId],
      reden: 'ZONE_COLLEGA',
    };
  }

  if (invoer.lgMedewerkerIds.length > 0) {
    return {
      verstuur: true,
      naar: [...invoer.lgMedewerkerIds],
      reden: 'LG_GEEN_EIGENAAR',
    };
  }

  // Ook geen LG bereikbaar. Loggen, niet stil laten verdwijnen.
  return { verstuur: false, reden: 'GEEN_ONTVANGER' };
}

/**
 * Een oproep aan de LG (CTA 12) gaat naar álle ingelogde LG's tegelijk; wie als
 * eerste `GO` drukt pakt hem en bij de rest verdwijnt de kaart. SPEC §5.12.
 *
 * Bewuste uitzondering op SPEC §2.2: die regel gaat over een CTA die bij één
 * bepaalde kelner hoort, waar het uitmaakt wie hem krijgt. Bij een oproep maakt
 * dat niet uit, als er maar iemand komt.
 */
export function kiesOntvangerVoorOproep(
  lgMedewerkerIds: readonly string[],
): OntvangerBesluit {
  if (lgMedewerkerIds.length === 0) {
    return { verstuur: false, reden: 'GEEN_ONTVANGER' };
  }
  return { verstuur: true, naar: [...lgMedewerkerIds], reden: 'LG_DIRECT' };
}
