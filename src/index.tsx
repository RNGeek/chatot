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

function main() {
  const ctx = new AudioContext();

  // analyserの初期化
  const analyser = ctx.createAnalyser();
  // analyser.minDecibels = -90;
  analyser.maxDecibels = -40;
  // analyser.smoothingTimeConstant = 0.85;
  
  // gainの初期化
  const gainNode = ctx.createGain();
  gainNode.gain.value = 0;

  // マイクへのアクセス要求
  navigator.mediaDevices.getUserMedia({audio: true}).then((stream: MediaStream) => {
    /*
     * source(Microphone) ---> analyser
     *                     \-> gainNode -> destination(Speaker)
     */
    const source = ctx.createMediaStreamSource(stream); // audio source node
    source.connect(analyser);
    source.connect(gainNode);
    gainNode.connect(ctx.destination);

    // 音声の解析
    visualize(analyser, ctx);
  }).catch((err: MediaStreamError) => {
    alert(err);
  });
  (document.getElementById('search') as HTMLButtonElement).addEventListener('click', (e) => {
    search();
  });
}

function search() {
  // 入出力
  const inputTextarea = document.getElementById('input') as HTMLTextAreaElement;
  const input = inputTextarea != null ? inputTextarea.value : '';
  const outputTextarea = document.getElementById('output') as HTMLTextAreaElement;
  const form = document.getElementById('form') as HTMLFormElement;
  const radios = form.elements.namedItem('mode') as HTMLInputElement;
  const mode = radios ? radios.value as string : '';
  const iptSeed4gen = form.elements.namedItem('seed-4gen') as HTMLInputElement;
  const iptFrame4gen = form.elements.namedItem('frame-4gen') as HTMLInputElement;
  const iptSeed5gen = form.elements.namedItem('seed-5gen') as HTMLInputElement;
  const iptFrame5gen = form.elements.namedItem('frame-5gen') as HTMLInputElement;
  const seed4gen = iptSeed4gen ? parseInt(iptSeed4gen.value, 16) : 0;
  const frame4gen = iptFrame4gen ? Number(iptFrame4gen.value) : 0;
  const seed5gen = iptSeed5gen ? parseUint64(iptSeed5gen.value) : new Uint64(0, 0);
  const frame5gen = iptFrame5gen ? Number(iptFrame5gen.value) : 0;

  const freqs = input.split('\n').map(x => Number(x));
  const results: string[] = [];

  switch (mode) {
    case '4gen-seed':
      for (let seed = 0; seed < 0x20000000; seed ++) {
        if (isValidSeed(new LCG(seed), freqs)) {
          for (let i = 0; i < 8; i ++) {
            results.push(hex(seed + i * 0x20000000));
          }
        }
      }
      break;
    case '4gen-frame': {
      const lcg = new LCG(seed4gen);
      for (let frame = 0; frame < frame4gen; frame ++) {
        if (isValidSeed(new LCG(lcg.seed), freqs)) {
          results.push(String(frame));
        }
        lcg.rand();
      }
      break;
    }
    case '5gen-frame': {
      const lcg = new Uint64LCG(seed5gen);
      for (let frame = 0; frame < frame5gen; frame ++) {
        if (isValidSeed(new Uint64LCG(lcg.seed), freqs)) {
          results.push(String(frame));
        }
        lcg.rand();
      }
      break;
    }
    default:
  }
  if (results.length > 0) {
    outputTextarea.value = results.join('\n');
  } else {
    outputTextarea.value = 'not found';
  }
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

main();

// ReactDOM.render(
//   <App />,
//   document.getElementById('root') as HTMLElement
// );

registerServiceWorker();
