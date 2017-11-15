import { LongLong } from './longLong';
import { AbstractLCG } from './lcg';

export function parseLongLong(str: string) {
  return new LongLong(parseInt(str.substr(0, 8), 16), parseInt(str.substr(8, 8), 16));
}

export function hex(x: number) {
  return ('00000000' + x.toString(16)).slice(-8);
}