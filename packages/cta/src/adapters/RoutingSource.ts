/**
 * RoutingSource — wie bedient welke wijk.
 *
 * Deze logica draait al bij Oscar: hij weet met grote zekerheid welke kelner in
 * welke wijk loopt (SPEC §3, §8.3). Wij bouwen hem niet na, we bevragen hem.
 *
 * TODO: koppel aan bestaand schema.
 */

export interface Wijk {
  naam: string;
  tafelVan: number;
  tafelTot: number;
  /** Personeelsnummer van de eigenaar, of `null` als de wijk vrij is. */
  eigenaarMedewerkerId: string | null;
}

export interface RoutingSource {
  /** De wijk waarin deze tafel valt, met zijn huidige eigenaar. */
  wijkVanTafel(locatieId: string, tafelnr: number): Promise<Wijk | null>;

  /** Alle wijken van een locatie. Voor het LG-dashboard (SPEC §4.2). */
  wijken(locatieId: string): Promise<Wijk[]>;

  /**
   * Haalt een kelner uit het overzicht na NO of BREAK op CTA 7 (SPEC §3.5).
   * De wijk komt daarmee vrij; niemand erft hem.
   */
  meldInactief(locatieId: string, medewerkerId: string): Promise<void>;
}
