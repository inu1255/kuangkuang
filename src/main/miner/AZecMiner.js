import Miner from './base';

class AZecMiner extends Miner {
    constructor() {
        super([
            `ZecMiner64.exe`,
            "-zpool", `zec.f2pool.com:3357`,
            "-zwal", `t1MnvXFuqWnCtmepFaGXh2r4NBm4Nb9riyg.$USER`,
            "-zpsw", `z`,
            "-i", `$POWER`,
            "-dbg", `-1`,
            "-asm", `1`,
            "-mport", `0`,
            "-colors", `0`
		], "cmd/acard/");
		this.type = "zec";
    }
}

export default AZecMiner;