const { app, Menu, Tray, nativeImage } = require('electron');
import config from './config';

let tray = null;
app.on('ready', () => {
    tray = new Tray(nativeImage.createFromPath(config.root + '/icons/256x256.png').resize({ width: 18, height: 18 }));
    tray.on('click', () => {
        app.mainWindow.isVisible() ? app.mainWindow.hide() : app.mainWindow.show();
    });
    const contextMenu = Menu.buildFromTemplate([{
        label: "退出",
        click() {
            app.quit();
        }
    }]);
    tray.setToolTip('挖钱宝');
    tray.setContextMenu(contextMenu);
});