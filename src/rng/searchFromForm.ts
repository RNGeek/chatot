import { Uint64 } from './uint64';
import { dec, parseUint64 } from './util';
import { searchSeedForGen4, searchIseedForGen4, searchfrmForGen4, searchIseedForGen5, searchfrmForGen5 } from './search';

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

export function searchFromForm(): string[] {
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
