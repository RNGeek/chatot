import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import './polyfill/AudioContext';
import { Uint64 } from './rng/uint64';
import { hex, parseUint64 } from './rng/util';
import { LCG, Uint64LCG, AbstractLCG } from './rng/lcg';
import { getMaxFftSize } from './audio/getMaxFftSize';
import { visualize } from './audio/visualize';
import { search, setupNowTimeButton, setupFormSegments, save5genParams, load5genParams } from './rng/search';

async function main() {
  // (document.getElementById('form') as HTMLFormElement).addEventListener('submit', (e) => {
  //   const results = search();
  //   const outputTextarea = document.getElementById('output') as HTMLTextAreaElement;
  //   if (results.length > 0) {
  //     outputTextarea.value = results.join('\n');
  //   } else {
  //     outputTextarea.value = 'not found';
  //   }
  // });
  // setupNowTimeButton();
  // setupFormSegments();
  // (document.getElementById('save-button') as HTMLButtonElement).addEventListener('click', (e) => {
  //   save5genParams();
  // });
  // load5genParams();
  try {
    const stream = await navigator.mediaDevices.getUserMedia({audio: true}); // マイクへのアクセス要求
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
}

main();

ReactDOM.render(
  <App />,
  document.getElementById('root') as HTMLElement
);

registerServiceWorker();
