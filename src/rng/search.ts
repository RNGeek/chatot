import { AbstractLCG, LCG, Uint64LCG } from './lcg';
import { RATIO } from '../audio/constant';
import { hex, parseUint64 } from './util';
import { Uint64 } from './uint64';

interface Form extends HTMLFormElement {
  'mode': HTMLInputElement;
  'seed-4gen': HTMLInputElement;
  'frm-4gen': HTMLInputElement;
  'seed-5gen': HTMLInputElement;
  'frm-5gen': HTMLInputElement;
}

export function search(): string[] {
  const minFreq = Number((document.getElementById('freq') as HTMLInputElement).value);

  // mode
  const form = document.getElementById('form') as Form;
  const mode = form.mode.value;

  // 4gen 消費数検索
  const seed4gen = parseInt(form['seed-4gen'].value, 16) || 0; // NaN を 0 として扱う
  const frm4gen = parseInt(form['frm-4gen'].value, 10) || 0; // NaN を 0 として扱う

  // 5gen 消費数検索
  const seed5gen = parseUint64(form['seed-5gen'].value);
  const frm5gen = parseInt(form['frm-5gen'].value, 10) || 0; // NaN を 0 として扱う

  const input = (document.getElementById('input') as HTMLTextAreaElement).value;
  const freqs = input.split('\n').map(x => Number(x));

  let results: string[] = [];
  switch (mode) {
    case '4gen-seed':
      results = searchSeedForGen4(freqs, minFreq);
      break;
    case '4gen-frm':
      results = searchfrmForGen4(freqs, seed4gen, frm4gen, minFreq);
      break;
    case '5gen-frm':
      results = searchfrmForGen5(freqs, seed5gen, frm5gen, minFreq);
      break;
    default:
  }

  return results;
}

export function searchSeedForGen4(freqs: number[], minFreq: number) {
  const results: string[] = [];
  for (let seed = 0; seed < 0x20000000; seed ++) {
    if (isValidSeed(new LCG(seed), freqs, minFreq)) {
      for (let i = 0; i < 8; i ++) {
        results.push(hex(seed + i * 0x20000000));
      }
    }
  }
  return results;
}

export function searchfrmForGen4(freqs: number[], seed: number, maxfrm: number, minFreq: number) {
  const results: string[] = [];
  const lcg = new LCG(seed);
  for (let frm = 0; frm < maxfrm; frm ++) {
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
  for (let frm = 0; frm < maxfrm; frm ++) {
    if (isValidSeed(new Uint64LCG(lcg.seed), freqs, minFreq)) {
      results.push(String(frm));
    }
    lcg.rand();
  }
  return results;
}

function isValidSeed(lcg: AbstractLCG, freqs: number[], minFreq: number) {
  for (const f of freqs) {
    const got = (lcg.randMod(8192) * RATIO / 8192 + 1) * minFreq;
    if (Math.abs(f - got) >= 2) {
      return false;
    }
  }
  return true;
}