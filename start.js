const { app, BrowserWindow, Menu, Tray } = require("electron");
const tasklist = require("tasklist");
const ipc = require("electron").ipcMain;
const AutoLaunch = require("auto-launch");

function mainWin() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    win.loadFile("index.html");
    win.removeMenu();
    let tray = null;

    app.whenReady().then(() => {
        tray = new Tray("C:/Users/User/Desktop/IR_frontend/icon.ico");
        const contextMenu = Menu.buildFromTemplate([
            {
                label: "앱 실행",
                type: "normal",
                click: () => {
                    win.show();
                },
            },
            {
                label: "앱 종료",
                type: "normal",
                click: () => {
                    process.exit();
                },
            },
        ]);
        tray.setToolTip("Combie");
        tray.setContextMenu(contextMenu);
    });

    win.on("close", function (event) {
        event.preventDefault();
        win.hide();
    });

    ipc.on("logout", () => {
        win.loadFile("index.html");
    });
}

app.whenReady().then(mainWin);
app.on("ready", () => {
    let autoLaunch = new AutoLaunch({
        name: "Combie",
        path: app.getPath("exe"),
    });

    ipc.on("isAutoLaunchEnabled", async (event) => {
        autoLaunch.isEnabled().then((isEnabled) => {
            event.returnValue = isEnabled;
        });
    });

    ipc.on("toggleAutoLaunch", () => {
        autoLaunch.isEnabled().then((isEnabled) => {
            if (isEnabled) {
                autoLaunch.disable();
            } else {
                autoLaunch.enable();
            }
        });
    });
});

ipc.on("request", async (event) => {
    event.returnValue = await tasklist({
        filter: ["STATUS eq RUNNING"],
    });
});
