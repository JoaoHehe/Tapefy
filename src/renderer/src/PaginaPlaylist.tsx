import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useBibliotecaStore } from './store/bibliotecaStore'
import { tocarFila } from './player/youtube'
import BotaoFila from './BotaoFila'

function DetalhePlaylist({ id }: { id: string }): React.JSX.Element {
  const navigate = useNavigate()
  const playlist = useBibliotecaStore((estado) => estado.playlists.find((item) => item.id === id))
  const renomearPlaylist = useBibliotecaStore((estado) => estado.renomearPlaylist)
  const excluirPlaylist = useBibliotecaStore((estado) => estado.excluirPlaylist)
  const removerDaPlaylist = useBibliotecaStore((estado) => estado.removerDaPlaylist)
  const [nome, setNome] = useState(playlist?.nome ?? '')
  const [confirmando, setConfirmando] = useState(false)

  if (!playlist) {
    return (
      <>
        <h2>Playlist não encontrada</h2>
        <p className="empty">Ela pode ter sido excluída.</p>
      </>
    )
  }

  const nomeLimpo = nome.trim()

  return (
    <>
      <h2>{playlist.nome}</h2>

      <form
        className="renomear"
        onSubmit={(evento) => {
          evento.preventDefault()
          if (nomeLimpo) renomearPlaylist(playlist.id, nomeLimpo)
        }}
      >
        <input
          value={nome}
          onChange={(evento) => setNome(evento.target.value)}
          maxLength={40}
          aria-label="Nome da playlist"
        />
        <button type="submit" disabled={!nomeLimpo || nomeLimpo === playlist.nome}>
          Renomear
        </button>
      </form>

      <div className="acoes-playlist">
        <button
          disabled={playlist.musicas.length === 0}
          onClick={() => tocarFila(playlist.musicas, 0)}
        >
          Tocar playlist
        </button>

        {confirmando ? (
          <span className="confirmacao" role="alert">
            Excluir a playlist {playlist.nome}?
            <button
              onClick={() => {
                excluirPlaylist(playlist.id)
                navigate('/biblioteca')
              }}
            >
              Sim, excluir
            </button>
            <button onClick={() => setConfirmando(false)}>Cancelar</button>
          </span>
        ) : (
          <button onClick={() => setConfirmando(true)}>Excluir playlist</button>
        )}
      </div>

      {playlist.musicas.length === 0 && (
        <p className="empty">
          Essa playlist está vazia. Use o seletor + Playlist no player ou nos resultados da busca.
        </p>
      )}

      <ul className="curtidas">
        {playlist.musicas.map((musica, posicao) => (
          <li key={musica.id}>
            <button className="curtida-tocar" onClick={() => tocarFila(playlist.musicas, posicao)}>
              <img src={musica.miniatura} alt="" />
              <span className="resultado-texto">
                <strong>{musica.titulo}</strong>
                <span>{musica.canal}</span>
              </span>
            </button>
            <button
              className="curtida-remover"
              onClick={() => removerDaPlaylist(playlist.id, musica.id)}
              aria-label={`Remover ${musica.titulo} da playlist`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}

function PaginaPlaylist(): React.JSX.Element {
  const { id } = useParams()
  return <DetalhePlaylist key={id} id={id ?? ''} />
}

export default PaginaPlaylist