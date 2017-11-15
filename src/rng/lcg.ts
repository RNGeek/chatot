import { LongLong } from './longLong';

export const A = new LongLong(0x5d588b65, 0x6c078965);
export const B = new LongLong(0, 0x269ec3);

export abstract class AbstractLCG {
  abstract rand_n(n: number): number;
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
  rand_n(n: number) {
    return this.rand() % n;
  }
}

export class LongLongLCG extends AbstractLCG {
  seed: LongLong;
  
  constructor(seed: LongLong) {
    super();
    this.seed = new LongLong(seed.high, seed.low);
  }
  rand(): number {
    this.seed.mul(A).add(B);
    return this.seed.high;
  }
  rand_n(n: number) {
    let r = this.rand();
    return new LongLong(0, r).mul(new LongLong(0, n)).high;
  }
}