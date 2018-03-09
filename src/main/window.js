import { app, BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';

if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\');
}

const winURL = process.env.NODE_ENV === 'development' ?
    `http://localhost:9080` :
    `file://${__dirname}/index.html`;

function createWindow() {
    app.mainWindow = new BrowserWindow({
        width: 360,
        height: 360,
        useContentSize: false,
        center: true,
        resizable: false
    });
	app.mainWindow.setMenu(null);
    app.mainWindow.loadURL(winURL);

    app.mainWindow.on('closed', () => {
        app.mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    // if (process.platform !== 'darwin') {
    //     app.quit();
    // }
});

app.on('activate', () => {
    if (app.mainWindow === null) {
        createWindow();
    }
});

autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall();
});

app.on('ready', () => {
    if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates();
});