import { useEffect, useState } from 'react'
import { usePlayerStore } from './store/playerStore'
import { buscarTempo, lerTempo } from './player/youtube'

function formatar(segundos: number): string {
  const total = Math.floor(segundos)
  const minutos = Math.floor(total / 60)
  const resto = total % 60
  return `${minutos}:${resto.toString().padStart(2, '0')}`
}

function BarraProgresso(): React.JSX.Element {
  const tocando = usePlayerStore((estado) => estado.tocando)
  const idDaMusica = usePlayerStore((estado) => estado.fila[estado.indice]?.id)
  const [atual, setAtual] = useState(0)
  const [duracao, setDuracao] = useState(0)

  useEffect(() => {
    function atualizar(): void {
      const tempo = lerTempo()
      setAtual(tempo.atual)
      setDuracao(tempo.duracao)
    }

    atualizar()
    if (!tocando) return

    const intervalo = setInterval(atualizar, 500)
    return () => clearInterval(intervalo)
  }, [tocando, idDaMusica])

  return (
    <div className="progresso">
      <span>{formatar(atual)}</span>
      <input
        type="range"
        min={0}
        max={duracao}
        step={1}
        value={Math.min(atual, duracao)}
        disabled={duracao === 0}
        onChange={(evento) => {
          const novoTempo = Number(evento.target.value)
          setAtual(novoTempo)
          buscarTempo(novoTempo)
        }}
        aria-label="Progresso da música"
      />
      <span>{formatar(duracao)}</span>
    </div>
  )
}

export default BarraProgresso