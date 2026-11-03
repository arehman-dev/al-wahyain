const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isDesktop: true,
  getRuntimeInfo: () => ipcRenderer.invoke('alwahyain:get-runtime-info'),
  openExternal: (url) => ipcRenderer.invoke('alwahyain:open-external', url)
});
