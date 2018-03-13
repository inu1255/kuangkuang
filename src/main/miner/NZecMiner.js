import Miner from './base';

class AZecMiner extends Miner {
    constructor() {
        super([
            `miner.exe`,
            "--server", "zec.f2pool.com",
            "--port", "3357",
            "--user", `t1MnvXFuqWnCtmepFaGXh2r4NBm4Nb9riyg.$USER`,
            "--pass", "x",
            "--fee", "0",
            "--pec"
        ], "cmd/ncard/");
		this.type = "zec";
    }
}

export default AZecMiner;