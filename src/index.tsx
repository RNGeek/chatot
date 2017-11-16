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

function main() {
  const ctx = new AudioContext();

  // analyserの初期化
  const analyser = ctx.createAnalyser();
  // analyser.minDecibels = -90;
  analyser.maxDecibels = -40;
  // analyser.smoothingTimeConstant = 0.85;

  // マイクへのアクセス要求
  navigator.mediaDevices.getUserMedia({audio: true}).then((stream: MediaStream) => {
    // source(Microphone) ---> analyser
    const source = ctx.createMediaStreamSource(stream); // audio source node
    source.connect(analyser);

    visualize(analyser, ctx); // 音声の解析
  }).catch((err: MediaStreamError) => {
    alert(err);
  });
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

function search() {
  // 入出力
  const inputTextarea = document.getElementById('input') as HTMLTextAreaElement;
  const input = inputTextarea != null ? inputTextarea.value : '';
  const form = document.getElementById('form') as HTMLFormElement;

  // mode
  const radios = form.elements.namedItem('mode') as HTMLInputElement;
  const mode = radios ? radios.value as string : '';

  // 4gen 消費数検索
  const iptSeed4gen = form.elements.namedItem('seed-4gen') as HTMLInputElement;
  const iptFrame4gen = form.elements.namedItem('frame-4gen') as HTMLInputElement;
  const seed4gen = iptSeed4gen ? parseInt(iptSeed4gen.value, 16) : 0;
  const frame4gen = iptFrame4gen ? Number(iptFrame4gen.value) : 0;

  // 5gen 消費数検索
  const iptSeed5gen = form.elements.namedItem('seed-5gen') as HTMLInputElement;
  const iptFrame5gen = form.elements.namedItem('frame-5gen') as HTMLInputElement;
  const seed5gen = iptSeed5gen ? parseUint64(iptSeed5gen.value) : new Uint64(0, 0);
  const frame5gen = iptFrame5gen ? Number(iptFrame5gen.value) : 0;

  const freqs = input.split('\n').map(x => Number(x));
  const results: string[] = [];

  let result;
  switch (mode) {
    case '4gen-seed':
      result = searchSeedForGen4(freqs);
      break;
    case '4gen-frame':
      result = searchFrameForGen4(freqs, seed4gen, frame4gen);
      break;
    case '5gen-frame':
      result = searchFrameForGen5(freqs, seed5gen, frame5gen);
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
