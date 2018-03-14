import { app, ipcMain } from 'electron';
import './window';
import './tray';
import cmd from './cmd';
import config from "./config";

function send(type, msg) {
    app.mainWindow && app.mainWindow.send(type, msg);
}

//监听web page里发出的message
ipcMain.on('start', (event, name, power, what) => {
    console.log("开始");
    cmd.start(name, power, what);
});

ipcMain.on('stop', (event, name, power) => {
    console.log("停止");
    cmd.stop();
});

ipcMain.on('refresh', (event, name, power) => {
    console.log("刷新");
    cmd.setName(name, power);
    cmd.info();
});

ipcMain.on('autostart', (event, flag) => {
    console.log("自启动");
    cmd.autostart(flag);
});

ipcMain.on('hide', (event, flag) => {
    app.mainWindow.hide();
});

ipcMain.on('move', (event, move) => {
    app.mainWindow.setPosition(move.x, move.y);
});

ipcMain.on('config', (event, c) => {
    if (c) {
        Object.assign(config, c);
        config.save();
    }
    send("config", config);
});

var prev = {};
setInterval(() => {
    // console.log("检查");
    cmd.check().then(running => {
        var ok = false;
        for (let k in running) {
            if (running[k] != prev[k]) {
                ok = true;
                break;
            }
        }
        if (ok) {
            send("set", { running });
        }
    });
}, 1e3);

app.on("ready", function() {
    cmd.init();
});