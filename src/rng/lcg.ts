import { Uint64 } from './uint64';

export const A = new Uint64(0x5d588b65, 0x6c078965);
export const B = new Uint64(0, 0x269ec3);

export abstract class AbstractLCG {
  abstract randMod(n: number): number;
}

export class LCG extends AbstractLCG {
  seed: number;
  constructor(seed: number) {
    super();
    this.seed = seed;
  }
  rand(): number {
    this.seed = (Math.imul(this.seed, 0x41c64e6d) + 0x6073) >>> 0;
    return this.seed >>> 16;
  }
  randMod(n: number) {
    return this.rand() % n;
  }
}

export class Uint64LCG extends AbstractLCG {
  seed: Uint64;
  
  constructor(seed: Uint64) {
    super();
    this.seed = new Uint64(seed.high, seed.low);
  }
  rand(): number {
    this.seed.mul(A).add(B);
    return this.seed.high;
  }
  randMod(n: number) {
    let r = this.rand();
    return new Uint64(0, r).mul(new Uint64(0, n)).high;
  }
}