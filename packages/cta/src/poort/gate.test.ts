import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  magVerzenden,
  prioVan,
  zichtbareKaarten,
  type PoortInvoer,
} from './gate.ts';

const basis: PoortInvoer = {
  ctaNr: 1,
  status: 'ENABLED',
  blockByBusy: true,
  secSindsKelnerActie: 600,
  kelnerIdleSec: 60,
  getoondInVenster: 0,
  ctaMaxPerVenster: 6,
};

describe('magVerzenden — status (SPEC §2.10)', () => {
  it('laat een enabled CTA door', () => {
    assert.deepEqual(magVerzenden(basis), { verstuur: true });
  });

  it('houdt een disabled CTA tegen maar logt hem wél (shadow)', () => {
    assert.deepEqual(magVerzenden({ ...basis, status: 'DISABLED' }), {
      verstuur: false,
      reden: 'DISABLED',
      loggen: true,
    });
  });

  it('houdt een deleted CTA tegen en logt niets — dat is het enige verschil', () => {
    assert.deepEqual(magVerzenden({ ...basis, status: 'DELETED' }), {
      verstuur: false,
      reden: 'DELETED',
      loggen: false,
    });
  });
});

describe('magVerzenden — block by busy (SPEC §2.7)', () => {
  it('houdt tegen als de kelner net iets deed', () => {
    assert.deepEqual(magVerzenden({ ...basis, secSindsKelnerActie: 10 }), {
      verstuur: false,
      reden: 'BUSY',
      loggen: true,
    });
  });

  it('laat door zodra de drempel precies bereikt is', () => {
    assert.deepEqual(magVerzenden({ ...basis, secSindsKelnerActie: 60 }), {
      verstuur: true,
    });
  });

  it('laat door als de gate voor deze CTA uit staat', () => {
    assert.deepEqual(
      magVerzenden({ ...basis, blockByBusy: false, secSindsKelnerActie: 1 }),
      { verstuur: true },
    );
  });

  it('laat door als er geen laatste kelner-actie bekend is', () => {
    assert.deepEqual(magVerzenden({ ...basis, secSindsKelnerActie: null }), {
      verstuur: true,
    });
  });
});

describe('magVerzenden — tempo-limiet (SPEC §2.8)', () => {
  it('houdt tegen als het venster vol zit', () => {
    assert.deepEqual(magVerzenden({ ...basis, getoondInVenster: 6 }), {
      verstuur: false,
      reden: 'TEMPO',
      loggen: true,
    });
  });

  it('laat de laatste in het venster nog door', () => {
    assert.deepEqual(magVerzenden({ ...basis, getoondInVenster: 5 }), {
      verstuur: true,
    });
  });

  it('negeert de limiet als hij op nul staat', () => {
    assert.deepEqual(
      magVerzenden({ ...basis, ctaMaxPerVenster: 0, getoondInVenster: 99 }),
      { verstuur: true },
    );
  });
});

describe('magVerzenden — CTA 12 wordt nooit geweigerd (SPEC §5.12)', () => {
  it('slaat block by busy over', () => {
    assert.deepEqual(
      magVerzenden({ ...basis, ctaNr: 12, secSindsKelnerActie: 0 }),
      { verstuur: true },
    );
  });

  it('slaat de tempo-limiet over', () => {
    assert.deepEqual(
      magVerzenden({ ...basis, ctaNr: 12, getoondInVenster: 99 }),
      { verstuur: true },
    );
  });

  it('respecteert wél de status: een uitgezette CTA 12 gaat niet', () => {
    const besluit = magVerzenden({ ...basis, ctaNr: 12, status: 'DISABLED' });
    assert.equal(besluit.verstuur, false);
  });
});

describe('prio-volgorde (SPEC §2.3)', () => {
  it("zet de mens-CTA's vlak achter 1 en 2", () => {
    assert.ok(prioVan(1) < prioVan(2));
    assert.ok(prioVan(2) < prioVan(9));
    assert.ok(prioVan(12) < prioVan(3));
  });

  it('zet 13 en 14 achteraan — die helpen de gast die er nu zit niet', () => {
    assert.ok(prioVan(13) > prioVan(8));
    assert.ok(prioVan(14) > prioVan(13));
  });

  it('kent geen CTA 4 meer — dat is de promo-permissie (SPEC §2.14)', () => {
    assert.equal(prioVan(4), Number.MAX_SAFE_INTEGER);
  });
});

describe('zichtbareKaarten (SPEC §2.3)', () => {
  const t = (min: number) => new Date(2026, 8, 12, 19, min, 0);

  it('toont er maximaal drie en zet de rest in de wachtrij', () => {
    const { zichtbaar, wachtrij } = zichtbareKaarten([
      { ctaNr: 8, gepushtOp: t(0) },
      { ctaNr: 1, gepushtOp: t(1) },
      { ctaNr: 6, gepushtOp: t(2) },
      { ctaNr: 10, gepushtOp: t(3) },
    ]);
    assert.deepEqual(
      zichtbaar.map((k) => k.ctaNr),
      [1, 10, 6],
    );
    assert.deepEqual(
      wachtrij.map((k) => k.ctaNr),
      [8],
    );
  });

  it('laat een wachtende gast voorgaan op een oudere systeemmelding', () => {
    const { zichtbaar } = zichtbareKaarten(
      [
        { ctaNr: 6, gepushtOp: t(0) },
        { ctaNr: 9, gepushtOp: t(30) },
      ],
      1,
    );
    assert.equal(zichtbaar[0]?.ctaNr, 9);
  });

  it('houdt bij gelijke prio de volgorde van binnenkomst aan', () => {
    const { zichtbaar } = zichtbareKaarten([
      { ctaNr: 1, gepushtOp: t(5) },
      { ctaNr: 1, gepushtOp: t(2) },
    ]);
    assert.deepEqual(zichtbaar[0]?.gepushtOp, t(2));
  });
});
