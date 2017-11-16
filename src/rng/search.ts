import { AbstractLCG, LCG, Uint64LCG } from './lcg';
import { GRAD, MIN_FREQ } from '../audio/constant';
import { hex, parseUint64 } from './util';
import { Uint64 } from './uint64';

interface Form extends HTMLFormElement {
  'mode': HTMLInputElement;
  'seed-4gen': HTMLInputElement;
  'frame-4gen': HTMLInputElement;
  'seed-5gen': HTMLInputElement;
  'frame-5gen': HTMLInputElement;
}

export function search(): string[] {
  // mode
  const form = document.getElementById('form') as Form;
  const mode = form.mode.value;

  // 4gen 消費数検索
  const seed4gen = parseInt(form['seed-4gen'].value, 16) || 0; // NaN を 0 として扱う
  const frame4gen = parseInt(form['frame-4gen'].value, 10) || 0; // NaN を 0 として扱う

  // 5gen 消費数検索
  const seed5gen = parseUint64(form['seed-5gen'].value);
  const frame5gen = parseInt(form['frame-5gen'].value, 10) || 0; // NaN を 0 として扱う

  const input = (document.getElementById('input') as HTMLTextAreaElement).value;
  const freqs = input.split('\n').map(x => Number(x));

  let results: string[] = [];
  switch (mode) {
    case '4gen-seed':
      results = searchSeedForGen4(freqs);
      break;
    case '4gen-frame':
      results = searchFrameForGen4(freqs, seed4gen, frame4gen);
      break;
    case '5gen-frame':
      results = searchFrameForGen5(freqs, seed5gen, frame5gen);
      break;
    default:
  }

  return results;
}

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