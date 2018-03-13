import child from 'child_process';
import config from "../config";
import { app } from 'electron';
import fetch from 'node-fetch';

class Miner {
    /**
     * @param {String[]} cmds 
     * @param {String} cwd
     */
    constructor(cmds, cwd) {
        this.cmds = cmds;
        this.cwd = cwd;
        this.type = this.type || "";
    }
    send(type, msg) {
        app.mainWindow && app.mainWindow.send(type, msg);
    }
    log(msg) {
        this.send("log", this.cmds[0] + ": " + msg);
        console.log.apply(console, [this.cmds[0] + ": "].concat(Array.from(arguments)));
    }
    start(id, name, power) {
        let restart = this.id != id || this.power != power;
        this.id = id;
        this.name = name;
        this.power = power;
        if (restart) {
            this.stop();
        }
        this.retry = 10;
        this.run();
    }
    run() {
        if (this.retry > 0 && !this.proc) {
            let cmds = this.cmds.map(x => x.replace("$NAME", this.id).replace("$POWER", this.power));
            let proc = child.spawn(cmds[0], cmds.slice(1), { cwd: config.root + "/" + this.cwd });
            this.proc = proc;
            this.proc.once("exit", err => {
                if (proc == this.proc) {
                    this.log(err);
                    this.proc = null;
                    this.retry--;
                }
            });
            this.proc.once("error", err => {
                if (proc == this.proc) {
                    this.log(err);
                    this.proc = null;
                    this.retry--;
                }
            });
        }
    }
    stop() {
        this.retry = 0;
        if (this.proc) {
            this.log("停止子进程", this.proc.pid);
            this.proc.kill();
        } else {
            this.log("没有子进程");
        }
        this.proc = null;
    }
    isrunning() {
        return new Promise((resolve, reject) => {
            var cmd = process.platform == 'win32' ? 'tasklist' : 'ps aux';
            child.exec(cmd, (err, stdout, stderr) => {
                if (err) reject(err);
                else {
                    let ok = false;
                    stdout.split('\n').filter((line) => {
                        var p = line.trim().split(/\s+/);
                        if (p.indexOf(this.cmds[0]) >= 0) {
                            resolve(true);
                        }
                    });
                    if (!ok) {
                        resolve(false);
                    }
                }
            });
        });
    }
    /**
     * @return {Promise<Number>}
     */
    price() {
        return new Promise((resolve, reject) => {
            fetch("https://gateio.io/json_svr/query/?type=ask_bid_list_table&symbol=zec_btc").then(x => x.json()).then(data => {
                let price = JSON.parse(data.global_markets_table)[0].last_cny;
                resolve(price);
            }).catch(reject);
        });
    }
    /**
     * @return {Promise<Number>}
     */
    info() {
        return new Promise((resolve, reject) => {
            this.price().then(price => {
                let amount = 0;
                let percent = 0;
                fetch(this.url || "https://www.f2pool.com/zec/t1MnvXFuqWnCtmepFaGXh2r4NBm4Nb9riyg").then(x => x.text()).then(text => {
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
                        value = value * (1 - cost / 100);
                        total += value;
                        // this.log(this.name, this.id, name, value);
                        if (name == this.name || name == this.id) {
                            me = value;
                        }
                    });
                    percent = me / total || 0;
                    let oneday = price * amount * percent * 0.8;
                    this.log(price, amount, percent, oneday);
                    resolve(oneday);
                }).catch(reject);
            });
        });
    }
}

export default Miner;