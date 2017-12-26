import { getMaxFftSize } from './getMaxFftSize';
import { RATIO } from './constant';

export function setupCanvas() {
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  canvas.width = 1000;
  canvas.height = 500;
  return canvas;  
}

export function updateCanvas(canvas: HTMLCanvasElement, dataArray: Uint8Array, freqUnit: number) {
  const canvasCtx = canvas.getContext('2d');
  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  const bufferLength = dataArray.length;
  if (!canvasCtx) { return; }
  canvasCtx.drawImage(canvas, 1, 0, WIDTH - 1, HEIGHT, 0, 0, WIDTH - 1, HEIGHT);
  
  for (let i = 0; i < bufferLength; i++) {
    const mag = dataArray[i];

    if (mag > 250) {
      canvasCtx.fillStyle = 'white';
    } else {
      canvasCtx.fillStyle = 'hsl(' + ((1 - mag / 256) * 240) + ',50%,50%)';
    }
    canvasCtx.fillRect(WIDTH - 1, (1 - i / bufferLength) * HEIGHT, WIDTH, (1 - (i + 1) / bufferLength) * HEIGHT);
  }
}
