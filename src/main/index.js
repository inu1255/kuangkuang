import { app, ipcMain } from 'electron';
import './window';
import './tray';
import cmd from './cmd';

//监听web page里发出的message
ipcMain.on('start', (event, name, power) => {
    console.log("开始");
    cmd.start(name, power);
});

ipcMain.on('stop', (event, name, power) => {
    console.log("停止");
    cmd.stop();
});

ipcMain.on('refresh', (event, name, power) => {
    console.log("刷新");
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
var prev = new Date().getTime();
setInterval(() => {
    console.log("检查");
    cmd.isrunning().then(ok => {
        ok = Boolean(ok && cmd.proc && !cmd.proc.killed);
        if (!ok && cmd.status == "run") {
            var cur = new Date().getTime();
            console.log("执行中,程序不存在");
            if (cur - prev > 30e3) {
                console.log("开始执行");
                cmd.start();
                prev = cur;
            }
        }
        app.mainWindow && app.mainWindow.send("set", {
            running: ok
        });
    }).catch(console.log);
}, 1e3);

app.on("ready", function() {
    cmd.init();
});