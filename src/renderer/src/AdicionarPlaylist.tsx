import { useState } from 'react'
import type { ResultadoBusca } from './tipos'
import { useBibliotecaStore } from './store/bibliotecaStore'

function AdicionarPlaylist({ musica }: { musica: ResultadoBusca }): React.JSX.Element | null {
  const playlists = useBibliotecaStore((estado) => estado.playlists)
  const adicionar = useBibliotecaStore((estado) => estado.adicionarNaPlaylist)
  const [mensagem, setMensagem] = useState('')

  if (playlists.length === 0) return null

  return (
    <>
      <select
        className="adicionar-playlist"
        value=""
        aria-label={`Adicionar ${musica.titulo} a uma playlist`}
        onChange={(evento) => {
          const id = evento.target.value
          const playlist = playlists.find((item) => item.id === id)
          if (!playlist) return
          const adicionou = adicionar(id, musica)
          setMensagem(adicionou ? `Adicionada a ${playlist.nome}` : `Já está em ${playlist.nome}`)
          setTimeout(() => setMensagem(''), 2500)
        }}
      >
        <option value="">+ Playlist</option>
        {playlists.map((playlist) => (
          <option key={playlist.id} value={playlist.id}>
            {playlist.nome}
          </option>
        ))}
      </select>
      {mensagem && (
        <span className="aviso-playlist" role="status">
          {mensagem}
        </span>
      )}
    </>
  )
}

export default AdicionarPlaylist