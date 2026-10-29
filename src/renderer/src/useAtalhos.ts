import { useEffect } from 'react'
import { usePlayerStore } from './store/playerStore'
import { alternarMudo, anterior, mudarVolume, proxima, tocarOuPausar } from './player/youtube'

function estaDigitando(alvo: EventTarget | null): boolean {
  if (!(alvo instanceof HTMLElement)) return false
  if (alvo.isContentEditable) return true
  if (alvo.tagName === 'TEXTAREA' || alvo.tagName === 'SELECT') return true
  if (alvo.tagName === 'INPUT') {
    return (alvo as HTMLInputElement).type !== 'range'
  }
  return false
}

export function useAtalhos(): void {
  useEffect(() => {
    function aoPressionar(evento: KeyboardEvent): void {
      if (evento.ctrlKey || evento.metaKey || evento.altKey) return
      if (estaDigitando(evento.target)) return
      if (!usePlayerStore.getState().pronto) return

      if (evento.shiftKey && (evento.key === 'ArrowUp' || evento.key === 'ArrowDown')) {
        evento.preventDefault()
        const { volume } = usePlayerStore.getState()
        const novo = evento.key === 'ArrowUp' ? Math.min(100, volume + 5) : Math.max(0, volume - 5)
        mudarVolume(novo)
        return
      }

      if (evento.repeat) return

      if (evento.key === ' ') {
        const alvo = evento.target
        if (alvo instanceof HTMLElement && (alvo.tagName === 'BUTTON' || alvo.tagName === 'A')) {
          return
        }
        evento.preventDefault()
        tocarOuPausar()
        return
      }

      const tecla = evento.key.toLowerCase()
      if (tecla === 'k') tocarOuPausar()
      if (tecla === 'n') proxima()
      if (tecla === 'p') anterior()
      if (tecla === 'm') alternarMudo()
    }

    window.addEventListener('keydown', aoPressionar)
    return () => window.removeEventListener('keydown', aoPressionar)
  }, [])
}