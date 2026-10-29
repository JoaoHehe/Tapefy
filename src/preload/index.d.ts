import { ElectronAPI } from '@electron-toolkit/preload'

type ResultadoBusca = {
  id: string
  titulo: string
  canal: string
  miniatura: string
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      buscarMusicas: (termo: string) => Promise<ResultadoBusca[]>
      lerBiblioteca: () => Promise<unknown>
      salvarBiblioteca: (dados: unknown) => Promise<void>
    }
  }
}