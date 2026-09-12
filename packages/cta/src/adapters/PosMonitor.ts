/**
 * PosMonitor — leest de POS-database van Oscar.
 *
 * Dit is de bron van alle systeem-CTA's (SPEC §2.15): seaten, aanslaan, firen,
 * afrekenen. De monitor kijkt, hij schrijft niets terug.
 *
 * TODO: koppel aan bestaand schema.
 */

export interface Tafel {
  tafelnr: number;
  geseat: boolean;
  geseatOp: Date | null;
  /** Sleutel naar de reservering. Nooit de naam opslaan — SPEC §6.2. */
  reserveringId: string | null;
  /** Alleen om te tonen op een kaart of scherm. */
  reserveringNaam: string | null;
  couverts: number | null;

  ticketId: string | null;
  laatsteOrderOp: Date | null;
  /** POS-aanslag óf een "wil nog wachten"-registratie. SPEC §5.2. */
  laatsteKelnerActieOp: Date | null;
  voorgerechtOp: Date | null;
  hoofdgerechtGefiredOp: Date | null;
  rekeningAangeslagenOp: Date | null;
  geslotenOp: Date | null;
}

export interface OrderRegel {
  omschrijving: string;
  aantal: number;
  bedragCent: number;
  /** Wie hem aansloeg. Personeelsnummer. */
  medewerkerId: string | null;
  aangeslagenOp: Date;
}

export interface PosMonitor {
  /** Alle tafels van een locatie met hun actuele toestand. */
  tafels(locatieId: string): Promise<Tafel[]>;

  /** `null` als de tafel niet bestaat in deze zaak. */
  tafel(locatieId: string, tafelnr: number): Promise<Tafel | null>;

  /** Nieuwste eerst. Voor de subtekst van CTA 11 (SPEC §5.11). */
  laatsteOrderRegels(
    locatieId: string,
    tafelnr: number,
    max: number,
  ): Promise<OrderRegel[]>;

  /**
   * Aanslagen sinds een moment, over alle tafels van een locatie.
   * Waar de poort uit afleidt of een kelner "bezig" is (SPEC §2.7) en of hij
   * stil is (SPEC §4.3).
   */
  aanslagenSinds(locatieId: string, sinds: Date): Promise<OrderRegel[]>;
}
