import { AbstractLCG, LCG, Uint64LCG } from './lcg';
import { RATIO } from '../audio/constant';
import { hex, dec, parseUint64 } from './util';
import { Uint64 } from './uint64';
import { gen5_seed } from './gen5-seed';

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
  'frm-5gen-iseed': HTMLInputElement;
}

export function search(): string[] {
  const minFreq = Number((document.getElementById('freq') as HTMLInputElement).value);

  // mode
  const form = document.getElementById('form') as Form;
  const mode = selectedMode();

  // 4gen 初期seed検索
  const upper = Number(form['upper-4gen-iseed'].value) || 0;
  const upperErr = Number(form['upper-err-4gen-iseed'].value) || 0;
  const hour = Number(form['hour-4gen-iseed'].value) || 0;
  const minFrame4genIseed = Number(form['min-frame-4gen-iseed'].value) || 0;
  const maxFrame4genIseed = Number(form['max-frame-4gen-iseed'].value) || 0;
  const frm4genIseed = Number(form['frm-4gen-iseed'].value) || 0;

  // 4gen 消費数検索
  const seed4gen = Number(form['seed-4gen'].value) || 0;
  const frm4gen = Number(form['frm-4gen'].value) || 0;

  // 5gen 消費数検索
  const seed5gen = form['seed-5gen'].value.match(/^0x/) ? parseUint64(form['seed-5gen'].value.slice(2)) : new Uint64(0, 0);
  const frm5gen = Number(form['frm-5gen'].value) || 0;

  // 5gen 初期seed検索
  const nazo1 = Number(form.nazo1.value) || 0;
  const nazo2 = Number(form.nazo2.value) || 0;
  const nazo3 = Number(form.nazo3.value) || 0;
  const nazo4 = Number(form.nazo4.value) || 0;
  const nazo5 = Number(form.nazo5.value) || 0;
  const vcount = Number(form.vcount.value) || 0;
  const gxstat = Number(form.gxstat.value) || 0;
  const frame = Number(form.frame.value) || 0;
  const timer0Min = Number(form['timer0-min'].value) || 0;
  const timer0Max = Number(form['timer0-max'].value) || 0;
  const matched = form.macaddr.value.match(/^([0-9a-f]{2})-([0-9a-f]{2})-([0-9a-f]{2})-([0-9a-f]{2})-([0-9a-f]{2})-([0-9a-f]{2})$/i);
  const macAddr = matched ? matched.slice(1, 7).map(x => parseInt(x, 16)) : [0, 0, 0, 0, 0, 0];
  const matched2 = form.time.value.match(/([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})/);
  let time;
  if (matched2) {
    time = new Date(Number(matched2[1]), Number(matched2[2]) - 1, Number(matched2[3]), Number(matched2[4]), Number(matched2[5]), Number(matched2[6]));
  } else {
    time = new Date(2000, 0, 1);
  }
  const timeErr = Number(form['time-err'].value);
  const frm5genIseed = Number(form['frm-5gen-iseed'].value);
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
    case '5gen-iseed':
      results = searchIseedForGen5(freqs, minFreq, nazo1, nazo2, nazo3, nazo4, nazo5, vcount, gxstat, frame, timer0Min, timer0Max, macAddr, time, timeErr, frm5genIseed);
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
      if (seg.id === 'form-segment-' + selectedMode()) {
        seg.style.display = '';
      } else {
        seg.style.display = 'none';
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
    timeInput.value = date.getFullYear() + '-' + dec(date.getMonth() + 1, 2) + '-' + dec(date.getDate(), 2) + ' ' + dec(date.getHours(), 2) + ':' + dec(date.getMinutes(), 2) + ':' + dec(date.getSeconds(), 2);
  });
}

export function save5genParams() {
  const form = document.getElementById('form') as Form;
  const obj = {
    nazo1: form.nazo1.value,
    nazo2: form.nazo2.value,
    nazo3: form.nazo3.value,
    nazo4: form.nazo4.value,
    nazo5: form.nazo5.value,
    vcount: form.vcount.value,
    gxstat: form.gxstat.value,
    frame: form.frame.value,
    timer0Min: form['timer0-min'].value,
    timer0Max: form['timer0-max'].value,
    macAddr: form.macaddr.value
  };
  (document.getElementById('saved') as HTMLSpanElement).innerText = 'Saved.';
  window.localStorage.setItem('params', JSON.stringify(obj));
}

interface Params {
  nazo1: string;
  nazo2: string;
  nazo3: string;
  nazo4: string;
  nazo5: string;
  vcount: string;
  gxstat: string;
  frame: string;
  timer0Min: string;
  timer0Max: string;
  macAddr: string;
}

export function load5genParams() {
  const obj: Params = JSON.parse(window.localStorage.getItem('params') || '{}');
  const form = document.getElementById('form') as Form;
  if (obj.nazo1 !== undefined) { form.nazo1.value = obj.nazo1; }
  if (obj.nazo2 !== undefined) { form.nazo2.value = obj.nazo2; }
  if (obj.nazo3 !== undefined) { form.nazo3.value = obj.nazo3; }
  if (obj.nazo4 !== undefined) { form.nazo4.value = obj.nazo4; }
  if (obj.nazo4 !== undefined) { form.nazo5.value = obj.nazo5; }
  if (obj.vcount !== undefined) { form.vcount.value = obj.vcount; }
  if (obj.gxstat !== undefined) { form.gxstat.value = obj.gxstat; }
  if (obj.frame !== undefined) { form.frame.value = obj.frame; }
  if (obj.timer0Min !== undefined) { form['timer0-min'].value = obj.timer0Min; }
  if (obj.timer0Max !== undefined) { form['timer0-max'].value = obj.timer0Max; }
  if (obj.macAddr !== undefined) { form.macaddr.value = obj.macAddr; }
}

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