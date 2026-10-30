export type ResultadoBusca = {
  id: string
  titulo: string
  canal: string
  miniatura: string
  duracao?: number
}

export type Playlist = {
  id: string
  nome: string
  musicas: ResultadoBusca[]
}