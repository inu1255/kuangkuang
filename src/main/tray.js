const { app, Menu, Tray, nativeImage } = require('electron');

let tray = null;
app.on('ready', () => {
    tray = new Tray(nativeImage.createFromPath('./build/icons/256x256.png').resize({ width: 18, height: 18 }));
    tray.on('click', () => {
        app.mainWindow.isVisible() ? app.mainWindow.hide() : app.mainWindow.show();
	});
	const contextMenu = Menu.buildFromTemplate([{
		label: "退出",
		click(){
			app.quit();
		}
	}]);
    tray.setToolTip('挖钱宝');
    tray.setContextMenu(contextMenu);
});
