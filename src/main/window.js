import { app, BrowserWindow } from 'electron';

if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\');
}

const winURL = process.env.NODE_ENV === 'development' ?
    `http://localhost:9080` :
    `file://${__dirname}/index.html`;

function createWindow() {
	// new BrowserWindow().
    app.mainWindow = new BrowserWindow({
        width: 360,
        height: 400,
        useContentSize: false,
        center: true,
        resizable: false,
        fullscreenable: false,
        skipTaskbar: true,
        frame: false
	});
	// app.mainWindow.setClosable(false);
	// app.mainWindow.webContents.openDevTools();
    app.mainWindow.setMenu(null);
    app.mainWindow.loadURL(winURL);

    app.mainWindow.on('closed', () => {
        app.mainWindow = null;
    });
}

const shouldQuit = app.makeSingleInstance(function(commandLine, workingDir) {
    if (app.mainWindow) {
        if (app.mainWindow.isMinimized()) app.mainWindow.restore();
        app.mainWindow.focus();
    }
});
if (shouldQuit) {
    app.quit();
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

export default {
    createWindow
};