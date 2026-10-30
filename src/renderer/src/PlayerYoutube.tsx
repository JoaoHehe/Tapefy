import { useEffect, useRef } from 'react'
import { criarPlayer } from './player/youtube'

function PlayerYoutube({ noPainel }: { noPainel: boolean }): React.JSX.Element {
  const caixa = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const elemento = caixa.current
    if (!elemento) return

    criarPlayer(elemento)

    function tentarDeNovo(): void {
      if (elemento) criarPlayer(elemento)
    }

    window.addEventListener('online', tentarDeNovo)
    return () => window.removeEventListener('online', tentarDeNovo)
  }, [])

  return <div ref={caixa} className={noPainel ? 'video no-painel' : 'video'} />
}

export default PlayerYoutube