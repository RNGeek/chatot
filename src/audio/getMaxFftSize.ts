/*
 * 動作環境における fftSize の最大値を返す
 */
export const getMaxFftSize = (): number => {
  const audioCtx = new AudioContext();
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048; // default fftSize
  try {
    while (true) {
      analyser.fftSize *= 2;
    }
  } catch {
    const max = analyser.fftSize;
    audioCtx.close();
    return max;
    // nothing
  }
};