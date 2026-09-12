import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  kiesOntvanger,
  kiesOntvangerVoorOproep,
  type OntvangerInvoer,
} from './ontvanger.ts';

const basis: OntvangerInvoer = {
  soort: 'SYSTEEM',
  eigenaarMedewerkerId: 'M-0412',
  eigenaarBereikbaar: true,
  zoneCollegaMedewerkerId: null,
  lgMedewerkerIds: [],
};

describe('kiesOntvanger — de eigenaar eerst (SPEC §3.2)', () => {
  it('stuurt naar de eigenaar van de wijk', () => {
    assert.deepEqual(kiesOntvanger(basis), {
      verstuur: true,
      naar: ['M-0412'],
      reden: 'EIGENAAR',
    });
  });

  it('stuurt naar precies één handy (SPEC §2.2)', () => {
    const besluit = kiesOntvanger(basis);
    assert.equal(besluit.verstuur, true);
    if (besluit.verstuur) assert.equal(besluit.naar.length, 1);
  });
});

describe('kiesOntvanger — geen eigenaar (SPEC §3.4)', () => {
  it('laat een systeem-CTA vervallen: niemand heeft iets gemist', () => {
    assert.deepEqual(
      kiesOntvanger({
        ...basis,
        eigenaarMedewerkerId: null,
        lgMedewerkerIds: ['M-0001'],
      }),
      { verstuur: false, reden: 'GEEN_WIJK' },
    );
  });

  it('stuurt een mens-CTA naar de LG: daar wacht iemand', () => {
    assert.deepEqual(
      kiesOntvanger({
        ...basis,
        soort: 'MENS',
        eigenaarMedewerkerId: null,
        lgMedewerkerIds: ['M-0001'],
      }),
      { verstuur: true, naar: ['M-0001'], reden: 'LG_GEEN_EIGENAAR' },
    );
  });
});

describe('kiesOntvanger — eigenaar onbereikbaar (SPEC §2.16)', () => {
  it('laat een systeem-CTA vervallen', () => {
    assert.deepEqual(
      kiesOntvanger({
        ...basis,
        eigenaarBereikbaar: false,
        lgMedewerkerIds: ['M-0001'],
      }),
      { verstuur: false, reden: 'GEEN_WIJK' },
    );
  });

  it('wijkt bij een mens-CTA eerst uit naar een collega in de zone', () => {
    assert.deepEqual(
      kiesOntvanger({
        ...basis,
        soort: 'MENS',
        eigenaarBereikbaar: false,
        zoneCollegaMedewerkerId: 'M-0777',
        lgMedewerkerIds: ['M-0001'],
      }),
      { verstuur: true, naar: ['M-0777'], reden: 'ZONE_COLLEGA' },
    );
  });

  it('gaat naar de LG als er geen collega in de zone is', () => {
    const besluit = kiesOntvanger({
      ...basis,
      soort: 'MENS',
      eigenaarBereikbaar: false,
      lgMedewerkerIds: ['M-0001'],
    });
    assert.equal(besluit.verstuur, true);
    if (besluit.verstuur) assert.equal(besluit.reden, 'LG_GEEN_EIGENAAR');
  });

  it('meldt het als er helemaal niemand bereikbaar is — niet stil verdwijnen', () => {
    assert.deepEqual(
      kiesOntvanger({ ...basis, soort: 'MENS', eigenaarBereikbaar: false }),
      { verstuur: false, reden: 'GEEN_ONTVANGER' },
    );
  });
});

describe('kiesOntvangerVoorOproep — CTA 12 (SPEC §5.12)', () => {
  it("stuurt naar álle ingelogde LG's tegelijk", () => {
    assert.deepEqual(kiesOntvangerVoorOproep(['M-0001', 'M-0002']), {
      verstuur: true,
      naar: ['M-0001', 'M-0002'],
      reden: 'LG_DIRECT',
    });
  });

  it('meldt het als er geen LG bereikbaar is', () => {
    assert.deepEqual(kiesOntvangerVoorOproep([]), {
      verstuur: false,
      reden: 'GEEN_ONTVANGER',
    });
  });
});
