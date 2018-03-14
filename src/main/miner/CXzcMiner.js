import Miner from './base';

class AZecMiner extends Miner {
    constructor() {
        super([
            // `sleep`,`60`,
            `cpuminer-avx2.exe`,
            `-a`, `lyra2z`,
            `-o`, `stratum+tcp://xzc.f2pool.com:5740`,
            `-u`, `aMcwhRHAFZzovpcjaTKmoyUdURJLfbvk97.$NAME`,
            `-p`, `password`
        ], "cmd/cpu/");
        this.url = "https://www.f2pool.com/zcoin/aMcwhRHAFZzovpcjaTKmoyUdURJLfbvk97";
        this.type = "xzc";
        this.exes = [
            "cpuminer-avx2.exe",
            "cpuminer-aes-avx.exe",
            "cpuminer-sse2.exe",
            "cpuminer-aes-sse42.exe",
            "cpuminer-avx2-sha.exe",
        ];
    }
    retry() {
        this.cmds[0] = this.exes[(10 - this.retry_times) % this.exes.length];
        this.run();
    }
    price() {
        return new Promise((resolve, reject) => {
            resolve(270);
        });
    }
}

export default AZecMiner;