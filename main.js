const { app, BrowserWindow, session } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const pageURL = pathToFileURL(path.join(__dirname, 'turtles.html')).href;
let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000, height: 850, title: 'Sea Turtle Track Detector',
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true }
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url !== pageURL) event.preventDefault();
  });
  mainWindow.loadFile(path.join(__dirname, 'trackdetector110726ver1.html'));
}
app.whenReady().then(() => {
  const trusted = wc => !!mainWindow && wc === mainWindow.webContents && wc.getURL() === pageURL;
  session.defaultSession.setPermissionCheckHandler((wc, permission, origin, details) =>
    trusted(wc) && permission === 'media' && details.mediaType === 'video'
  );
  session.defaultSession.setPermissionRequestHandler((wc, permission, callback, details) => {
    callback(trusted(wc) && permission === 'media' && details.mediaTypes?.length > 0 && details.mediaTypes.every(type => type === 'video'));
  });
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
