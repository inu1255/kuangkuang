import child from 'child_process';
import config from "./config";
import { app } from 'electron';
import fetch from 'node-fetch';

const cards = [{
    name: "A卡",
    cmds: (that) => [
        `ZecMiner64.exe`,
        "-zpool", `zec.f2pool.com:3357`,
        "-zwal", `t1MnvXFuqWnCtmepFaGXh2r4NBm4Nb9riyg.${that.id}`,
        "-zpsw", `z`,
        "-i", `${that.power}`,
        "-dbg", `-1`,
        "-asm", `1`,
        "-mport", `0`,
        "-colors", `0`
    ],
    cwd: "cmd/acard/"
}, {
    name: "N卡",
    cmds: (that) => [
        `miner.exe`,
        "--server", "zec.f2pool.com",
        "--port", "3357",
        "--user", `t1MnvXFuqWnCtmepFaGXh2r4NBm4Nb9riyg.${that.id}`,
        "--pass", "x",
        "--fee", "0",
        "--pec"
    ],
    cwd: "cmd/ncard/"
}, {
    name: "Cpu",
    cmds: (that) => [
        `NsCpuCNMiner64.exe`,
        "-o", "stratum+tcp://xmr.f2pool.com:13531",
        "-u", `4LYWaNAqVLsD2BoEqi64szTFV64R8xz7QPhxgHFeDrrPU5nii5uWGXh128UUYXayQHFUrjojugSByAyf2VHatc9gLA6htW8TvHJNWeiVyC.${that.id}`,
        "-p", "x"
    ],
    cwd: "cmd/cpu/"
}, {
    name: "Sleep",
    cmds: (that) => [
        `sleep`, "15"
    ],
    cwd: "cmd/cpu/"
}];

class Cmd {
    init() {}
    autostart(flag) {
        if (flag != null) {
            config.autostart = Boolean(flag);
            config.save();
        }
        console.log("autostart", config.autostart);
        this.send("set", { autostart: config.autostart });
        if (process.platform == "win32") {
            var regedit = require('regedit'); //引入regedit
            if (config.autostart) {
                regedit.putValue({
                    'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run': {
                        'kuangkuang': {
                            value: process.argv0,
                            type: 'REG_SZ' //type值为REG_DEFAULT时，不会自动创建新的name
                        }
                    }
                }, function(err) {
                    console.log(err);
                });
            } else {
                regedit.putValue({
                    'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run': {
                        'kuangkuang': {
                            value: "",
                            type: 'REG_SZ' //type值为REG_DEFAULT时，不会自动创建新的name
                        }
                    }
                }, function(err) {
                    console.log(err);
                });
            }
        }
    }
    info() {
        fetch("https://gateio.io/json_svr/query/?type=ask_bid_list_table&symbol=zec_btc").then(x => x.json()).then(data => {
            let price = JSON.parse(data.global_markets_table)[0].last_cny;
            let amount = 0;
            let percent = 0;
            fetch("https://www.f2pool.com/zec/t1MnvXFuqWnCtmepFaGXh2r4NBm4Nb9riyg").then(x => x.text()).then(text => {
                text.replace(/\d+\.\d+ ZEC/, (x) => {
                    amount = parseFloat(x);
                });
                let total = 0;
                let me = 0;
                text.replace(/<tr data-name="[\s\S]+?<\/tr>/g, (text) => {
                    var m = text.match(/<td style="text-align: center; vertical-align: middle;">[^<>]*</g);
                    var n = `<td style="text-align: center; vertical-align: middle;">`.length;
                    var name = m[0].slice(n).replace(/<$/, "");
                    var value = parseFloat(m[4].slice(n)) || 0;
                    var cost = parseFloat(m[5].slice(n)) || 0;
                    console.log(name, value, cost);
                    value = value * (1 - cost / 100);
                    total += value;
                    if (name == this.id || name == this.name) {
                        me = value;
                    }
                });
                percent = me / total || 0;
                this.oneday = price * amount * percent * 0.8;
                console.log(price, amount, percent, this.oneday);
                this.send("set", {
                    oneday: this.oneday
                });
            });
        });
    }
    start(name, power) {
        this.setName(name, power);
        this.autostart(null);
        fetch("http://ts.inu1255.cn:3001/api/user/info?account=" + this.name).then(x => x.json()).then(data => {
            data = data.data;
            this.id = data && data.id;
            this.info();
            this.send("set", {
                id: this.id,
                name: this.name,
                power: this.power,
                money: (data.money || 0) / 100,
                used_money: (data.used_money || 0) / 100,
            });
            this.stop();
            let i = (+config.gpu || 0) % cards.length;
            this.run(i);
        });
    }
    setName(name, power) {
        this.name = name || config.name || "test";
        power = +power || config.power || 0;
        if (power < 1) power = 8;
        this.power = power;
        config.name = this.name;
        config.power = this.power;
        console.log(this.name, this.power);
    }
    run(i) {
        if (i >= cards.length) {
            this.proc = null;
            config.gpu = 0;
            return;
        }
        let card = cards[i];
        let cmds = card.cmds(this);
        this.send('card-check', `检测${card.name}`);
        console.log(`在${card.cwd}执行:`, cmds.join(" "));
        let proc = child.spawn(cmds[0], cmds.slice(1), { cwd: config.root + "/" + card.cwd });
        this.proc = proc;
        this.proc.once("exit", err => {
            if (this.proc == proc) {
                console.log("退出", i, err + "");
                this.run(i + 1);
            }
        });
        this.proc.once("error", err => {
            if (this.proc == proc) {
                console.log("失败", i, err + "");
                this.run(i + 1);
            }
        });
        setTimeout(() => {
            console.log(config.gpu, i, card.name);
            if (this.proc = proc) {
                config.gpu = i;
                this.send('card-use', `${card.name}`);
                config.save();
            }
        }, 5e3);
    }
    send(type, msg) {
        app.mainWindow && app.mainWindow.send(type, msg);
    }
    stop() {
        if (this.proc && !this.proc.killed) {
            console.log("停止子进程", this.proc.pid);
            this.proc.kill();
            this.proc = null;
        } else {
            console.log("没有子进程");
        }
    }
}

export default new Cmd();