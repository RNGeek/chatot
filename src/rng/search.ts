import { Uint64 } from './uint64';
import { gen5_seed } from './gen5-seed';
import { AbstractLCG, LCG, Uint64LCG } from './lcg';
import { RATIO } from '../audio/constant';
import { hex } from './util';

export function searchIseedForGen4(freqs: number[], upper: number, upperErr: number, hour: number, minFrame: number, maxFrame: number, maxFrm: number, minFreq: number) {
  const results: string[] = [];
  for (let u = upper - upperErr; u <= upper + upperErr; u++) {
    for (let frame = minFrame; frame <= maxFrame; frame++) {
      const seed = (((u & 0xff) << 24) + (hour << 16) + frame) >>> 0;
      const lcg = new LCG(seed);
      for (let frm = 0; frm < maxFrm; frm++) {
        if (isValidSeed(new LCG(lcg.seed), freqs, minFreq)) {
          results.push(hex(seed) + ' ' + String(frm));
        }
        lcg.rand();
      }
    }
  }
  return results;
}

export function searchSeedForGen4(freqs: number[], minFreq: number) {
  const results: string[] = [];
  for (let seed = 0; seed < 0x20000000; seed++) {
    if (isValidSeed(new LCG(seed), freqs, minFreq)) {
      for (let i = 0; i < 8; i++) {
        results.push(hex(seed + i * 0x20000000));
      }
    }
  }
  return results;
}

export function searchfrmForGen4(freqs: number[], seed: number, maxfrm: number, minFreq: number) {
  const results: string[] = [];
  const lcg = new LCG(seed);
  for (let frm = 0; frm < maxfrm; frm++) {
    if (isValidSeed(new LCG(lcg.seed), freqs, minFreq)) {
      results.push(String(frm));
    }
    lcg.rand();
  }
  return results;
}

export function searchfrmForGen5(freqs: number[], seed: Uint64, maxfrm: number, minFreq: number) {
  const results: string[] = [];
  const lcg = new Uint64LCG(seed);
  for (let frm = 0; frm < maxfrm; frm++) {
    if (isValidSeed(new Uint64LCG(lcg.seed), freqs, minFreq)) {
      results.push(String(frm));
    }
    lcg.rand();
  }
  return results;
}

export function searchIseedForGen5(
  freqs: number[], minFreq: number,
  nazo1: number, nazo2: number, nazo3: number, nazo4: number, nazo5: number,
  vcount: number, gxstat: number, frame: number, timer0Min: number, timer0Max: number, macAddr: number[],
  time: Date, timeErr: number, maxfrm: number
) {
  const results: string[] = [];

  const joypad = 0x2fff;
  const timeBase = time.getTime();
  for (let i = -timeErr; i <= timeErr; i++) {
    const tm = new Date(timeBase + i * 1000);
    for (let timer0 = timer0Min; timer0 <= timer0Max; timer0++) {
      const seed = gen5_seed(
        nazo1, nazo2, nazo3, nazo4, nazo5,
        vcount, timer0, gxstat, frame,
        macAddr, tm, joypad
      );
      const lcg = new Uint64LCG(seed);
      for (let frm = 0; frm < maxfrm; frm++) {
        if (isValidSeed(new Uint64LCG(lcg.seed), freqs, minFreq)) {
          results.push(hex(seed.high) + hex(seed.low) + ' time=' + tm.toLocaleString() + ' timer0=0x' + timer0.toString(16) + ' f=' + frm);
        }
        lcg.rand();
      }
    }
  }

  return results;
}

function isValidSeed(lcg: AbstractLCG, freqs: number[], minFreq: number) {
  for (const f of freqs) {
    const got = (lcg.randMod(8192) * RATIO / 8192 + 1) * minFreq;
    if (f !== 0 && Math.abs(f - got) >= 2) {
      return false;
    }
  }
  return true;
}