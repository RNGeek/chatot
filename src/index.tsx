// import * as React from 'react';
// import * as ReactDOM from 'react-dom';
// import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import './polyfill/AudioContext';
import { Uint64 } from './rng/uint64';
import { hex, parseUint64 } from './rng/util';
import { LCG, Uint64LCG, AbstractLCG } from './rng/lcg';
import { getMaxFftSize } from './audio/getMaxFftSize';
import { MIN_FREQ, GRAD } from './audio/constant';
import { visualize } from './audio/visualize';
import { searchSeedForGen4, searchFrameForGen4, searchFrameForGen5 } from './rng/search';

async function main() {

  // マイクへのアクセス要求

  try {
    const stream = await navigator.mediaDevices.getUserMedia({audio: true});
    const ctx = new AudioContext();

    // source(Microphone) ---> analyser
    const source = ctx.createMediaStreamSource(stream); // audio source node

    // analyserの初期化
    const analyser = ctx.createAnalyser();
    // analyser.minDecibels = -90;
    analyser.maxDecibels = -40;
    // analyser.smoothingTimeConstant = 0.85;
    source.connect(analyser);

    visualize(analyser, ctx); // 音声の解析
  } catch (e) {
    alert(e);
  }

  (document.getElementById('search') as HTMLButtonElement).addEventListener('click', (e) => {
    const results = search();
    const outputTextarea = document.getElementById('output') as HTMLTextAreaElement;
    if (results.length > 0) {
      outputTextarea.value = results.join('\n');
    } else {
      outputTextarea.value = 'not found';
    }
  });
}

interface Form extends HTMLFormElement {
  'mode': HTMLInputElement;
  'seed-4gen': HTMLInputElement;
  'frame-4gen': HTMLInputElement;
  'seed-5gen': HTMLInputElement;
  'frame-5gen': HTMLInputElement;
}

// 16進数に変換する. ただし空文字列は 0 に変換される.
function parseHexString(str: string): number {
  const num = parseInt(str, 16);
  return num === NaN ? 0 : num;
}

function search(): string[] {
  // 入出力
  const input = (document.getElementById('input') as HTMLTextAreaElement).value;
  const form = document.getElementById('form') as Form;

  // mode
  const mode = form.mode.value;

  // 4gen 消費数検索
  const seed4gen = parseInt(form['seed-4gen'].value, 16) || 0; // NaN を 0 として扱う
  const frame4gen = parseInt(form['frame-4gen'].value, 10) || 0; // NaN を 0 として扱う

  // 5gen 消費数検索
  const seed5gen = parseUint64(form['seed-5gen'].value);
  const frame5gen = parseInt(form['frame-5gen'].value, 10) || 0; // NaN を 0 として扱う

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

main();

// ReactDOM.render(
//   <App />,
//   document.getElementById('root') as HTMLElement
// );

registerServiceWorker();
