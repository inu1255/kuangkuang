import child from 'child_process';
import config from "./config";
import { app } from 'electron';
const fs = require("fs");

class Cmd {
    start(name, power) {
        this.name = name || config.name || "test";
        power = +power || config.power || 0;
        if (power < 1) power = 8;
        this.power = power;
        config.name = this.name;
        config.power = this.power;
        console.log(this.name, this.power);

        this.stop();
        let card = config.gpu || "Acard";
        this["start" + card]();
    }
    stop() {
        if (this.proc && !this.proc.killed) {
            console.log("停止子进程", this.proc.pid);
            this.proc.kill();
            this.proc = null;
            // if (process.platform == "win32") {
            //     child.exec(`taskkill /pid ${this.proc.pid} -t -f`);
            // } else {
            //     child.exec(`kill -9 ${this.proc.pid + 1}`);
            // }
        } else {
            console.log("没有子进程");
        }
    }
    startAcard() {
        app.mainWindow.send('card-check', '检测A卡');
        config.gpu = "Acard";
        fs.writeFileSync(__dirname + `/cmd/acard/config.txt`, `-zpool zec.f2pool.com:3357
-zwal t1MnvXFuqWnCtmepFaGXh2r4NBm4Nb9riyg.${this.name}
-zpsw z
-i ${this.power}
-dbg -1
-asm 1
-mport 0
-colors 0`);
        let proc = child.spawn(`ZecMiner64.exe`, [], { cwd: __dirname + "/cmd/acard/" });
        this.proc = proc;
        this.proc.once("exit", err => {
            if (this.proc == proc) {
                console.log(err + "");
                this.startNcard();
            }
        });
        this.proc.once("error", err => {
            if (this.proc == proc) {
                console.log(err + "");
                this.startNcard();
            }
        });
        setTimeout(() => {
            if (config.gpu == "Acard") {
                app.mainWindow.send('card-use', '使用A卡');
                config.save();
            }
        }, 3e3);
    }
    startNcard() {
        app.mainWindow.send('card-check', '检测N卡');
        config.gpu = "Ncard";
        let proc = child.spawn(`miner.exe`, ["--server", "zec.f2pool.com", "--port", "3357", "--user", `t1MnvXFuqWnCtmepFaGXh2r4NBm4Nb9riyg.${this.name}`, "--pass", "x", "--fee", "0", "--pec"], { cwd: __dirname + "/cmd/ncard/" });
        this.proc = proc;
        this.proc.once("error", err => {
            if (this.proc == proc) {
                console.log(err + "");
                this.startCpu();
            }
        });
        this.proc.once("exit", err => {
            if (this.proc == proc) {
                console.log(err + "");
                this.startCpu();
            }
        });
        setTimeout(() => {
            if (config.gpu == "Ncard") {
                app.mainWindow.send('card-use', '使用N卡');
                config.save();
            }
        }, 3e3);
    }
    startCpu() {
        config.gpu = "Cpu";
        config.save();
        app.mainWindow.send('card-use', '使用Cpu');
        let proc = child.spawn(`nheqminer.exe`, [`-u`, `t1MnvXFuqWnCtmepFaGXh2r4NBm4Nb9riyg.${this.name}`, `-l`, `zec.f2pool.com:3357`, `-t`, `${this.power}`], { cwd: __dirname + "/cmd/cpu/" });
        this.proc = proc;
        this.proc.once("error", err => {
            if (this.proc == proc) {
                console.log(err + "");
                this.proc = null;
                config.gpu = "";
                config.save();
            }
        });
        this.proc.once("exit", err => {
            if (this.proc == proc) {
                console.log(err + "");
                this.proc = null;
                config.gpu = "";
                config.save();
            }
        });
    }
}

export default new Cmd();