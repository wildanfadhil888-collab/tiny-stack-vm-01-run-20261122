// Tiny stack VM for make.fun's tiny-stack-vm-01 bounty: 32-bit wrapping ints,
// a 256-value stack, a 64-deep call stack, 256 words of memory, ten traps with
// their own exit codes, a 1,000,000 step limit and a 65,536 byte output limit.
// Run: mkdir -p out && MAKEFUN_INPUT_DIR=practice/input MAKEFUN_OUTPUT_DIR=out node main.ts
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const STEP_LIMIT = 1000000;
const OUT_LIMIT = 65536;

function run(prog: Uint8Array, inp: Uint8Array): { out: Uint8Array; code: number } {
  const n = prog.length;
  const st = new Int32Array(256);
  const cs = new Int32Array(64);
  const mem = new Int32Array(256);
  const out = new Uint8Array(OUT_LIMIT);
  let sp = 0, cp = 0, ip = 0, pc = 0, steps = 0, len = 0;
  const end = (code: number) => ({ out: out.slice(0, len), code });
  for (;;) {
    if (steps === STEP_LIMIT) return end(10);
    if (pc < 0 || pc >= n) return end(9);
    const op = prog[pc];
    const imm = op === 1 ? 1 : op === 2 ? 4 : op >= 0x30 && op <= 0x33 ? 2 : 0;
    if (pc + imm >= n) return end(9);
    steps++;
    const nx = pc + 1 + imm;
    pc = nx;
    switch (op) {
      case 0x00: return end(0);
      case 0x01:
        if (sp > 255) return end(3);
        st[sp++] = (prog[nx - 1] << 24) >> 24;
        break;
      case 0x02:
        if (sp > 255) return end(3);
        st[sp++] = prog[nx - 4] | (prog[nx - 3] << 8) | (prog[nx - 2] << 16) | (prog[nx - 1] << 24);
        break;
      case 0x03:
        if (sp < 1) return end(2);
        sp--;
        break;
      case 0x04:
        if (sp < 1) return end(2);
        if (sp > 255) return end(3);
        st[sp] = st[sp - 1];
        sp++;
        break;
      case 0x05:
        if (sp < 2) return end(2);
        { const t = st[sp - 1]; st[sp - 1] = st[sp - 2]; st[sp - 2] = t; }
        break;
      case 0x06:
        if (sp < 2) return end(2);
        if (sp > 255) return end(3);
        st[sp] = st[sp - 2];
        sp++;
        break;
      case 0x07:
        if (sp < 3) return end(2);
        { const t = st[sp - 3]; st[sp - 3] = st[sp - 2]; st[sp - 2] = st[sp - 1]; st[sp - 1] = t; }
        break;
      case 0x10: case 0x11: case 0x12: case 0x13: case 0x14: case 0x15: case 0x16:
      case 0x18: case 0x19: case 0x1a: case 0x1c: case 0x1d: case 0x1e:
      case 0x20: case 0x21: case 0x22: {
        if (sp < 2) return end(2);
        const b = st[sp - 1];
        const a = st[sp - 2];
        let r: number;
        switch (op) {
          case 0x10: r = (a + b) | 0; break;
          case 0x11: r = (a - b) | 0; break;
          case 0x12: r = Math.imul(a, b); break;
          case 0x13: if (b === 0) return end(4); r = (a / b) | 0; break;
          case 0x14: if (b === 0) return end(4); r = (a % b) | 0; break;
          case 0x15: if (b === 0) return end(4); r = Math.floor((a >>> 0) / (b >>> 0)) | 0; break;
          case 0x16: if (b === 0) return end(4); r = ((a >>> 0) % (b >>> 0)) | 0; break;
          case 0x18: r = a & b; break;
          case 0x19: r = a | b; break;
          case 0x1a: r = a ^ b; break;
          case 0x1c: r = a << (b & 31); break;
          case 0x1d: r = a >> (b & 31); break;
          case 0x1e: r = (a >>> (b & 31)) | 0; break;
          case 0x20: r = a === b ? 1 : 0; break;
          case 0x21: r = a < b ? 1 : 0; break;
          default: r = (a >>> 0) < (b >>> 0) ? 1 : 0; break;
        }
        sp -= 2;
        st[sp++] = r;
        break;
      }
      case 0x17:
        if (sp < 1) return end(2);
        st[sp - 1] = -st[sp - 1] | 0;
        break;
      case 0x1b:
        if (sp < 1) return end(2);
        st[sp - 1] = ~st[sp - 1];
        break;
      case 0x30: case 0x31: case 0x32: {
        const rel = ((prog[nx - 2] | (prog[nx - 1] << 8)) << 16) >> 16;
        if (op !== 0x30) {
          if (sp < 1) return end(2);
          const v = st[--sp];
          if ((op === 0x31) !== (v === 0)) break;
        }
        pc = nx + rel;
        break;
      }
      case 0x33:
        if (cp === 64) return end(7);
        cs[cp++] = nx;
        pc = prog[nx - 2] | (prog[nx - 1] << 8);
        break;
      case 0x34:
        if (cp === 0) return end(8);
        pc = cs[--cp];
        break;
      case 0x40: {
        if (sp < 1) return end(2);
        const addr = st[sp - 1];
        if (addr < 0 || addr > 255) return end(6);
        st[sp - 1] = mem[addr];
        break;
      }
      case 0x41: {
        if (sp < 2) return end(2);
        const addr = st[sp - 1];
        if (addr < 0 || addr > 255) return end(6);
        mem[addr] = st[sp - 2];
        sp -= 2;
        break;
      }
      case 0x50: {
        if (sp < 1) return end(2);
        const s = String(st[sp - 1]);
        if (len + s.length > OUT_LIMIT) return end(11);
        sp--;
        for (let i = 0; i < s.length; i++) out[len++] = s.charCodeAt(i);
        break;
      }
      case 0x51:
        if (sp < 1) return end(2);
        if (len + 1 > OUT_LIMIT) return end(11);
        out[len++] = st[--sp] & 255;
        break;
      case 0x52:
        if (sp > 255) return end(3);
        st[sp++] = ip < inp.length ? inp[ip++] : -1;
        break;
      case 0x53:
        if (sp < 1) return end(2);
        return end(st[--sp] & 255);
      default:
        return end(5);
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
