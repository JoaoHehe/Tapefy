import { create } from 'zustand'
import type { Playlist, ResultadoBusca } from '../tipos'

type EstadoBiblioteca = {
  carregada: boolean
  curtidas: ResultadoBusca[]
  playlists: Playlist[]
  carregar: () => Promise<void>
  alternarCurtida: (musica: ResultadoBusca) => void
  criarPlaylist: (nome: string) => void
  renomearPlaylist: (id: string, nome: string) => void
  excluirPlaylist: (id: string) => void
  adicionarNaPlaylist: (id: string, musica: ResultadoBusca) => boolean
  removerDaPlaylist: (id: string, idDaMusica: string) => void
}

type DadosSalvos = {
  curtidas?: ResultadoBusca[]
  playlists?: Playlist[]
}

export const useBibliotecaStore = create<EstadoBiblioteca>((set, get) => {
  function salvar(): void {
    const { curtidas, playlists } = get()
    window.api.salvarBiblioteca({ curtidas, playlists })
  }

  return {
    carregada: false,
    curtidas: [],
    playlists: [],

    carregar: async () => {
      const dados = (await window.api.lerBiblioteca()) as DadosSalvos | null
      set({
        curtidas: Array.isArray(dados?.curtidas) ? dados.curtidas : [],
        playlists: Array.isArray(dados?.playlists) ? dados.playlists : [],
        carregada: true
      })
    },

    alternarCurtida: (musica) => {
      if (!get().carregada) return
      const atuais = get().curtidas
      const jaCurtida = atuais.some((item) => item.id === musica.id)
      const curtidas = jaCurtida
        ? atuais.filter((item) => item.id !== musica.id)
        : [musica, ...atuais]
      set({ curtidas })
      salvar()
    },

    criarPlaylist: (nome) => {
      if (!get().carregada) return
      const nova: Playlist = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        nome,
        musicas: []
      }
      set({ playlists: [...get().playlists, nova] })
      salvar()
    },

    renomearPlaylist: (id, nome) => {
      if (!get().carregada) return
      set({
        playlists: get().playlists.map((playlist) =>
          playlist.id === id ? { ...playlist, nome } : playlist
        )
      })
      salvar()
    },

    excluirPlaylist: (id) => {
      if (!get().carregada) return
      set({ playlists: get().playlists.filter((playlist) => playlist.id !== id) })
      salvar()
    },

    adicionarNaPlaylist: (id, musica) => {
      if (!get().carregada) return false
      const playlist = get().playlists.find((item) => item.id === id)
      if (!playlist || playlist.musicas.some((item) => item.id === musica.id)) return false
      set({
        playlists: get().playlists.map((item) =>
          item.id === id ? { ...item, musicas: [...item.musicas, musica] } : item
        )
      })
      salvar()
      return true
    },

    removerDaPlaylist: (id, idDaMusica) => {
      if (!get().carregada) return
      set({
        playlists: get().playlists.map((item) =>
          item.id === id
            ? { ...item, musicas: item.musicas.filter((musica) => musica.id !== idDaMusica) }
            : item
        )
      })
      salvar()
    }
  }
})