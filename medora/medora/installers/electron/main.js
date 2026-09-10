// MEDORA desktop wrapper (Electron) - loads the deployed MEDORA web app.
const { app, BrowserWindow, shell } = require("electron");
const APP_URL = process.env.MEDORA_APP_URL || "http://localhost:3000";

function createWindow() {
  const win = new BrowserWindow({
    width: 1366,
    height: 900,
    title: "MEDORA Health Care Ecosystem",
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });
  // OS-level screenshot / screen-recording block (Windows shows black, macOS hides from capture)
  win.setContentProtection(true);
  win.loadURL(APP_URL);
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
