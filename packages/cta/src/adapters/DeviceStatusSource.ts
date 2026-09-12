/**
 * DeviceStatusSource — welke handy's er zijn, wie erop is ingelogd, en met
 * welke rol.
 *
 * Gebruikt voor de delivery-check en de fallback van mens-CTA's (SPEC §2.16),
 * en om te bepalen wie de LG is (SPEC §5.12).
 *
 * TODO: koppel aan bestaand schema.
 */

export interface Handy {
  handyId: string;
  /** Personeelsnummer, of `null` als er niemand op is ingelogd. */
  medewerkerId: string | null;
  rol: string | null;
  online: boolean;
  batterijPct: number | null;
  laatstGezienOp: Date | null;
}

export interface DeviceStatusSource {
  /** Kan deze medewerker nu een melding ontvangen? SPEC §2.16 stap 1. */
  isBereikbaar(locatieId: string, medewerkerId: string): Promise<boolean>;

  handyVanMedewerker(locatieId: string, medewerkerId: string): Promise<Handy | null>;

  /**
   * Alle ingelogde leidinggevenden. Een oproep gaat naar allemaal tegelijk;
   * wie als eerste GO drukt pakt hem (SPEC §5.12).
   *
   * Leeg = geen LG bereikbaar. Dan geldt de vaste instelling per zaak, en als
   * die er ook niet is: loggen, niet stil laten verdwijnen.
   */
  leidinggevenden(locatieId: string): Promise<Handy[]>;
}
