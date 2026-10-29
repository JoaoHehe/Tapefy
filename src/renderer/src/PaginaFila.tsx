import { usePlayerStore } from './store/playerStore'
import { removerDaFila, tocarDaFila, tocarOuPausar } from './player/youtube'

function PaginaFila(): React.JSX.Element {
  const fila = usePlayerStore((estado) => estado.fila)
  const indice = usePlayerStore((estado) => estado.indice)
  const tocando = usePlayerStore((estado) => estado.tocando)
  const aleatorio = usePlayerStore((estado) => estado.aleatorio)

  return (
    <>
      <h2>Fila</h2>

      {fila.length === 0 ? (
        <p className="empty">
          A fila está vazia. Toque uma música ou use o botão + Fila em qualquer lista pra montar a sua.
        </p>
      ) : (
        <p className="empty">
          {fila.length} {fila.length === 1 ? 'música' : 'músicas'} na fila.
          {aleatorio && ' Com o aleatório ligado, a próxima música é sorteada, então essa ordem não é a ordem de reprodução.'}
        </p>
      )}

      <ul className="curtidas">
        {fila.map((musica, posicao) => {
          const atual = posicao === indice
          return (
            <li key={musica.id} className={atual ? 'fila-atual' : ''}>
              <span className="fila-posicao">{atual ? '♪' : posicao + 1}</span>
              <button
                className="curtida-tocar"
                onClick={() => (atual ? tocarOuPausar() : tocarDaFila(posicao))}
                aria-current={atual ? 'true' : undefined}
              >
                <img src={musica.miniatura} alt="" />
                <span className="resultado-texto">
                  <strong>{musica.titulo}</strong>
                  <span>{musica.canal}</span>
                </span>
              </button>
              {atual ? (
                <span className="fila-selo">{tocando ? 'Tocando' : 'Pausada'}</span>
              ) : (
                <button
                  className="curtida-remover"
                  onClick={() => removerDaFila(posicao)}
                  aria-label={`Remover ${musica.titulo} da fila`}
                >
                  ✕
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </>
  )
}

export default PaginaFila