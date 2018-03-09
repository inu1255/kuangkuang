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

setInterval(() => {
    app.mainWindow && app.mainWindow.send("running", Boolean(cmd.proc&&!cmd.proc.killed), cmd.name, cmd.power);
}, 1e3);