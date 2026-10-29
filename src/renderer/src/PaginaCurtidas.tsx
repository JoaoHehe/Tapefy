import { useBibliotecaStore } from './store/bibliotecaStore'
import { tocarFila } from './player/youtube'
import BotaoFila from './BotaoFila'

function PaginaCurtidas(): React.JSX.Element {
  const curtidas = useBibliotecaStore((estado) => estado.curtidas)
  const carregada = useBibliotecaStore((estado) => estado.carregada)
  const alternarCurtida = useBibliotecaStore((estado) => estado.alternarCurtida)

  return (
    <>
      <h2>Músicas curtidas</h2>

      {!carregada && <p className="empty">Carregando...</p>}
      {carregada && curtidas.length === 0 && (
        <p className="empty">
          Você ainda não curtiu nenhuma música. Toque uma e clique no coração do player.
        </p>
      )}

      <ul className="curtidas">
        {curtidas.map((musica, posicao) => (
          <li key={musica.id}>
            <button className="curtida-tocar" onClick={() => tocarFila(curtidas, posicao)}>
              <img src={musica.miniatura} alt="" />
              <span className="resultado-texto">
                <strong>{musica.titulo}</strong>
                <span>{musica.canal}</span>
              </span>
            </button>
            <button
              className="curtida-remover"
              onClick={() => alternarCurtida(musica)}
              aria-label={`Descurtir ${musica.titulo}`}
            >
              ♥
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}

export default PaginaCurtidas