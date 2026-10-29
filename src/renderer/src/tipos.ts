export type ResultadoBusca = {
  id: string
  titulo: string
  canal: string
  miniatura: string
}

export type Playlist = {
  id: string
  nome: string
  musicas: ResultadoBusca[]
}