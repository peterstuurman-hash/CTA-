import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isDubbel,
  isRecentBesteld,
  type EerderSignaal,
} from './dedupe.ts';

const nu = new Date(2026, 8, 12, 19, 30, 0);
const geleden = (sec: number) => new Date(nu.getTime() - sec * 1000);

const eerder = (over: Partial<EerderSignaal> = {}): EerderSignaal => ({
  id: 's1',
  actie: 'WIL_BESTELLEN',
  tafelnr: 3,
  ontvangerNaam: 'Rutger',
  op: geleden(120),
  ...over,
});

describe('isDubbel (SPEC §10.3)', () => {
  it('herkent dezelfde tafel en actie binnen het venster', () => {
    const besluit = isDubbel({
      actie: 'WIL_BESTELLEN',
      tafelnr: 3,
      nu,
      dedupeVensterSec: 180,
      eerdere: [eerder()],
      doorgedrukt: false,
    });
    assert.equal(besluit.dubbel, true);
    if (besluit.dubbel) assert.equal(besluit.eerder.ontvangerNaam, 'Rutger');
  });

  it('laat door zodra het venster voorbij is', () => {
    const besluit = isDubbel({
      actie: 'WIL_BESTELLEN',
      tafelnr: 3,
      nu,
      dedupeVensterSec: 60,
      eerdere: [eerder()],
      doorgedrukt: false,
    });
    assert.equal(besluit.dubbel, false);
  });

  it('laat een andere actie op dezelfde tafel door', () => {
    const besluit = isDubbel({
      actie: 'WIL_AFREKENEN',
      tafelnr: 3,
      nu,
      dedupeVensterSec: 180,
      eerdere: [eerder()],
      doorgedrukt: false,
    });
    assert.equal(besluit.dubbel, false);
  });

  it('laat dezelfde actie op een andere tafel door', () => {
    const besluit = isDubbel({
      actie: 'WIL_BESTELLEN',
      tafelnr: 4,
      nu,
      dedupeVensterSec: 180,
      eerdere: [eerder()],
      doorgedrukt: false,
    });
    assert.equal(besluit.dubbel, false);
  });

  it('laat door als de melder heeft doorgedrukt', () => {
    const besluit = isDubbel({
      actie: 'WIL_BESTELLEN',
      tafelnr: 3,
      nu,
      dedupeVensterSec: 180,
      eerdere: [eerder()],
      doorgedrukt: true,
    });
    assert.equal(besluit.dubbel, false);
  });

  it('ontdubbelt een oproep aan de LG niet — die wordt samengevoegd (SPEC §5.12)', () => {
    const besluit = isDubbel({
      actie: 'ROEP_LG',
      tafelnr: null,
      nu,
      dedupeVensterSec: 180,
      eerdere: [eerder({ actie: 'ROEP_LG', tafelnr: null, op: geleden(10) })],
      doorgedrukt: false,
    });
    assert.equal(besluit.dubbel, false);
  });

  it('kiest het meest recente eerdere signaal', () => {
    const besluit = isDubbel({
      actie: 'WIL_BESTELLEN',
      tafelnr: 3,
      nu,
      dedupeVensterSec: 300,
      eerdere: [
        eerder({ id: 'oud', op: geleden(240) }),
        eerder({ id: 'nieuw', op: geleden(30) }),
      ],
      doorgedrukt: false,
    });
    assert.equal(besluit.dubbel && besluit.eerder.id, 'nieuw');
  });
});

describe('isRecentBesteld (SPEC §5.9)', () => {
  it('waarschuwt als er net is aangeslagen op die tafel', () => {
    assert.equal(
      isRecentBesteld({
        actie: 'WIL_BESTELLEN',
        laatsteOrderOp: geleden(30),
        nu,
        recenteOrderVensterSec: 120,
        doorgedrukt: false,
      }),
      true,
    );
  });

  it('waarschuwt niet als de order buiten het venster valt', () => {
    assert.equal(
      isRecentBesteld({
        actie: 'WIL_BESTELLEN',
        laatsteOrderOp: geleden(300),
        nu,
        recenteOrderVensterSec: 120,
        doorgedrukt: false,
      }),
      false,
    );
  });

  it('geldt alleen bij wil-bestellen: bij afrekenen zegt een order niets', () => {
    assert.equal(
      isRecentBesteld({
        actie: 'WIL_AFREKENEN',
        laatsteOrderOp: geleden(10),
        nu,
        recenteOrderVensterSec: 120,
        doorgedrukt: false,
      }),
      false,
    );
  });

  it('waarschuwt niet twee keer als de melder heeft doorgedrukt', () => {
    assert.equal(
      isRecentBesteld({
        actie: 'WIL_BESTELLEN',
        laatsteOrderOp: geleden(10),
        nu,
        recenteOrderVensterSec: 120,
        doorgedrukt: true,
      }),
      false,
    );
  });

  it('waarschuwt niet als er nog nooit is besteld', () => {
    assert.equal(
      isRecentBesteld({
        actie: 'WIL_BESTELLEN',
        laatsteOrderOp: null,
        nu,
        recenteOrderVensterSec: 120,
        doorgedrukt: false,
      }),
      false,
    );
  });
});
