const { app, BrowserWindow, shell } = require('electron');
const glasstron = require('glasstron');
const path = require('path');

const getToken = require("./getToken");

var settingsPath = path.join(__dirname, "settings.json").toString();

var blur = true
var frame = true
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  if(process.platform === 'win32') {
    blur = false
    frame = false
  }
  const mainWindow = new glasstron.BrowserWindow({
    width: 900,
    height: 600,
    icon:'icon.ico',
    backgroundColor: "#FFFFFFFF",
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


const loginWindow = () => {

  const loginWin = new BrowserWindow({
    width: 900,
    height: 600,
    icon:'icon.ico',
    frame: false,
    resizable: false,
    webPreferences:{
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      experimentalFeatures: true,
    }
  });
  loginWin.loadURL("http://localhost:8888/login");
  let login = getToken.auothorizeSpotify();
  setTimeout(() => { 
    console.log(login)
    if(login){
        createWindow();
        loginWin.close();
      }
  }, 1000);
}




// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.commandLine.appendSwitch("enable-transparent-visuals");
app.on('ready', () => {
  loginWindow();
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


//TODO
// - add profile page
// - add settings 
// - add back convert functionality
// - add playlist page 
// - finish download page
    // - fetch more than 100 song from spotify
    // - some errorhandling, otherwise the download gets stuck
// - make everything faster 
// - fix login windoww --> first time the app is added
// - fix windows uglieness


//being worked on
  // - add more options functionality 


//done
  // - youtbe url and other search 
  // - track how many songs have to be downloaded and have been downloaded 
