import child from 'child_process';
import config from "./config";
import { app } from 'electron';
import fetch from 'node-fetch';
import Miner from './miner/base';
import AMiner from './miner/AZecMiner';
import NMiner from './miner/NZecMiner';
import CMiner from './miner/CXzcMiner';

class Cmd {
    constructor() {
        /** @type {Map<String,Miner>} */
        this.miners = new Map();
        this.miners.set("a", new AMiner());
        this.miners.set("n", new NMiner());
        this.miners.set("c", new CMiner());
    }
    init() {
		this.autostart(null);
    }
    autostart(flag) {
        if (flag != null) {
            config.autostart = Boolean(flag);
            config.save();
        }
        console.log("autostart", config.autostart);
        this.send("set", { autostart: config.autostart });
        if (process.platform == "win32") {
            if (config.autostart || config.autostart == null) {
                child.exec(`reg add HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run /v kuangkuang /t REG_SZ /d ${process.argv0} /f`, function(err, sout, serr) {
                    console.log(sout, serr);
                });
            } else {
                child.exec("reg delete HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run /v kuangkuang /f", function(err, sout, serr) {
                    console.log(sout, serr);
                });
            }
        }
    }
    setName(name, power) {
        return new Promise((resolve, reject) => {
            config.name = name || config.name || "test";
            power = +power || config.power || 0;
            if (power < 1) power = 8;
            config.power = power;
            fetch("http://ts.inu1255.cn:3001/api/user/info?account=" + config.name).then(x => x.json()).then(data => {
                data = data.data;
                config.id = data && data.id;
                this.info();
                this.send("set", {
                    id: config.id,
                    name: config.name,
                    power: config.power,
                    money: (data.money || 0) / 100,
                    used_money: (data.used_money || 0) / 100,
                });
                console.log(config.id, config.name, config.power);
                resolve(config.id);
            }).catch(reject);
        });
    }
    start(name, power, what) {
        what = config.what = what || config.what;
        if (!(what instanceof Array)) {
            what = config.what = ["a", "n", "c"];
        }
        this.setName(name, power).then(id => {
            console.log("----what", config.what);
            for (let kv of this.miners) {
                let k = kv[0];
                let miner = kv[1];
                if (what.indexOf(k) < 0) {
                    miner.stop();
                } else {
                    console.log("----start", miner.cmds[0]);
                    miner.start(id, name, power);
                }
            }
            config.save();
        });
    }
    stop() {
        for (let [k, miner] of this.miners) {
            miner.stop();
        }
    }
    send(type, msg) {
        app.mainWindow && app.mainWindow.send(type, msg);
    }
    info() {
        return new Promise((resolve, reject) => {
            let keys = [];
            let miners = [];
            for (let kv of this.miners) {
                keys.push(kv[0]);
                miners.push(kv[1]);
            }
            Promise.all(miners.map(x => x.info())).then((data) => {
                let what = {};
                for (let i = 0; i < data.length; i++) {
                    let type = miners[i].type;
                    what[type] = what[type] || [];
                    what[type].push(data[i]);
                }
                // console.log(what);
                let oneday = Object.values(what).reduce((a, b) => {
                    // console.log(a, b, b.reduce((a, b) => a + b, 0));
                    b = b.filter(x => x > 0);
                    if (b.length > 0)
                        return a + b.reduce((a, b) => a + b, 0) / b.length;
                    return a;
                }, 0);
                this.send("set", { oneday });
                resolve(oneday);
            }).catch(reject);
        });
    }
    check() {
        return new Promise((resolve, reject) => {
            let keys = [];
            let miners = [];
            for (let kv of this.miners) {
                keys.push(kv[0]);
                miners.push(kv[1]);
            }
            Promise.all(miners.map(x => x.isrunning())).then(data => {
                let what = {};
                for (let i = 0; i < data.length; i++) {
                    what[keys[i]] = data[i] && miners[i].proc;
                }
                resolve(what);
            }).catch(reject);
        });
    }
}

export default new Cmd();