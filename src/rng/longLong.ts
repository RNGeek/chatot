export class LongLong {
  high: number;
  low: number;

  constructor(high: number, low: number) {
    this.high = high;
    this.low = low;
  }

  add(other: LongLong) {
    let low = this.low + other.low;
    let carry = this.low > 0x100000000 ? 1 : 0;
    this.low = low >>> 0;
    this.high = (this.high + other.high + carry) >>> 0;
    return this;
  }

  mul(other: LongLong) {
    let a0 = this.low & 0xffff;
    let a1 = this.low >>> 16;
    let b0 = other.low & 0xffff;
    let b1 = other.low >>> 16;

    this.high = (((a1 * b0 + a0 * b1 + (a0 * b0 >>> 16)) >>> 16) + a1 * b1 + Math.imul(this.low, other.high) + Math.imul(other.low, this.high)) >>> 0;
    this.low = Math.imul(this.low, other.low);
    return this;
  }
}