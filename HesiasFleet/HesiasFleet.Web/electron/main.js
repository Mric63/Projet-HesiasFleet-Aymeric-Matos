const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;

function createWindow() {
    const win = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
        show: false,
    });

    win.once('ready-to-show', () => win.show());

    if (isDev) {
        win.loadURL('http://localhost:4200');
        win.webContents.openDevTools(); // win.webContents.openDevTools();
    } else {
        win.loadFile(path.join(__dirname, '../dist/hesias-fleet-web/browser/index.html'));
    }

    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});