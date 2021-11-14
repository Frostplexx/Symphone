const { app, BrowserWindow } = require('electron');
const glasstron = require('glasstron');
const path = require('path');

var blur = true
var frame = true
var color = "#00000000"
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  if(process.platform === 'win32') {
    blur = false
    frame = false
    color = "#FFFFFFFF"
    console.log("this is windows")
  }
  const mainWindow = new glasstron.BrowserWindow({
    width: 900,
    height: 600,
    icon:'icon.ico',
    backgroundColor: color,
		resizable: false,
		title: "Symphone",
		autoHideMenuBar: true,
		frame: frame, // this is a requirement for transparent windows it seems
		blur: blur,
		blurType: "blurbehind",
		blurGnomeSigma: 1000,
		blurCornerRadius: 20,
		vibrancy: "fullscreen-ui",
    titleBarStyle: 'hiddenInset',
    webPreferences:{
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  });
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.commandLine.appendSwitch("enable-transparent-visuals");
app.on('ready', () => {
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
 

