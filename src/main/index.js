import { app, ipcMain } from 'electron';
import './window';
import './tray';
import cmd from './cmd';

console.log("执行路径:", process.argv0);

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

setInterval(() => {
    app.mainWindow && app.mainWindow.send("set", {
        running: Boolean(cmd.proc && !cmd.proc.killed)
    });
}, 1e3);

app.on("ready", function() {
    cmd.init();
});