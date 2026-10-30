export function formatarTempo(segundos: number): string {
  const total = Math.floor(segundos)
  const horas = Math.floor(total / 3600)
  const minutos = Math.floor((total % 3600) / 60)
  const resto = (total % 60).toString().padStart(2, '0')

  if (horas > 0) {
    return `${horas}:${minutos.toString().padStart(2, '0')}:${resto}`
  }
  return `${minutos}:${resto}`
}