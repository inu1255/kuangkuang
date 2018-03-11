const { app, Menu, Tray, nativeImage } = require('electron');
import { autoUpdater } from 'electron-updater';
import config from './config';
import win from './window';

let tray = null;

app.on("ready", function() {
    autoUpdater.checkForUpdatesAndNotify();
});

app.on('ready', () => {
    tray = new Tray(nativeImage.createFromPath(config.root + '/cmd/icons/256x256.png').resize({ width: 18, height: 18 }));
    tray.on('click', () => {
        if (!app.mainWindow) {
            win.createWindow();
        } else if (app.mainWindow.isVisible()) {
            app.mainWindow.hide();
        } else {
            app.mainWindow.show();
            autoUpdater.checkForUpdatesAndNotify();
        }
    });
    const contextMenu = Menu.buildFromTemplate([{
        label: "显示/隐藏",
        click() {
            if (!app.mainWindow) {
                win.createWindow();
            } else if (app.mainWindow.isVisible()) {
                app.mainWindow.hide();
            } else {
                app.mainWindow.show();
                autoUpdater.checkForUpdatesAndNotify();
            }
        }
    }, {
        label: "检查更新",
        click() {
            autoUpdater.checkForUpdatesAndNotify();
            autoUpdater.once("update-not-available", function(info) {
                app.mainWindow.send("update", "没有可用更新");
            });
        }
    }, {
        label: "退出",
        click() {
            app.quit();
        }
    }, ]);
    tray.setToolTip('挖钱宝');
    tray.setContextMenu(contextMenu);
});