import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
function run(p: Uint8Array, q: Uint8Array): { out: Uint8Array; code: number } {
  const n = p.length, st = new Int32Array(256), cs = new Int32Array(64), m = new Int32Array(256), o = new Uint8Array(65536);
  let sp = 0, cp = 0, ip = 0, pc = 0, s = 0, ln = 0;
  const e = (c: number) => ({ out: o.slice(0, ln), code: c });
  for (;;) {
    if (s === 1e6) return e(10);
    if (pc < 0 || pc >= n) return e(9);
    const op = p[pc], im = op === 1 ? 1 : op === 2 ? 4 : op >= 0x30 && op <= 0x33 ? 2 : 0;
    if (pc + im >= n) return e(9);
    s++;
    const nx = pc + 1 + im;
    pc = nx;
    switch (op) {
      case 0x00: return e(0);
      case 0x01:
        if (sp > 255) return e(3);
        st[sp++] = (p[nx - 1] << 24) >> 24;
        break;
      case 0x02:
        if (sp > 255) return e(3);
        st[sp++] = p[nx - 4] | (p[nx - 3] << 8) | (p[nx - 2] << 16) | (p[nx - 1] << 24);
        break;
      case 0x03:
        if (sp < 1) return e(2);
        sp--;
        break;
      case 0x04:
        if (sp < 1) return e(2);
        if (sp > 255) return e(3);
        st[sp] = st[sp - 1];
        sp++;
        break;
      case 0x05:
        if (sp < 2) return e(2);
        { const t = st[sp - 1]; st[sp - 1] = st[sp - 2]; st[sp - 2] = t; }
        break;
      case 0x06:
        if (sp < 2) return e(2);
        if (sp > 255) return e(3);
        st[sp] = st[sp - 2];
        sp++;
        break;
      case 0x07:
        if (sp < 3) return e(2);
        { const t = st[sp - 3]; st[sp - 3] = st[sp - 2]; st[sp - 2] = st[sp - 1]; st[sp - 1] = t; }
        break;
      case 0x10: case 0x11: case 0x12: case 0x13: case 0x14: case 0x15: case 0x16:
      case 0x18: case 0x19: case 0x1a: case 0x1c: case 0x1d: case 0x1e:
      case 0x20: case 0x21: case 0x22: {
        if (sp < 2) return e(2);
        const b = st[sp - 1], a = st[sp - 2];
        let r: number;
        switch (op) {
          case 0x10: r = (a + b) | 0; break;
          case 0x11: r = (a - b) | 0; break;
          case 0x12: r = Math.imul(a, b); break;
          case 0x13: if (b === 0) return e(4); r = (a / b) | 0; break;
          case 0x14: if (b === 0) return e(4); r = (a % b) | 0; break;
          case 0x15: if (b === 0) return e(4); r = Math.floor((a >>> 0) / (b >>> 0)) | 0; break;
          case 0x16: if (b === 0) return e(4); r = ((a >>> 0) % (b >>> 0)) | 0; break;
          case 0x18: r = a & b; break;
          case 0x19: r = a | b; break;
          case 0x1a: r = a ^ b; break;
          case 0x1c: r = a << (b & 31); break;
          case 0x1d: r = a >> (b & 31); break;
          case 0x1e: r = (a >>> (b & 31)) | 0; break;
          case 0x20: r = a === b ? 1 : 0; break;
          case 0x21: r = a < b ? 1 : 0; break;
          default: r = (a >>> 0) < (b >>> 0) ? 1 : 0;
        }
        sp -= 2;
        st[sp++] = r;
        break;
      }
      case 0x17:
        if (sp < 1) return e(2);
        st[sp - 1] = -st[sp - 1] | 0;
        break;
      case 0x1b:
        if (sp < 1) return e(2);
        st[sp - 1] = ~st[sp - 1];
        break;
      case 0x30: case 0x31: case 0x32: {
        const rel = ((p[nx - 2] | (p[nx - 1] << 8)) << 16) >> 16;
        if (op !== 0x30) {
          if (sp < 1) return e(2);
          const v = st[--sp];
          if ((op === 0x31) !== (v === 0)) break;
        }
        pc = nx + rel;
        break;
      }
      case 0x33:
        if (cp === 64) return e(7);
        cs[cp++] = nx;
        pc = p[nx - 2] | (p[nx - 1] << 8);
        break;
      case 0x34:
        if (cp === 0) return e(8);
        pc = cs[--cp];
        break;
      case 0x40: {
        if (sp < 1) return e(2);
        const a = st[sp - 1];
        if (a < 0 || a > 255) return e(6);
        st[sp - 1] = m[a];
        break;
      }
      case 0x41: {
        if (sp < 2) return e(2);
        const a = st[sp - 1];
        if (a < 0 || a > 255) return e(6);
        m[a] = st[sp - 2];
        sp -= 2;
        break;
      }
      case 0x50: {
        if (sp < 1) return e(2);
        const w = String(st[sp - 1]);
        if (ln + w.length > 65536) return e(11);
        sp--;
        for (let i = 0; i < w.length; i++) o[ln++] = w.charCodeAt(i);
        break;
      }
      case 0x51:
        if (sp < 1) return e(2);
        if (ln + 1 > 65536) return e(11);
        o[ln++] = st[--sp] & 255;
        break;
      case 0x52:
        if (sp > 255) return e(3);
        st[sp++] = ip < q.length ? q[ip++] : -1;
        break;
      case 0x53:
        if (sp < 1) return e(2);
        return e(st[--sp] & 255);
      default:
        return e(5);
    }
  }
}
const I = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const O = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
for (const id of readdirSync(I).sort()) {
  const r = run(readFileSync(join(I, id, 'program.bin')), readFileSync(join(I, id, 'input.bin')));
  mkdirSync(join(O, id), { recursive: true });
  writeFileSync(join(O, id, 'stdout.bin'), r.out);
  writeFileSync(join(O, id, 'exit.txt'), `${r.code}\n`);
}
