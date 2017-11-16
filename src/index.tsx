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

const MAX_RAND = 8192;
const MIN_FREQ = 800;
const GRAD = 0.02444;
const MAX_FREQ = GRAD * MAX_RAND + MIN_FREQ;

function main() {
  const ctx = new AudioContext();
  const analyser = ctx.createAnalyser();
  // analyser.minDecibels = -90;
  analyser.maxDecibels = -40;
  // analyser.smoothingTimeConstant = 0.85;
  const gainNode = ctx.createGain();
  gainNode.gain.value = 0;

  navigator.mediaDevices.getUserMedia({audio: true}).then((stream: MediaStream) => {
    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    visualize(analyser, ctx);
  }).catch((err: MediaStreamError) => {
    alert(err);
  });
  (document.getElementById('search') as HTMLButtonElement).addEventListener('click', (e) => {
    search();
  });
}

function search() {
  const inputTextarea = document.getElementById('input') as HTMLTextAreaElement;
  const input = inputTextarea != null ? inputTextarea.value : '';
  const outputTextarea = document.getElementById('output') as HTMLTextAreaElement;
  const form = document.getElementById('form') as HTMLFormElement;
  const radios = form.elements.namedItem('mode');
  const mode = radios ? radios['value'] as string : '';
  const iptSeed4gen = form.elements.namedItem('seed-4gen') as HTMLInputElement;
  const iptFrame4gen = form.elements.namedItem('frame-4gen') as HTMLInputElement;
  const iptSeed5gen = form.elements.namedItem('seed-5gen') as HTMLInputElement;
  const iptFrame5gen = form.elements.namedItem('frame-5gen') as HTMLInputElement;
  const seed4gen = iptSeed4gen ? parseInt(iptSeed4gen.value, 16) : 0;
  const frame4gen = iptFrame4gen ? Number(iptFrame4gen.value) : 0;
  const seed5gen = iptSeed5gen ? parseUint64(iptSeed5gen.value) : new Uint64(0, 0);
  const frame5gen = iptFrame5gen ? Number(iptFrame5gen.value) : 0;

  const freqs = (input.match(/\d+/g) || []).map(x => Number(x));
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

function visualize(analyser: AnalyserNode, ctx: AudioContext) {
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  canvas.width = 1000;
  canvas.height = 500;

  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  const canvasCtx = canvas.getContext('2d') as CanvasRenderingContext2D;
  analyser.fftSize = Math.min(32768, getMaxFftSize());
  const bufferLength = 2000 * analyser.fftSize / ctx.sampleRate; // analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  let contiguousBigPoints: number [][] = [];

  canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

  const drawAlt = function() {
    requestAnimationFrame(drawAlt);

    analyser.getByteFrequencyData(dataArray);

    const bigPoints = retrieveBig(dataArray);
    const seen: Set<number> = new Set();
    for (const pt of bigPoints) {
      let set = false;
      for (let i = 0; i < contiguousBigPoints.length; i ++) {
        const [pt2, count] = contiguousBigPoints[i];
        if (Math.abs(pt - pt2) <= 2) {
          contiguousBigPoints[i] = [pt, count + 1];
          set = true;
        }
      }
      if (!set) {
        contiguousBigPoints.push([pt, 1]);
      }
      seen.add(pt);
    }
    const newCbp: number[][] = [];
    let chatotGrowling = false;
    let addedPt: number|null = null;
    contiguousBigPoints.forEach(([pt, count]) => {
      const freq = pt * ctx.sampleRate / analyser.fftSize;
      const isChatot = MIN_FREQ - 2 <= freq && freq < MAX_FREQ + 2;
      if (seen.has(pt)) {
        newCbp.push([pt, count]);
        if (isChatot) {
          chatotGrowling = true;
        } 
      } else {
        if (count >= 10 && isChatot) {
          addedPt = pt;
        }
      }
    });
    contiguousBigPoints = newCbp;

    canvasCtx.drawImage(canvas, 1, 0, WIDTH - 1, HEIGHT, 0, 0, WIDTH - 1, HEIGHT);

    let max = 0;
    let maxFreq = 0;
    for (let i = 0; i < bufferLength; i++) {
      const mag = dataArray[i];
      if (max < mag) {
        max = mag;
        maxFreq = i * ctx.sampleRate / analyser.fftSize;
      }

      canvasCtx.fillStyle = 'hsl(' + ((1 - mag / 256) * 240) + ',50%,50%)';
      canvasCtx.fillRect(WIDTH - 1, (1 - i / bufferLength) * HEIGHT, WIDTH, (1 - (i + 1) / bufferLength) * HEIGHT);
    }
    const paragraph = document.getElementById('maxHz') as HTMLParagraphElement;
    paragraph.innerText = '♪ ' + String(Math.round(maxFreq)) + 'Hz';
    paragraph.style.backgroundColor = chatotGrowling ? '#f9c94f' : 'white';
    if (addedPt) {
      const textarea = document.getElementById('input') as HTMLTextAreaElement;
      if (textarea.value !== '') {
        textarea.value += '\n';
      }
      textarea.value += Math.round(addedPt * ctx.sampleRate / analyser.fftSize);
    }
  };

  drawAlt();
}

function retrieveBig(data: Uint8Array) {
  const length = data.length;
  const res: number [][] = [];
  for (let i = 0; i < length; i ++) {
    if (data[i] > 250) {
      if (res.length > 0 && res[res.length - 1][1] === i - 1) {
        let [start, , repr, max] = res[res.length - 1];
        if (data[i] > max) {
            max = data[i];
            repr = i;
        }
        res[res.length - 1] = [start, i, repr, max];
      } else {
        res.push([i, i, i, data[i]]);
      }
    }
  }
  return res.map((tuple) => {
    const [, , repr] = tuple;
    return repr;
  });
}

main();

// ReactDOM.render(
//   <App />,
//   document.getElementById('root') as HTMLElement
// );

registerServiceWorker();
