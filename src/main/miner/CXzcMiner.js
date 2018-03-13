import Miner from './base';

class AZecMiner extends Miner {
    constructor() {
        super([
            `cpuminer-avx2.exe`,
            `-a`, `lyra2z`,
            `-o`, `stratum+tcp://xzc.f2pool.com:5740`,
            `-u`, `aMcwhRHAFZzovpcjaTKmoyUdURJLfbvk97.$NAME`,
            `-p`, `password`
		], "cmd/cpu/");
		this.url = "https://www.f2pool.com/zcoin/aMcwhRHAFZzovpcjaTKmoyUdURJLfbvk97";
		this.type = "xzc";
	}
	price(){
		return new Promise((resolve,reject) => {
			resolve(270);
		});
	}
}

export default AZecMiner;