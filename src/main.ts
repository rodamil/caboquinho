import * as dotenv from 'dotenv';
import { BrowserWindow } from 'electron';
import electronReloader from 'electron-reloader';
import path from 'path';
import updateElectronApp from 'update-electron-app';

export default class Main {
  static mainWindow: Electron.BrowserWindow;
  static application: Electron.App;
  static BrowserWindow;
  private static onWindowAllClosed() {
    if (process.platform !== 'darwin') {
      Main.application.quit();
    }
  }

  private static onClose() {
    // Dereference the window object.
    Main.mainWindow = null;
  }

  private static onReady() {
    dotenv.config();
    updateElectronApp();

    Main.application.commandLine.appendSwitch('ignore-certificate-errors');

    if (process.env.NODE_ENV === 'development') {
      try {
        electronReloader(module);
      } catch (_) {}
    }

    Main.mainWindow = new Main.BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        // To enable JS Modules
        nodeIntegration: true,
        contextIsolation: false,
      },
      icon: __dirname + '/assets/caboquinho-icon.ico',
    });
    Main.mainWindow.loadURL('file://' + __dirname + './pages/loginForm.html');
    Main.mainWindow.on('closed', Main.onClose);
  }

  static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
    // we pass the Electron.App object and the
    // Electron.BrowserWindow into this function
    // so this class has no dependencies. This
    // makes the code easier to write tests for
    Main.BrowserWindow = browserWindow;
    Main.application = app;
    Main.application.on('window-all-closed', Main.onWindowAllClosed);
    Main.application.on('ready', Main.onReady);
  }
}
