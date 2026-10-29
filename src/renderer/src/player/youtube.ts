import { usePlayerStore } from '../store/playerStore'
import type { ResultadoBusca } from '../tipos'
import { useBibliotecaStore } from '../store/bibliotecaStore'

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void
  }
}

let player: YT.Player | null = null
let criando = false
let apiPronta: Promise<void> | null = null
let historico: number[] = []
let ultimoRegistrado = ''

function carregarApi(): Promise<void> {
  if (apiPronta) return apiPronta
  apiPronta = new Promise((resolve) => {
    window.onYouTubeIframeAPIReady = () => resolve()
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(script)
  })
  return apiPronta
}

export async function criarPlayer(caixa: HTMLElement): Promise<void> {
  if (player || criando) return
  criando = true
  await carregarApi()

  const alvo = document.createElement('div')
  caixa.appendChild(alvo)

  player = new YT.Player(alvo, {
    width: '480',
    height: '270',
    events: {
      onReady: () => {
        const estado = usePlayerStore.getState()
        player?.setVolume(estado.volume)
        estado.definirPronto(true)
      },
      onStateChange: (evento) => {
  const estado = usePlayerStore.getState()
  estado.definirTocando(evento.data === YT.PlayerState.PLAYING)
  if (player) {
    estado.definirVolume(player.getVolume())
    estado.definirMudo(player.isMuted())
  }
  if (evento.data === YT.PlayerState.PLAYING) {
    const musica = estado.fila[estado.indice]
    const biblioteca = useBibliotecaStore.getState()
    if (musica && biblioteca.carregada && musica.id !== ultimoRegistrado) {
      ultimoRegistrado = musica.id
      biblioteca.registrarNoHistorico(musica)
    }
  }
  if (evento.data === YT.PlayerState.ENDED) {
    avancar(true)
  }
},
      onError: () => {
        avancar(false)
        usePlayerStore.getState().definirAviso('Esse vídeo não pode ser tocado aqui.')
      }
    }
  })
}

function irPara(indice: number): void {
  const { fila, indice: atual, aleatorio, definirIndice } = usePlayerStore.getState()
  const musica = fila[indice]
  if (!player || !musica) return
  if (aleatorio && atual >= 0) {
    historico.push(atual)
  }
  definirIndice(indice)
  player.loadVideoById(musica.id)
}

function sortearIndice(): number {
  const { fila, indice } = usePlayerStore.getState()
  let sorteado = indice
  while (sorteado === indice) {
    sorteado = Math.floor(Math.random() * fila.length)
  }
  return sorteado
}

function recomecar(): void {
  if (!player) return
  player.seekTo(0, true)
  player.playVideo()
}

function avancar(automatica: boolean): void {
  const { indice, fila, repetir, aleatorio } = usePlayerStore.getState()
  if (!player || indice < 0) return

  if (automatica && repetir === 'uma') {
    recomecar()
    return
  }

  if (aleatorio && fila.length > 1) {
    irPara(sortearIndice())
    return
  }

  if (indice + 1 < fila.length) {
    irPara(indice + 1)
    return
  }

  if (repetir === 'fila') {
    if (fila.length === 1) {
      recomecar()
    } else {
      irPara(0)
    }
  }
}

export function proxima(): void {
  avancar(false)
}

export function anterior(): void {
  const { indice, aleatorio } = usePlayerStore.getState()
  if (!player || indice < 0) return

  if (aleatorio) {
    const ultima = historico.pop()
    if (ultima === undefined) {
      player.seekTo(0, true)
    } else {
      usePlayerStore.getState().definirIndice(ultima)
      const musica = usePlayerStore.getState().fila[ultima]
      if (musica) player.loadVideoById(musica.id)
    }
    return
  }

  if (indice > 0) {
    irPara(indice - 1)
  }
}

export function tocarFila(lista: ResultadoBusca[], indice: number): void {
  if (!player || !lista[indice]) return
  historico = []
  usePlayerStore.getState().definirFila(lista, indice)
  player.loadVideoById(lista[indice].id)
}

export function tocarOuPausar(): void {
  if (!player) return
  if (player.getPlayerState() === YT.PlayerState.PLAYING) {
    player.pauseVideo()
  } else {
    player.playVideo()
  }
}

export function lerTempo(): { atual: number; duracao: number } {
  if (!player || !usePlayerStore.getState().pronto) {
    return { atual: 0, duracao: 0 }
  }
  return { atual: player.getCurrentTime(), duracao: player.getDuration() }
}

export function buscarTempo(segundos: number): void {
  if (!player) return
  player.seekTo(segundos, true)
}

export function mudarVolume(valor: number): void {
  if (!player) return
  const estado = usePlayerStore.getState()
  player.setVolume(valor)
  estado.definirVolume(valor)
  if (valor > 0 && player.isMuted()) {
    player.unMute()
    estado.definirMudo(false)
  }
}

export function alternarMudo(): void {
  if (!player) return
  const estado = usePlayerStore.getState()
  if (player.isMuted()) {
    player.unMute()
    estado.definirMudo(false)
  } else {
    player.mute()
    estado.definirMudo(true)
  }
}

export function alternarRepetir(): void {
  const estado = usePlayerStore.getState()
  if (estado.repetir === 'desligado') {
    estado.definirRepetir('fila')
  } else if (estado.repetir === 'fila') {
    estado.definirRepetir('uma')
  } else {
    estado.definirRepetir('desligado')
  }
}

export function alternarAleatorio(): void {
  const estado = usePlayerStore.getState()
  historico = []
  estado.definirAleatorio(!estado.aleatorio)
}