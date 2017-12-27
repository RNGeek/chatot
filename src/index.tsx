import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import './polyfill/AudioContext';
import { analyze } from './audio/analyze';
import { searchFromForm } from './rng/searchFromForm';

async function main() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({audio: true}); // マイクへのアクセス要求
    const ctx = new AudioContext();

    // source(Microphone) ---> analyser
    const source = ctx.createMediaStreamSource(stream); // audio source node

    // analyserの初期化
    const analyser = ctx.createAnalyser();
    analyser.maxDecibels = -40;
    source.connect(analyser);

    analyze(analyser, ctx);
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
