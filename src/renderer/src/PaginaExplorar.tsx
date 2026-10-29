import { useState } from 'react'
import type { ResultadoBusca } from './tipos'
import { tocarFila } from './player/youtube'
import AdicionarPlaylist from './AdicionarPlaylist'

function PaginaExplorar(): React.JSX.Element {
  const [termo, setTermo] = useState('')
  const [resultados, setResultados] = useState<ResultadoBusca[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [jaBuscou, setJaBuscou] = useState(false)

  async function buscar(): Promise<void> {
    const texto = termo.trim()
    if (!texto) return

    setCarregando(true)
    setErro('')

    try {
      const lista = await window.api.buscarMusicas(texto)
      setResultados(lista)
    } catch {
      setResultados([])
      setErro('Não consegui buscar agora. Confere a chave da API e a conexão.')
    } finally {
      setCarregando(false)
      setJaBuscou(true)
    }
  }

  return (
    <>
      <h2>Explorar</h2>

      <form
        className="busca"
        onSubmit={(evento) => {
          evento.preventDefault()
          buscar()
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
      {!jaBuscou && <p className="empty">Digite algo e aperta Enter.</p>}

      <ul className="resultados">
        {resultados.map((resultado, posicao) => (
  <li key={resultado.id}>
    <button onClick={() => tocarFila(resultados, posicao)}>
      <img src={resultado.miniatura} alt="" />
      <span className="resultado-texto">
        <strong>{resultado.titulo}</strong>
        <span>{resultado.canal}</span>
      </span>
    </button>
    <AdicionarPlaylist musica={resultado} />
  </li>
))}
      </ul>
    </>
  )
}

export default PaginaExplorar