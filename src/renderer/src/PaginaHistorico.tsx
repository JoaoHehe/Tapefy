import { useState } from 'react'
import { useBibliotecaStore } from './store/bibliotecaStore'
import { tocarMusica } from './player/youtube'
import BotaoFila from './BotaoFila'

function PaginaHistorico(): React.JSX.Element {
  const historico = useBibliotecaStore((estado) => estado.historico)
  const carregada = useBibliotecaStore((estado) => estado.carregada)
  const limparHistorico = useBibliotecaStore((estado) => estado.limparHistorico)
  const [confirmando, setConfirmando] = useState(false)

  return (
    <>
      <h2>Histórico</h2>

      {!carregada && <p className="empty">Carregando...</p>}
      {carregada && historico.length === 0 && (
        <p className="empty">Nada tocado ainda. Vai em Explorar e coloca alguma coisa pra rodar.</p>
      )}

      {historico.length > 0 && (
        <div className="acoes-playlist">
          {confirmando ? (
            <span className="confirmacao" role="alert">
              Apagar todo o histórico?
              <button
                onClick={() => {
                  limparHistorico()
                  setConfirmando(false)
                }}
              >
                Sim, apagar
              </button>
              <button onClick={() => setConfirmando(false)}>Cancelar</button>
            </span>
          ) : (
            <button onClick={() => setConfirmando(true)}>Limpar histórico</button>
          )}
        </div>
      )}

      <ul className="curtidas">
        {historico.map((musica) => (
          <li key={musica.id}>
            <button className="curtida-tocar" onClick={() => tocarMusica(musica)}>
              <img src={musica.miniatura} alt="" />
              <span className="resultado-texto">
                <strong>{musica.titulo}</strong>
                <span>{musica.canal}</span>
              </span>
            </button>
            <BotaoFila musica={musica} />
          </li>
        ))}
      </ul>
    </>
  )
}

export default PaginaHistorico