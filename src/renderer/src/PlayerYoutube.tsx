import { useEffect, useRef } from 'react'
import { criarPlayer } from './player/youtube'

function PlayerYoutube(): React.JSX.Element {
  const caixa = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (caixa.current) {
      criarPlayer(caixa.current)
    }
  }, [])

  return <div ref={caixa} className="video" />
}

export default PlayerYoutube