import { useEffect, useState } from 'react'
import { useBibliotecaStore } from './store/bibliotecaStore'
import { tocarMusica } from './player/youtube'
import BotaoFila from './BotaoFila'

const mensagens: Record<string, string[]> = {
  madrugada: [
    'Ouvindo música tarde da noite? Ninguém vai julgar. Pelo menos não nesta frequência.',
    'A estação está em silêncio. Você e seus fones claramente não receberam o aviso.',
    'Tripulante, já passou da hora de dormir. Mas reconhecemos que essa faixa está boa.'
  ],
  manha: [
    'Bom dia, tripulante. Sistemas aquecidos e café imaginário servido.',
    'Começando o dia com música? Uma decisão tecnicamente correta.',
    ' motores ligados, playlist carregada. Vamos fingir que estamos descansados.'
  ],
  tarde: [
    'Sinal estável. Produtividade ainda sob investigação.',
    'Mais uma tarde no espaço. Pelo menos a trilha sonora está garantida.',
    'Pausa para reabastecimento recomendada. Café conta como combustível.'
  ],
  noite: [
    'Expediente encerrado. A música, felizmente, não bate ponto.',
    'A estação está entrando em modo noturno. Você não precisa acompanhar.',
    'Luzes baixas, volume na medida e nenhuma reunião no radar.'
  ]
}

function obterPeriodo(hora: number): keyof typeof mensagens {
  if (hora >= 0 && hora < 5) return 'madrugada'
  if (hora >= 5 && hora < 12) return 'manha'
  if (hora >= 12 && hora < 18) return 'tarde'
  return 'noite'
}

function PaginaInicio(): React.JSX.Element {
  const historico = useBibliotecaStore((estado) => estado.historico)
  const carregada = useBibliotecaStore((estado) => estado.carregada)
  const recentes = historico.slice(0, 8)
  const [agora, setAgora] = useState(() => new Date())

  useEffect(() => {
    const relogio = window.setInterval(() => setAgora(new Date()), 1000)
    return () => window.clearInterval(relogio)
  }, [])

  const periodo = obterPeriodo(agora.getHours())
  const opcoes = mensagens[periodo]
  const mensagem = opcoes[agora.getHours() % opcoes.length]
  const data = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  }).format(agora)

  return (
    <section className="inicio-orbital">
      <div className="inicio-cabecalho">
        <span className="inicio-sobretitulo">ORBITAL // CENTRAL DE OPERAÇÕES</span>
        <span className="inicio-status"><i /> SISTEMAS ONLINE</span>
      </div>

      <section className="inicio-boas-vindas" aria-label="Relógio e mensagem do sistema">
        <div className="inicio-relogio">
          <span className="inicio-label">HORÁRIO LOCAL // TERRA</span>
          <strong>{agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong>
          <span className="inicio-data">{data}</span>
        </div>
        <div className="inicio-mensagem">
          <span className="inicio-label">MENSAGEM AUTOMÁTICA DO SISTEMA</span>
          <h2>{periodo === 'madrugada' ? 'Ainda acordado, tripulante?' : periodo === 'manha' ? 'Bom dia, tripulante.' : periodo === 'tarde' ? 'Boa tarde, tripulante.' : 'Boa noite, tripulante.'}</h2>
          <p>{mensagem}</p>
        </div>
        <div className="inicio-rodape-painel">
          <span>UNIDADE: OAS-01</span><span>REDE: ESTÁVEL</span><span>TRANSMISSÃO: ATIVA</span>
        </div>
      </section>

      <div className="inicio-secao-titulo">
        <h2>Início</h2><span>REGISTRO DE ATIVIDADE</span>
      </div>
      {!carregada && <p className="empty">Carregando arquivo...</p>}
      {carregada && recentes.length === 0 && (
        <div className="inicio-vazio"><span>ARQUIVO DE ÁUDIO // 000</span><p>Você ainda não ouviu nada por aqui. A biblioteca está aguardando sua primeira transmissão.</p></div>
      )}
      {recentes.length > 0 && (
        <>
          <h3>Ouvidas recentemente</h3>
          <ul className="curtidas">
            {recentes.map((musica) => (
              <li key={musica.id}>
                <button className="curtida-tocar" onClick={() => tocarMusica(musica)}>
                  <img src={musica.miniatura} alt="" />
                  <span className="resultado-texto"><strong>{musica.titulo}</strong><span>{musica.canal}</span></span>
                </button>
                <BotaoFila musica={musica} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

export default PaginaInicio
