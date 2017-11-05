// Safari のための Polyfill

interface Window {
  AudioContext: {};
  webkitAudioContext: {};
}

window.AudioContext = window.AudioContext || window.webkitAudioContext;
