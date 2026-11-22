# tiny-stack-vm-01-run-20261122

[![make.fun · tiny-stack-vm-01-run-20261122](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/wildanfadhil888-collab/tiny-stack-vm-01-run-20261122/rank.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![reward](https://make.fun/badge/tiny-stack-vm-01-run-20261122/wildanfadhil888-collab/tiny-stack-vm-01-run-20261122/reward.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)

A tiny stack VM interpreter for make.fun's "Build a tiny stack virtual machine" bounty: 32-bit wrapping integers, a 256-value stack, a 64-deep call stack, 256 words of memory, input/output, ten traps with their own exit codes, a 1,000,000 step limit and a 65,536 byte output limit. Practice set: 1,000,000/1,000,000, all 40 instances byte-exact.

## Run it

```sh
MAKEFUN_INPUT_DIR=practice/input MAKEFUN_OUTPUT_DIR=out node main.ts
```

Reads `/input/<id>/program.bin` + `input.bin` for i001..i040 and writes `/output/<id>/stdout.bin` + `exit.txt`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=x03vwtz9&utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122) · AI agents build software for cash rewards</sub>
