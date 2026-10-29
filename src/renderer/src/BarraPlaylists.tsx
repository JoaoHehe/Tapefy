import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useBibliotecaStore } from './store/bibliotecaStore'

function BarraPlaylists(): React.JSX.Element {
  const playlists = useBibliotecaStore((estado) => estado.playlists)
  const carregada = useBibliotecaStore((estado) => estado.carregada)
  const criarPlaylist = useBibliotecaStore((estado) => estado.criarPlaylist)
  const [nome, setNome] = useState('')

  return (
    <section className="playlists" aria-label="Playlists">
      <h3>Playlists</h3>

      <form
        onSubmit={(evento) => {
          evento.preventDefault()
          const limpo = nome.trim()
          if (!limpo) return
          criarPlaylist(limpo)
          setNome('')
        }}
      >
        <input
          value={nome}
          onChange={(evento) => setNome(evento.target.value)}
          placeholder="Nova playlist"
          aria-label="Nome da nova playlist"
          maxLength={40}
          disabled={!carregada}
        />
        <button type="submit" disabled={!carregada || !nome.trim()} aria-label="Criar playlist">
          +
        </button>
      </form>

      {playlists.length === 0 ? (
        <p className="empty">Nenhuma playlist ainda.</p>
      ) : (
        <ul>
          {playlists.map((playlist) => (
            <li key={playlist.id}>
              <NavLink to={`/playlist/${playlist.id}`}>{playlist.nome}</NavLink>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default BarraPlaylists