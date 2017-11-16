import { Uint64 } from './uint64';
import { AbstractLCG } from './lcg';

export function parseUint64(str: string) {
  return new Uint64(parseInt(str.substr(0, 8), 16), parseInt(str.substr(8, 8), 16));
}

export function hex(x: number) {
  return ('00000000' + x.toString(16)).slice(-8);
}