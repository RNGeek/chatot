// import * as React from 'react';
// import * as ReactDOM from 'react-dom';
// import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import './polyfill/AudioContext';

const MAX_RAND = 8192;
const MIN_FREQ = 800;
const GRAD = 0.02444;
const MAX_FREQ = GRAD * MAX_RAND + MIN_FREQ;

function main() {
  let canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  canvas.width = 1000;
  canvas.height = 500;
  let ctx = new AudioContext();
  let analyser = ctx.createAnalyser();
  // analyser.minDecibels = -90;
  analyser.maxDecibels = -40;
  // analyser.smoothingTimeConstant = 0.85;
  let gainNode = ctx.createGain();
  gainNode.gain.value = 0;

  navigator.mediaDevices.getUserMedia({audio: true}).then((stream: MediaStream) => {
    let source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    visualize(canvas, analyser, ctx);
    (document.getElementById("search") as HTMLButtonElement).addEventListener('click', (e) => {
      search();
    });
  }).catch((err: MediaStreamError) => {
    alert(err);
  });
}

function search() {
  let inputTextarea = document.getElementById("input") as HTMLTextAreaElement;
  let input = inputTextarea != null ? inputTextarea.value : "";
  let outputTextarea = document.getElementById("output") as HTMLTextAreaElement;
  let freqs = (input.match(/\d+/g) || []).map(x => Number(x));
  let results: number[] = [];
  for (let seed = 0; seed < 0x20000000; seed ++) {
    if (seed_hit(seed, freqs)) {
      for (let i = 0; i < 8; i ++) {
        results.push(seed + i * 0x20000000);
      }
    }
  }
  if (results.length > 0) {
    outputTextarea.value = results.map(x => hex(x)).join("\n");
  } else {
    outputTextarea.value = "not found";
  }
}

function hex(x: number) {
  return ("00000000" + x.toString(16)).slice(-8);
}

class LCG {
  seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  rand(): number {
    this.seed = (Math.imul(this.seed, 0x41c64e6d) + 0x6073) >>> 0;
    return this.seed >>> 16;
  }
}

function seed_hit(seed: number, freqs: number[]) {
  let lcg = new LCG(seed);
  for (let f of freqs) {
    let got = (lcg.rand() % 8192) * GRAD + MIN_FREQ;
    if (Math.abs(f - got) >= 2) {
      return false;
    }
  }
  return true;
}

eval("window.seed_hit = seed_hit;");

function visualize(canvas: HTMLCanvasElement, analyser: AnalyserNode, ctx: AudioContext) {
  let WIDTH = canvas.width;
  let HEIGHT = canvas.height;
  let canvasCtx = canvas.getContext('2d') as CanvasRenderingContext2D;
  try {
    analyser.fftSize = 32768;
  } catch(e) {}
  let bufferLength = 2000 * analyser.fftSize / ctx.sampleRate; // analyser.frequencyBinCount;
  let dataArray = new Uint8Array(bufferLength);
  let contiguousBigPoints : number [][] = [];

  canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

  let drawAlt = function() {
    requestAnimationFrame(drawAlt);

    analyser.getByteFrequencyData(dataArray);

    let bigPoints = retrieveBig(dataArray);
    let seen : Set<number> = new Set();
    for (let pt of bigPoints) {
      let set = false;
      for (let i = 0; i < contiguousBigPoints.length; i ++) {
        let [pt2, count] = contiguousBigPoints[i];
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
    let newCbp : number[][] = [];
    let chatot_growling = false;
    let added_pt : number|null = null;
    contiguousBigPoints.forEach(([pt, count]) => {
      let freq = pt * ctx.sampleRate / analyser.fftSize;
      let is_chatot = MIN_FREQ - 2 <= freq && freq < MAX_FREQ + 2;
      if (seen.has(pt)) {
        newCbp.push([pt, count]);
        if (is_chatot) {
          chatot_growling = true;
        } 
      } else {
        if (count >= 10 && is_chatot) {
          added_pt = pt;
        }
      }
    });
    contiguousBigPoints = newCbp;

    canvasCtx.drawImage(canvas, 1, 0, WIDTH - 1, HEIGHT, 0, 0, WIDTH - 1, HEIGHT);

    let max = 0;
    let maxFreq = 0;
    for (let i = 0; i < bufferLength; i++) {
      let mag = dataArray[i];
      if (max < mag) {
        max = mag;
        maxFreq = i * ctx.sampleRate / analyser.fftSize;
      }

      canvasCtx.fillStyle = 'hsl(' + ((1 - mag / 256) * 240) + ',50%,50%)';
      canvasCtx.fillRect(WIDTH - 1, (1 - i / bufferLength) * HEIGHT, WIDTH, (1 - (i + 1) / bufferLength) * HEIGHT);
    }
    let paragraph = document.getElementById('maxHz') as HTMLParagraphElement;
    paragraph.innerText = '♪ ' + String(Math.round(maxFreq)) + 'Hz';
    paragraph.style.backgroundColor = chatot_growling ? "#f9c94f" : "white";
    if (added_pt) {
      let textarea = document.getElementById("input") as HTMLTextAreaElement;
      if (textarea.value != '') {
        textarea.value += '\n';
      }
      textarea.value += Math.round(added_pt * ctx.sampleRate / analyser.fftSize);
    }
  };

  drawAlt();
}

function retrieveBig(data: Uint8Array) {
  let length = data.length;
  let res: number [][] = [];
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
    let [, , repr] = tuple;
    return repr;
  });
}

main();

// ReactDOM.render(
//   <App />,
//   document.getElementById('root') as HTMLElement
// );

registerServiceWorker();
