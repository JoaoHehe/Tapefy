import { create } from 'zustand'
import type { ResultadoBusca } from '../tipos'

export type ModoRepetir = 'desligado' | 'fila' | 'uma'

type EstadoDoPlayer = {
  pronto: boolean
  tocando: boolean
  fila: ResultadoBusca[]
  indice: number
  aviso: string
  volume: number
  mudo: boolean
  repetir: ModoRepetir
  aleatorio: boolean
  definirPronto: (valor: boolean) => void
  definirTocando: (valor: boolean) => void
  definirFila: (fila: ResultadoBusca[], indice: number) => void
  definirIndice: (indice: number) => void
  definirAviso: (aviso: string) => void
  definirVolume: (valor: number) => void
  definirMudo: (valor: boolean) => void
  definirRepetir: (modo: ModoRepetir) => void
  definirAleatorio: (valor: boolean) => void
  removerDaFila: (posicao: number) => void
  adicionarNaFila: (musica: ResultadoBusca) => void
}

export const usePlayerStore = create<EstadoDoPlayer>((set) => ({
  pronto: false,
  tocando: false,
  fila: [],
  indice: -1,
  aviso: '',
  volume: 100,
  mudo: false,
  repetir: 'desligado',
  aleatorio: false,
  definirPronto: (valor) => set({ pronto: valor }),
  definirTocando: (valor) => set({ tocando: valor }),
  definirFila: (fila, indice) => set({ fila, indice, aviso: '' }),
  definirIndice: (indice) => set({ indice, aviso: '' }),
  definirAviso: (aviso) => set({ aviso }),
  definirVolume: (valor) => set({ volume: valor }),
  definirMudo: (valor) => set({ mudo: valor }),
  definirRepetir: (modo) => set({ repetir: modo }),
  definirAleatorio: (valor) => set({ aleatorio: valor }),
  removerDaFila: (posicao) =>
    set((estado) => {
      if (posicao < 0 || posicao >= estado.fila.length || posicao === estado.indice) {
        return estado
      }
      return {
        fila: estado.fila.filter((_, i) => i !== posicao),
        indice: posicao < estado.indice ? estado.indice - 1 : estado.indice
      }
    }),
  adicionarNaFila: (musica) => set((estado) => ({ fila: [...estado.fila, musica] }))
}))