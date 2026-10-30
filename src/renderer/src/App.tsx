import { useEffect, useState } from 'react'
import { HashRouter, NavLink, Route, Routes } from 'react-router-dom'
import PlayerYoutube from './PlayerYoutube'
import { usePlayerStore } from './store/playerStore'
import {
  alternarAleatorio,
  alternarRepetir,
  anterior,
  proxima,
  restaurarEstado,
  tocarOuPausar
} from './player/youtube'
import PaginaExplorar from './PaginaExplorar'
import BarraProgresso from './BarraProgresso'
import ControleVolume from './ControleVolume'
import PaginaCurtidas from './PaginaCurtidas'
import { useBibliotecaStore } from './store/bibliotecaStore'
import BarraPlaylists from './BarraPlaylists'
import PaginaPlaylist from './PaginaPlaylist'
import AdicionarPlaylist from './AdicionarPlaylist'
import PaginaInicio from './PaginaInicio'
import PaginaHistorico from './PaginaHistorico'
import PaginaFila from './PaginaFila'
import PaginaConfiguracoes from './PaginaConfiguracoes'
import PainelTocando from './PainelTocando'
import { useAtalhos } from './useAtalhos'
import { useOnline } from './useOnline'

const paginas = [
  { caminho: '/', nome: 'Início', texto: 'Você ainda não ouviu porra nenhuma. A busca vai ficar aqui em breve!' },
  { caminho: '/explorar', nome: 'Explorar', texto: 'Aqui vai ficar a busca de músicas.' },
  { caminho: '/fila', nome: 'Fila', texto: '' },
  { caminho: '/biblioteca', nome: 'Minha biblioteca', texto: 'Suas playlists vão aparecer aqui.' },
  { caminho: '/curtidas', nome: 'Músicas curtidas', texto: 'Curtiu uma música? Ela cai aqui.' },
  { caminho: '/historico', nome: 'Histórico', texto: 'Nada tocado ainda.' },
  { caminho: '/configuracoes', nome: 'Configurações', texto: 'Nada pra configurar ainda, e não vou inventar opção de enfeite.' }
]

const caminhosEspeciais = ['/', '/explorar', '/fila', '/curtidas', '/historico', '/configuracoes']

function Pagina({ titulo, texto }: { titulo: string; texto: string }): React.JSX.Element {
  return (
    <>
      <h2>{titulo}</h2>
      <p className="empty">{texto}</p>
    </>
  )
}

function App(): React.JSX.Element {
  const pronto = usePlayerStore((estado) => estado.pronto)
  const tocando = usePlayerStore((estado) => estado.tocando)
  const fila = usePlayerStore((estado) => estado.fila)
  const indice = usePlayerStore((estado) => estado.indice)
  const aviso = usePlayerStore((estado) => estado.aviso)
  const repetir = usePlayerStore((estado) => estado.repetir)
  const aleatorio = usePlayerStore((estado) => estado.aleatorio)
  const musicaAtual = fila[indice]

  const curtidas = useBibliotecaStore((estado) => estado.curtidas)
  const carregada = useBibliotecaStore((estado) => estado.carregada)
  const alternarCurtida = useBibliotecaStore((estado) => estado.alternarCurtida)
  const curtida = musicaAtual ? curtidas.some((item) => item.id === musicaAtual.id) : false

  const [painelAberto, setPainelAberto] = useState(false)

  useEffect(() => {
    useBibliotecaStore.getState().carregar()
    restaurarEstado()
  }, [])

  const online = useOnline()
  useAtalhos()

  const podeAvancar =
    indice >= 0 && (repetir === 'fila' || (aleatorio ? fila.length > 1 : indice < fila.length - 1))
  const podeVoltar = indice >= 0 && (aleatorio || indice > 0)

  return (
    <HashRouter>
      <div className={painelAberto ? 'app com-painel' : 'app'}>
        <aside className="sidebar">
          <h1 className="logo">Tapefy</h1>

          <nav aria-label="Navegação principal">
            <ul>
              {paginas.map((p) => (
                <li key={p.caminho}>
                  <NavLink to={p.caminho} end={p.caminho === '/'}>
                    {p.nome}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <BarraPlaylists />
        </aside>

        <main className="content">
          <PlayerYoutube noPainel={painelAberto} />

          {!online && (
            <p className="aviso-offline" role="status">
              Você está sem internet. Você pode consultar sua biblioteca, mas buscar e tocar músicas só volta
              quando a conexão voltar.
            </p>
          )}

          <Routes>
            <Route path="/" element={<PaginaInicio />} />
            <Route path="/explorar" element={<PaginaExplorar />} />
            <Route path="/curtidas" element={<PaginaCurtidas />} />
            <Route path="/historico" element={<PaginaHistorico />} />
            <Route path="/playlist/:id" element={<PaginaPlaylist />} />
            <Route path="/fila" element={<PaginaFila />} />
            <Route path="/configuracoes" element={<PaginaConfiguracoes />} />
            {paginas
              .filter((p) => !caminhosEspeciais.includes(p.caminho))
              .map((p) => (
                <Route
                  key={p.caminho}
                  path={p.caminho}
                  element={<Pagina titulo={p.nome} texto={p.texto} />}
                />
              ))}
          </Routes>
        </main>

        {painelAberto && <PainelTocando />}

        <footer className="player">
          <div className="player-info">
            {musicaAtual ? (
              <>
                <button
                  className="player-info-link"
                  onClick={() => setPainelAberto(!painelAberto)}
                  aria-pressed={painelAberto}
                  aria-label="Abrir ou fechar o painel da música atual"
                >
                  <img src={musicaAtual.miniatura} alt="" />
                  <span className="player-info-texto">
                    <strong>{musicaAtual.titulo}</strong>
                    <span>{musicaAtual.canal}</span>
                    {aviso && (
                      <span className="erro" role="status">
                        {aviso}
                      </span>
                    )}
                  </span>
                </button>
                <button
                  className={curtida ? 'curtir ativo' : 'curtir'}
                  disabled={!carregada}
                  onClick={() => alternarCurtida(musicaAtual)}
                  aria-pressed={curtida}
                  aria-label={curtida ? 'Descurtir' : 'Curtir'}
                >
                  {curtida ? '♥' : '♡'}
                </button>
                <AdicionarPlaylist musica={musicaAtual} />
              </>
            ) : (
              'Nenhuma música tocando'
            )}
          </div>

          <div className="player-centro">
            <div className="player-controls">
              <button
                disabled={!pronto}
                onClick={alternarAleatorio}
                className={aleatorio ? 'ativo' : ''}
                aria-pressed={aleatorio}
                aria-label="Aleatório"
              >
                ⇄
              </button>
              <button disabled={!pronto || !podeVoltar} onClick={anterior} aria-label="Música anterior">
                ⏮
              </button>
              <button
                disabled={!pronto}
                onClick={tocarOuPausar}
                aria-label={tocando ? 'Pausar' : 'Reproduzir'}
              >
                {tocando ? '⏸' : '▶'}
              </button>
              <button disabled={!pronto || !podeAvancar} onClick={proxima} aria-label="Próxima música">
                ⏭
              </button>
              <button
                disabled={!pronto}
                onClick={alternarRepetir}
                className={repetir !== 'desligado' ? 'ativo' : ''}
                aria-label={`Repetir: ${repetir === 'desligado' ? 'desligado' : repetir === 'fila' ? 'fila' : 'uma música'}`}
              >
                {repetir === 'uma' ? '↻1' : '↻'}
              </button>
            </div>

            <BarraProgresso />
          </div>

          <div className="player-direita">
            <button
              className={painelAberto ? 'botao-painel ativo' : 'botao-painel'}
              onClick={() => setPainelAberto(!painelAberto)}
              aria-pressed={painelAberto}
              aria-label="Painel da música atual"
            >
              ▣
            </button>
            <NavLink className="botao-fila" to="/fila" aria-label="Abrir a fila de reprodução">
              ☰
            </NavLink>
            <ControleVolume />
          </div>
        </footer>
      </div>
    </HashRouter>
  )
}

export default App