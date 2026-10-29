import { usePlayerStore } from './store/playerStore'
import { alternarMudo, mudarVolume } from './player/youtube'

function ControleVolume(): React.JSX.Element {
  const pronto = usePlayerStore((estado) => estado.pronto)
  const volume = usePlayerStore((estado) => estado.volume)
  const mudo = usePlayerStore((estado) => estado.mudo)
  const silenciado = mudo || volume === 0

  function icone(): string {
    if (silenciado) return '🔇'
    if (volume < 50) return '🔉'
    return '🔊'
  }

  return (
    <div className="volume">
      <button
        disabled={!pronto}
        onClick={alternarMudo}
        aria-label={silenciado ? 'Ativar som' : 'Silenciar'}
      >
        {icone()}
      </button>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={mudo ? 0 : volume}
        disabled={!pronto}
        onChange={(evento) => mudarVolume(Number(evento.target.value))}
        aria-label="Volume"
      />
    </div>
  )
}

export default ControleVolume