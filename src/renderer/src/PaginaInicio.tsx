import { useBibliotecaStore } from './store/bibliotecaStore'
import { tocarFila } from './player/youtube'

function PaginaInicio(): React.JSX.Element {
  const historico = useBibliotecaStore((estado) => estado.historico)
  const carregada = useBibliotecaStore((estado) => estado.carregada)
  const recentes = historico.slice(0, 8)

  return (
    <>
      <h2>Início</h2>

      {!carregada && <p className="empty">Carregando...</p>}
      {carregada && recentes.length === 0 && (
        <p className="empty">Você ainda não ouviu nada por aqui. Vai em Explorar e busca uma música.</p>
      )}

      {recentes.length > 0 && (
        <>
          <h3>Ouvidas recentemente</h3>
          <ul className="curtidas">
            {recentes.map((musica, posicao) => (
              <li key={musica.id}>
                <button className="curtida-tocar" onClick={() => tocarFila(recentes, posicao)}>
                  <img src={musica.miniatura} alt="" />
                  <span className="resultado-texto">
                    <strong>{musica.titulo}</strong>
                    <span>{musica.canal}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}

export default PaginaInicio