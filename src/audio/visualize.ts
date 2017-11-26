import { getMaxFftSize } from './getMaxFftSize';
import { RATIO } from './constant';

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

function setupCanvas() {
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  canvas.width = 1000;
  canvas.height = 500;
  return canvas;  
}

function updateCanvas(canvas: HTMLCanvasElement, dataArray: Uint8Array, freqUnit: number) {
  const canvasCtx = canvas.getContext('2d');
  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  const bufferLength = dataArray.length;
  if (!canvasCtx) { return; }
  canvasCtx.drawImage(canvas, 1, 0, WIDTH - 1, HEIGHT, 0, 0, WIDTH - 1, HEIGHT);
  
  for (let i = 0; i < bufferLength; i++) {
    const mag = dataArray[i];

    canvasCtx.fillStyle = 'hsl(' + ((1 - mag / 256) * 240) + ',50%,50%)';
    canvasCtx.fillRect(WIDTH - 1, (1 - i / bufferLength) * HEIGHT, WIDTH, (1 - (i + 1) / bufferLength) * HEIGHT);
  }
}

export function visualize(analyser: AnalyserNode, ctx: AudioContext) {
  // const canvas = setupCanvas();

  analyser.fftSize = Math.min(32768, getMaxFftSize());
  const bufferLength = 2000 * analyser.fftSize / ctx.sampleRate; // analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  let contiguousBigPoints: number [][] = [];

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
    const MIN_FREQ = Number((document.getElementById('freq') as HTMLInputElement).value);
    const MAX_FREQ = (RATIO + 1) * MIN_FREQ;
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

    const freqUnit = ctx.sampleRate / analyser.fftSize;
    let max = 0;
    let maxFreq = 0;
    for (let i = 0; i < bufferLength; i++) {
      const mag = dataArray[i];
      if (max < mag) {
        max = mag;
        maxFreq = i * freqUnit;
      }
    }
    const paragraph = document.getElementById('maxHz') as HTMLParagraphElement;
    paragraph.innerText = '♪ ' + String(Math.round(maxFreq)) + 'Hz';
    paragraph.style.backgroundColor = chatotGrowling ? '#f9c94f' : 'white';
    if (addedPt) {
      const textarea = document.getElementById('input') as HTMLTextAreaElement;
      if (textarea.value !== '') {
        textarea.value += '\n';
      }
      textarea.value += Math.round(addedPt * freqUnit);
    }
    // updateCanvas(canvas, dataArray, freqUnit);
  };

  drawAlt();
}