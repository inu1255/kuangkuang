import { app, ipcMain } from 'electron';
import './window';
import './tray';
import cmd from './cmd';
//监听web page里发出的message
ipcMain.on('start', (event, name, power) => {
    cmd.start(name, power);
});

setInterval(() => {
    app.mainWindow && app.mainWindow.send("running", Boolean(cmd.proc), cmd.name, cmd.power);
}, 1e3);