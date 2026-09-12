/**
 * CtaTransport — het wegschrijven van een CTA-record en de terugkoppeling van
 * de handy.
 *
 * De CTA-infrastructuur bestaat al: wij schrijven een record, WaiterPro leest
 * het en toont het op de handy. De handy koppelt terug dat hij is afgeleverd,
 * dat hij is gelezen, en welke knop is ingedrukt (SPEC §6.4).
 *
 * Wat er precies terugkomt staat nog niet vast — SPEC O22.
 *
 * TODO: koppel aan bestaand schema.
 */

export type KnopStijl = 'primary' | 'gewoon' | 'danger';

export interface Knop {
  /** Opschrift uit de vaste set van SPEC §2.12. */
  label: string;
  /** Wat er terugkomt bij een druk, bijv. "order", "print", "fixed". */
  actie: string;
  stijl?: KnopStijl;
}

export interface CtaVerzoek {
  ctaNr: number;
  locatieId: string;
  /** Leeg bij CTA 7 en CTA 12 — die hangen niet aan een tafel. */
  tafelnr: number | null;
  /** Precies één ontvanger. Personeelsnummer. SPEC §2.2. */
  medewerkerId: string;
  titel: string;
  /** Regels onder de titel, bijv. de laatste orderregels bij CTA 11. */
  subtekst?: string;
  knoppen: Knop[];
  /** Backend-instelling per CTA. SPEC §2.9. */
  vibratie: boolean;
}

export interface CtaGeschreven {
  transportId: string;
  gepushtOp: Date;
}

export type CtaStand =
  | 'GEPUSHT'
  | 'AFGELEVERD'
  | 'GELEZEN'
  | 'BEANTWOORD'
  | 'INGETROKKEN';

export interface CtaTerugkoppeling {
  transportId: string;
  stand: CtaStand;
  afgeleverdOp: Date | null;
  gelezenOp: Date | null;
  beantwoordOp: Date | null;
  /** De `actie` van de ingedrukte knop, als die er is. */
  actie: string | null;
}

export type IntrekReden =
  /** Rekening aangeslagen; CTA 10 hoeft niet meer. SPEC §5.10. */
  | 'auto_close'
  /** Ticket afgerekend; alles van die tafel weg. SPEC §2.5. */
  | 'ticket_gesloten'
  /** Levensduur verlopen. SPEC §5.1. */
  | 'vervallen'
  /** Een collega pakte de oproep op. SPEC §5.12. */
  | 'ingetrokken';

export interface CtaTransport {
  /**
   * Schrijft het CTA-record weg. De poort heeft status, routing, block by busy
   * en de tempo-limiet dan al afgehandeld (SPEC §2.15).
   */
  schrijf(verzoek: CtaVerzoek): Promise<CtaGeschreven>;

  /** De stand van één CTA: afgeleverd, gelezen, beantwoord. */
  stand(transportId: string): Promise<CtaTerugkoppeling>;

  /** Alles wat sinds `sinds` van stand is veranderd, voor de monitor-lus. */
  terugkoppelingenSinds(
    locatieId: string,
    sinds: Date,
  ): Promise<CtaTerugkoppeling[]>;

  /** Haalt een openstaande kaart van de handy zonder kelner-actie. */
  trekIn(transportId: string, reden: IntrekReden): Promise<void>;
}
