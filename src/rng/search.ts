import { AbstractLCG, LCG, Uint64LCG } from './lcg';
import { GRAD, MIN_FREQ } from '../audio/constant';
import { hex } from './util';
import { Uint64 } from './uint64';

export function searchSeedForGen4(freqs: number[]) {
  const results: string[] = [];
  for (let seed = 0; seed < 0x20000000; seed ++) {
    if (isValidSeed(new LCG(seed), freqs)) {
      for (let i = 0; i < 8; i ++) {
        results.push(hex(seed + i * 0x20000000));
      }
    }
  }
  return results;
}

export function searchFrameForGen4(freqs: number[], seed: number, maxFrame: number) {
  const results: string[] = [];
  const lcg = new LCG(seed);
  for (let frame = 0; frame < maxFrame; frame ++) {
    if (isValidSeed(new LCG(lcg.seed), freqs)) {
      results.push(String(frame));
    }
    lcg.rand();
  }
  return results;
}

export function searchFrameForGen5(freqs: number[], seed: Uint64, maxFrame: number) {
  const results: string[] = [];
  const lcg = new Uint64LCG(seed);
  for (let frame = 0; frame < maxFrame; frame ++) {
    if (isValidSeed(new Uint64LCG(lcg.seed), freqs)) {
      results.push(String(frame));
    }
    lcg.rand();
  }
  return results;
}

function isValidSeed(lcg: AbstractLCG, freqs: number[]) {
  for (const f of freqs) {
    const got = (lcg.randMod(8192)) * GRAD + MIN_FREQ;
    if (Math.abs(f - got) >= 2) {
      return false;
    }
  }
  return true;
}