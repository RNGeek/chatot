import { Uint64 } from './uint64';
import { hex } from './util';

const K0 = 0x5a827999;
const K1 = 0x6ed9eba1;
const K2 = 0x8f1bbcdc;
const K3 = 0xca62c1d6;

const H0 = 0x67452301;
const H1 = 0xefcdab89;
const H2 = 0x98badcfe;
const H3 = 0x10325476;
const H4 = 0xc3d2e1f0;

function to_u32_little_endian(val: number) {
    return (((val & 0xff) << 24) | (((val >> 8) & 0xff) << 16) | (((val >> 16) & 0xff) << 8) | ((val >> 24) & 0xff)) >>> 0;
}

function to_bcd(val: number) {
    return ((val / 10) << 4) | (val % 10);
}

function sha1_circular_shift(bits: number, word: number) {
    return ((word << bits) | (word >>> (32 - bits)));
}

export function gen5_seed(
    nazo1: number, nazo2: number, nazo3: number, nazo4: number, nazo5: number,
    vcount: number, timer0: number, gxstat: number, frame: number,
    macAddr: number[], time: Date, joypad: number
) {
    let A: number;
    let B: number;
    let C: number;
    let D: number;
    let E: number;
    let temp: number;
    let t: number;
    const W = Array<number>(80).fill(0);
    const year = time.getFullYear() - 2000;
    const month = time.getMonth() + 1;
    const date = time.getDate();
    const day = time.getDay();
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();

    W[0] = to_u32_little_endian(nazo1);
    W[1] = to_u32_little_endian(nazo2);
    W[2] = to_u32_little_endian(nazo3);
    W[3] = to_u32_little_endian(nazo4);
    W[4] = to_u32_little_endian(nazo5);
    W[5] = to_u32_little_endian((vcount << 16) | timer0);
    W[6] = (macAddr[4] << 8) | macAddr[5];
    W[7] = to_u32_little_endian(
        gxstat ^ frame ^
        ((macAddr[3] << 24) |
            (macAddr[2] << 16) |
            (macAddr[1] << 8) |
            (macAddr[0]))
    );
    W[8] = (to_bcd(year) << 24) |
        (to_bcd(month) << 16) |
        (to_bcd(date) << 8) |
        day;
    W[9] = ((to_bcd(hours) |
        ((12 <= hours ? 1 : 0) << 6)) << 24) |
        (to_bcd(minutes) << 16) |
        (to_bcd(seconds) << 8);
    W[10] = 0x00000000;
    W[11] = 0x00000000;
    W[12] = to_u32_little_endian(joypad);
    W[13] = 0x80000000;
    W[14] = 0x00000000;
    W[15] = 0x000001A0;

    for (t = 16; t < 80; t++) {
        W[t] = sha1_circular_shift(1, W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16]);
    }

    A = H0;
    B = H1;
    C = H2;
    D = H3;
    E = H4;

    for (t = 0; t < 20; t++) {
        temp = sha1_circular_shift(5, A) + ((B & C) | ((~B) & D)) + E + W[t] + K0;
        E = D;
        D = C;
        C = sha1_circular_shift(30, B);
        B = A;
        A = temp;
    }

    for (t = 20; t < 40; t++) {
        temp = sha1_circular_shift(5, A) + (B ^ C ^ D) + E + W[t] + K1;
        E = D;
        D = C;
        C = sha1_circular_shift(30, B);
        B = A;
        A = temp;
    }

    for (t = 40; t < 60; t++) {
        temp = sha1_circular_shift(5, A) +
            ((B & C) | (B & D) | (C & D)) + E + W[t] + K2;
        E = D;
        D = C;
        C = sha1_circular_shift(30, B);
        B = A;
        A = temp;
    }

    for (t = 60; t < 80; t++) {
        temp = sha1_circular_shift(5, A) + (B ^ C ^ D) + E + W[t] + K3;
        E = D;
        D = C;
        C = sha1_circular_shift(30, B);
        B = A;
        A = temp;
    }

    const seedHigh = to_u32_little_endian(H1 + B) >>> 0;
    const seedLow = to_u32_little_endian(H0 + A) >>> 0;
    return new Uint64(seedHigh, seedLow);
}