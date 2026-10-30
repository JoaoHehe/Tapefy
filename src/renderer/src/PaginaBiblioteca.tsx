import { NavLink } from 'react-router-dom'
import { useBibliotecaStore } from './store/bibliotecaStore'

function contar(quantidade: number): string {
  return `${quantidade} ${quantidade === 1 ? 'música' : 'músicas'}`
}

function PaginaBiblioteca(): React.JSX.Element {
  const playlists = useBibliotecaStore((estado) => estado.playlists)
  const carregada = useBibliotecaStore((estado) => estado.carregada)

  return (
    <>
      <h2>Minha biblioteca</h2>

      {!carregada && <p className="empty">Carregando...</p>}

      {carregada && (
        <>
          <h3>Playlists</h3>

          {playlists.length === 0 ? (
            <p className="empty">
              Você ainda não criou nenhuma playlist. Use o campo Nova playlist na barra lateral.
            </p>
          ) : (
            <ul className="cartoes">
              {playlists.map((playlist) => (
                <li key={playlist.id}>
                  <NavLink to={`/playlist/${playlist.id}`}>
                    {playlist.musicas.length > 0 ? (
                      <img className="cartao-capa" src={playlist.musicas[0].miniatura} alt="" />
                    ) : (
                      <span className="cartao-capa" aria-hidden="true">
                        ♪
                      </span>
                    )}
                    <span className="cartao-texto">
                      <strong>{playlist.nome}</strong>
                      <span>{contar(playlist.musicas.length)}</span>
                    </span>
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  )
}

export default PaginaBiblioteca