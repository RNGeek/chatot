import { getMaxFftSize } from './getMaxFftSize';
import { RATIO } from './constant';
import { setupCanvas, updateCanvas } from './visualize';

export class Analyser {
  ctx: AudioContext;
  analyserNode: AnalyserNode;
  bufferLength: number;
  dataArray: Uint8Array;
  contiguousBigPoints: number [][];
  canvas: HTMLCanvasElement;
  getFreq: () => number;
  getmaxDecibels: () => number;
  setMaxHz: (f: number) => void;
  appendToInput: (freq: number) => void;
  setChatotGrowling: (chatotGrowling: boolean) => void;

  async start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      this.ctx = new AudioContext();
      const source = this.ctx.createMediaStreamSource(stream);
      this.analyserNode = this.ctx.createAnalyser();
      this.analyserNode.maxDecibels = -40;
      source.connect(this.analyserNode);
      this.canvas = setupCanvas();
      this.analyserNode.fftSize = Math.min(32768, getMaxFftSize());
      this.bufferLength = 2000 * this.analyserNode.fftSize / this.ctx.sampleRate;
      this.dataArray = new Uint8Array(this.bufferLength);
      this.contiguousBigPoints = [];
      this.drawAlt();
    } catch (e) {
      alert(e);
    }
  }
  drawAlt() {
    requestAnimationFrame(this.drawAlt.bind(this));
    const MIN_FREQ = this.getFreq();
    const MAX_FREQ = (RATIO + 1) * MIN_FREQ;
    const maxDecibels = this.getmaxDecibels();

    if (-100 < maxDecibels && maxDecibels <= 0) {
        this.analyserNode.maxDecibels = maxDecibels;
    }

    this.analyserNode.getByteFrequencyData(this.dataArray);

    const bigPoints = retrieveBig(this.dataArray);
    const seen: Set<number> = new Set();
    for (const pt of bigPoints) {
      let set = false;
      for (let i = 0; i < this.contiguousBigPoints.length; i ++) {
        const [pt2, count] = this.contiguousBigPoints[i];
        if (Math.abs(pt - pt2) <= 2) {
          this.contiguousBigPoints[i] = [pt, count + 1];
          set = true;
        }
      }
      if (!set) {
        this.contiguousBigPoints.push([pt, 1]);
      }
      seen.add(pt);
    } 
    const newCbp: number[][] = [];
    let chatotGrowling = false;
    let addedPt: number|null = null;
    this.contiguousBigPoints.forEach(([pt, count]) => {
      const freq = pt * this.ctx.sampleRate / this.analyserNode.fftSize;
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
    this.contiguousBigPoints = newCbp;

    const freqUnit = this.ctx.sampleRate / this.analyserNode.fftSize;
    let max = 0;
    let maxFreq = 0;
    for (let i = 0; i < this.bufferLength; i++) {
      const mag = this.dataArray[i];
      if (max < mag) {
        max = mag;
        maxFreq = i * freqUnit;
      }
    }
    this.setMaxHz(Math.round(maxFreq));
    this.setChatotGrowling(chatotGrowling);
    if (addedPt) {
      this.appendToInput(Math.round(addedPt * freqUnit));
    }
    updateCanvas(this.canvas, this.dataArray, freqUnit);
  }
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