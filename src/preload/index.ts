import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'

const api = {
  buscarMusicas: (termo: string) => ipcRenderer.invoke('buscar-musicas', termo),
  lerBiblioteca: () => ipcRenderer.invoke('biblioteca-ler'),
  salvarBiblioteca: (dados: unknown) => ipcRenderer.invoke('biblioteca-salvar', dados)
}


if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
