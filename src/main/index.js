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

setInterval(() => {
    app.mainWindow && app.mainWindow.send("set", {
        running: Boolean(cmd.proc && !cmd.proc.killed)
    });
}, 1e3);

app.on("ready", function() {
	cmd.init();
});