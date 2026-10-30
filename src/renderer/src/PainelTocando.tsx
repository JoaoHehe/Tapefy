import { usePlayerStore } from './store/playerStore'
import { useBibliotecaStore } from './store/bibliotecaStore'
import { tocarDaFila } from './player/youtube'
import AdicionarPlaylist from './AdicionarPlaylist'

function PainelTocando(): React.JSX.Element {
  const fila = usePlayerStore((estado) => estado.fila)
  const tocando = usePlayerStore((estado) => estado.tocando)
  const indice = usePlayerStore((estado) => estado.indice)
  const aleatorio = usePlayerStore((estado) => estado.aleatorio)
  const curtidas = useBibliotecaStore((estado) => estado.curtidas)
  const carregada = useBibliotecaStore((estado) => estado.carregada)
  const alternarCurtida = useBibliotecaStore((estado) => estado.alternarCurtida)

  const musica = fila[indice]

  if (!musica) {
    return (
      <aside className="painel-tocando" aria-label="Música atual">
        <div className="painel-espaco painel-capa-vazia" aria-hidden="true" />
        <div className="painel-fila-layout painel-fila-vazia">
          <div className="cassette-deck painel-cassete" aria-hidden="true">
            <span className="cassette-label">OAS // C-90</span>
            <span className="cassette-reel cassette-reel-a"><i /></span>
            <span className="cassette-reel cassette-reel-b"><i /></span>
            <span className="cassette-window" />
            <span className="cassette-screw screw-a" /><span className="cassette-screw screw-b" />
            <span className="cassette-screw screw-c" /><span className="cassette-screw screw-d" />
          </div>
          <p className="empty">Nenhuma música tocando. Busque algo em Explorar e dê play.</p>
        </div>
      </aside>
    )
  }

  const curtida = curtidas.some((item) => item.id === musica.id)
  const proximas = fila.slice(indice + 1, indice + 11)

  return (
    <aside className="painel-tocando" aria-label="Música atual">
      <div className="painel-espaco painel-capa-crt">
        <img src={musica.miniatura} alt={`Capa de ${musica.titulo}`} />
        <span className="crt-linha" aria-hidden="true" />
        <span className="crt-identificacao" aria-hidden="true">ORBITAL // NOW PLAYING</span>
      </div>

      <div className="painel-info">
        <p className="titulo-tocando">{musica.titulo}</p>
        <p className="canal-tocando">{musica.canal}</p>

        <div className="acoes-tocando">
          <button
            className={curtida ? 'curtir ativo' : 'curtir'}
            disabled={!carregada}
            onClick={() => alternarCurtida(musica)}
            aria-pressed={curtida}
            aria-label={curtida ? 'Descurtir' : 'Curtir'}
          >
            {curtida ? '♥' : '♡'}
          </button>
          <AdicionarPlaylist musica={musica} />
        </div>
      </div>

      <div className="painel-fila-layout">
        <div className={tocando ? 'cassette-deck painel-cassete tocando' : 'cassette-deck painel-cassete'} aria-hidden="true">
          <span className="cassette-label">OAS // C-90</span>
          <span className="cassette-reel cassette-reel-a"><i /></span>
          <span className="cassette-reel cassette-reel-b"><i /></span>
          <span className="cassette-window" />
          <span className="cassette-screw screw-a" /><span className="cassette-screw screw-b" />
          <span className="cassette-screw screw-c" /><span className="cassette-screw screw-d" />
        </div>
        <div className="painel-fila-conteudo">
          <h3>A seguir</h3>
          <div className="painel-lista">
            {aleatorio ? (
              <p className="empty">Aleatório ligado: a próxima música é sorteada entre as da fila.</p>
            ) : proximas.length === 0 ? (
              <p className="empty">Nada a seguir. Use o botão + Fila pra adicionar músicas.</p>
            ) : (
              <ul className="curtidas">
                {proximas.map((item, posicao) => (
                  <li key={item.id}>
                    <button className="curtida-tocar" onClick={() => tocarDaFila(indice + 1 + posicao)}>
                      <img src={item.miniatura} alt="" />
                      <span className="resultado-texto">
                        <strong>{item.titulo}</strong>
                        <span>{item.canal}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}

export default PainelTocando