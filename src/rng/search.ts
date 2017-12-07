import { AbstractLCG, LCG, Uint64LCG } from './lcg';
import { RATIO } from '../audio/constant';
import { hex, dec, parseUint64 } from './util';
import { Uint64 } from './uint64';

interface Form extends HTMLFormElement {
  'upper-4gen-iseed': HTMLInputElement;
  'upper-err-4gen-iseed': HTMLInputElement;
  'hour-4gen-iseed': HTMLInputElement;
  'min-frame-4gen-iseed': HTMLInputElement;
  'max-frame-4gen-iseed': HTMLInputElement;
  'frm-4gen-iseed': HTMLInputElement;
  'seed-4gen': HTMLInputElement;
  'frm-4gen': HTMLInputElement;
  'seed-5gen': HTMLInputElement;
  'frm-5gen': HTMLInputElement;
  'nazo1': HTMLInputElement;
  'nazo2': HTMLInputElement;
  'nazo3': HTMLInputElement;
  'nazo4': HTMLInputElement;
  'vcount': HTMLInputElement;
  'gxstat': HTMLInputElement;
  'frame': HTMLInputElement;
  'timer0-min': HTMLInputElement;
  'timer0-max': HTMLInputElement;
  'macaddr': HTMLInputElement;
  'time': HTMLInputElement; 
  'time-err': HTMLInputElement;
}

export function search(): string[] {
  const minFreq = Number((document.getElementById('freq') as HTMLInputElement).value);

  // mode
  const form = document.getElementById('form') as Form;
  const mode = selectedMode();

  // 4gen 初期seed検索
  const upper = Number(form['upper-4gen-iseed'].value) || 0; // NaN を 0 として扱う
  const upperErr = Number(form['upper-err-4gen-iseed'].value) || 0; // NaN を 0 として扱う
  const hour = Number(form['hour-4gen-iseed'].value) || 0; // NaN を 0 として扱う
  const minFrame4genIseed = Number(form['min-frame-4gen-iseed'].value) || 0; // NaN を 0 として扱う
  const maxFrame4genIseed = Number(form['max-frame-4gen-iseed'].value) || 0; // NaN を 0 として扱う
  const frm4genIseed = Number(form['frm-4gen-iseed'].value) || 0; // NaN を 0 として扱う
  
  // 4gen 消費数検索
  const seed4gen = Number(form['seed-4gen'].value) || 0; // NaN を 0 として扱う
  const frm4gen = Number(form['frm-4gen'].value) || 0; // NaN を 0 として扱う

  // 5gen 消費数検索
  const seed5gen = form['seed-5gen'].value.match(/^0x/) ? parseUint64(form['seed-5gen'].value.slice(2)) : new Uint64(0, 0);
  const frm5gen = Number(form['frm-5gen'].value) || 0; // NaN を 0 として扱う

  const input = (document.getElementById('input') as HTMLTextAreaElement).value;
  const freqs = input.split('\n').map(x => x === '?' ? 0 : parseInt(x, 10));

  let results: string[] = [];
  switch (mode) {
    case '4gen-seed':
      results = searchSeedForGen4(freqs, minFreq);
      break;
    case '4gen-iseed':
      results = searchIseedForGen4(freqs, upper, upperErr, hour, minFrame4genIseed, maxFrame4genIseed, frm4genIseed, minFreq);
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

function selectedMode() {
  return (document.querySelector('#form input[name="mode"]:checked') as HTMLInputElement).value;
}

export function setupFormSegments() {
  for (const radio of (Array.from(document.querySelectorAll('#form input[name="mode"]')) as HTMLInputElement[])) {
    radio.addEventListener('click', () => {
      update();
    });
  }
  update();

  function update() {
    for (const seg of (Array.from(document.querySelectorAll('div.form-segment')) as HTMLDivElement[])) {
      if (seg.id == "form-segment-"+selectedMode()) {
        seg.style.display = "";
      } else {
        seg.style.display = "none";
      }
    }
  }
}

export function setupNowTimeButton() {
  const form = document.getElementById('form') as Form;
  const upperInput = form['upper-4gen-iseed'];
  const hourInput = form['hour-4gen-iseed'];
  const button = document.getElementById('now-time-button') as HTMLButtonElement;
  button.addEventListener('click', () => {
    const date = new Date();
    upperInput.value = '0x' + (((date.getMonth() + 1) * date.getDate() + date.getMinutes() + date.getSeconds()) % 256).toString(16);
    hourInput.value = String(date.getHours());
  });
  const timeInput = form.time;
  const button2 = document.getElementById('now-time-button2') as HTMLButtonElement;
  button2.addEventListener('click', () => {
    const date = new Date();
    timeInput.value = date.getFullYear() + '-' + dec(date.getMonth(), 2) + '-' + dec(date.getDate(), 2) + ' ' + dec(date.getHours(), 2) + ':' + dec(date.getMinutes(), 2) + ':' + dec(date.getSeconds(), 2);
  });
}

export function searchIseedForGen4(freqs: number[], upper: number, upperErr: number, hour: number, minFrame: number, maxFrame: number, maxFrm: number, minFreq: number) {
  const results: string[] = [];
  for (let u = upper - upperErr; u <= upper + upperErr; u ++) {
    for (let frame = minFrame; frame <= maxFrame; frame ++) {
      const seed = (((u & 0xff) << 24) + (hour << 16) + frame) >>> 0;
      const lcg = new LCG(seed);
      for (let frm = 0; frm < maxFrm; frm ++) {
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
    if (f !== 0 && Math.abs(f - got) >= 2) {
      return false;
    }
  }
  return true;
}