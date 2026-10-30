import { useCallback, useEffect, useRef, useState } from 'react'
import type { ResultadoBusca } from './tipos'
import { tocarMusica } from './player/youtube'
import AdicionarPlaylist from './AdicionarPlaylist'
import BotaoFila from './BotaoFila'
import { formatarTempo } from './tempo'

const ATRASO_DA_BUSCA = 900
const MINIMO_DE_LETRAS = 3

function mensagemDeErro(falha: unknown): string {
  const texto = String(falha)
  if (texto.includes('COTA_ESGOTADA')) {
    return 'A cota diária de buscas do YouTube acabou. Ela renova uma vez por dia (à meia-noite no horário do Pacífico dos EUA). Enquanto isso, curtidas, playlists e histórico continuam funcionando.'
  }
  if (texto.includes('SEM_CHAVE')) {
    return 'Falta a chave da API no arquivo .env.'
  }
  return 'Não consegui buscar agora. Confere a conexão e a chave da API.'
}

function PaginaExplorar(): React.JSX.Element {
  const [termo, setTermo] = useState('')
  const [resultados, setResultados] = useState<ResultadoBusca[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [jaBuscou, setJaBuscou] = useState(false)
  const numeroDaBusca = useRef(0)
  const ultimoTermo = useRef('')

  const buscar = useCallback(async (texto: string, imediata: boolean): Promise<void> => {
    const limpo = texto.trim().replace(/\s+/g, ' ')
    const minimo = imediata ? 1 : MINIMO_DE_LETRAS
    if (limpo.length < minimo) return
    if (!imediata && limpo.toLowerCase() === ultimoTermo.current) return

    if (!navigator.onLine) {
      setErro('Sem internet. A busca só funciona com conexão.')
      return
    }

    numeroDaBusca.current += 1
    const numero = numeroDaBusca.current
    setCarregando(true)
    setErro('')

    try {
      const lista = await window.api.buscarMusicas(limpo)
      if (numero !== numeroDaBusca.current) return
      setResultados(lista)
      ultimoTermo.current = limpo.toLowerCase()
    } catch (falha) {
      if (numero !== numeroDaBusca.current) return
      setResultados([])
      ultimoTermo.current = ''
      setErro(mensagemDeErro(falha))
    } finally {
      if (numero === numeroDaBusca.current) {
        setCarregando(false)
        setJaBuscou(true)
      }
    }
  }, [])

  useEffect(() => {
    if (termo.trim().length < MINIMO_DE_LETRAS) return
    const espera = setTimeout(() => {
      buscar(termo, false)
    }, ATRASO_DA_BUSCA)
    return () => clearTimeout(espera)
  }, [termo, buscar])

  return (
    <section className="explorar-orbital">
      <header className="explorar-cabecalho">
        <h2>Explorar</h2>
        <p>Encontre sua próxima frequência.</p>
      </header>

      <form
        className="busca"
        onSubmit={(evento) => {
          evento.preventDefault()
          buscar(termo, true)
        }}
      >
        <input
          type="search"
          value={termo}
          onChange={(evento) => setTermo(evento.target.value)}
          placeholder="Busque uma música ou artista"
          aria-label="Buscar música"
        />
        <button type="submit" disabled={carregando}>
          Buscar
        </button>
      </form>

      {carregando && <p className="empty">Buscando...</p>}
      {erro && <p className="erro">{erro}</p>}
      {!carregando && !erro && jaBuscou && resultados.length === 0 && (
        <p className="empty">Nada encontrado. Tenta outro termo.</p>
      )}
      {!jaBuscou && !carregando && (
        <p className="empty">
          Digite pelo menos {MINIMO_DE_LETRAS} letras e espere um instante, ou aperte Enter.
        </p>
      )}

      <ul className="resultados">
        {resultados.map((resultado) => (
          <li key={resultado.id}>
            <button onClick={() => tocarMusica(resultado)}>
              <img src={resultado.miniatura} alt="" />
              <span className="resultado-texto">
                <strong>{resultado.titulo}</strong>
                <span>
                  {resultado.canal}
                  {resultado.duracao ? ` · ${formatarTempo(resultado.duracao)}` : ''}
                </span>
              </span>
            </button>
            <BotaoFila musica={resultado} />
            <AdicionarPlaylist musica={resultado} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export default PaginaExplorar