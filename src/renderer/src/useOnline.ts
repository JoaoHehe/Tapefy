import { useEffect, useState } from 'react'

export function useOnline(): boolean {
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    function ligar(): void {
      setOnline(true)
    }
    function desligar(): void {
      setOnline(false)
    }

    window.addEventListener('online', ligar)
    window.addEventListener('offline', desligar)
    return () => {
      window.removeEventListener('online', ligar)
      window.removeEventListener('offline', desligar)
    }
  }, [])

  return online
}