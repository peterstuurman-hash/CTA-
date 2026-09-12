/**
 * ForecastSource — het verwachte aantal couverts voor een service.
 *
 * Komt uit het reserveringssysteem en zegt iets over bezetting, niet over
 * werkdruk (SPEC §4.4). Enige afnemer: CTA 3 — boven een drempel staat er
 * altijd een seater ingeroosterd.
 *
 * Openstaand: waar deze vandaan komt en of hij opvraagbaar is op het moment dat
 * een tafel geopend wordt (SPEC O21).
 *
 * TODO: koppel aan bestaand schema.
 */

export interface ForecastSource {
  /**
   * Verwachte couverts voor de service waarin `moment` valt.
   * `null` betekent onbekend — dan vuurt CTA 3 niet, in plaats van te gokken.
   */
  couverts(locatieId: string, moment: Date): Promise<number | null>;
}
