import { usePlayerStore } from '../store/playerStore'
import type { ModoRepetir } from '../store/playerStore'
import { useBibliotecaStore } from '../store/bibliotecaStore'
import type { ResultadoBusca } from '../tipos'

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void
  }
}

type EstadoSalvo = {
  fila?: unknown
  indice?: unknown
  volume?: unknown
  repetir?: unknown
  aleatorio?: unknown
}

let player: YT.Player | null = null
let criando = false
let apiPronta: Promise<void> | null = null
let historico: number[] = []
let ultimoRegistrado = ''
let restaurando = false
let restauracaoIniciada = false
let persistenciaAtiva = false
let ultimoSalvo = ''
let temporizador: ReturnType<typeof setTimeout> | undefined

function carregarApi(): Promise<void> {
  if (apiPronta) return apiPronta
  apiPronta = new Promise((resolve, reject) => {
    window.onYouTubeIframeAPIReady = () => resolve()
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.onerror = () => {
      script.remove()
      apiPronta = null
      reject(new Error('Falha ao carregar a API do YouTube'))
    }
    document.head.appendChild(script)
  })
  return apiPronta
}

export async function criarPlayer(caixa: HTMLElement): Promise<void> {
  if (player || criando) return
  criando = true

  try {
    await carregarApi()
  } catch {
    criando = false
    return
  }

  const alvo = document.createElement('div')
  caixa.appendChild(alvo)

  player = new YT.Player(alvo, {
    width: '0',
    height: '',
    events: {
      onReady: () => {
        const estado = usePlayerStore.getState()
        player?.setVolume(estado.volume)
        estado.definirPronto(true)
        if (persistenciaAtiva) {
          prepararMusicaSalva()
        }
      },
      onStateChange: (evento) => {
        const estado = usePlayerStore.getState()
        estado.definirTocando(evento.data === YT.PlayerState.PLAYING)
        if (player) {
          estado.definirVolume(player.getVolume())
          estado.definirMudo(player.isMuted())
        }
        if (evento.data === YT.PlayerState.PLAYING || evento.data === YT.PlayerState.CUED) {
          restaurando = false
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
        if (restaurando) {
          restaurando = false
          usePlayerStore.getState().definirAviso('A última música não está mais disponível.')
          return
        }
        avancar(false)
        usePlayerStore.getState().definirAviso('Esse vídeo não pode ser tocado aqui.')
      }
    }
  })
}

function musicaValida(item: unknown): item is ResultadoBusca {
  if (typeof item !== 'object' || item === null) return false
  const musica = item as Record<string, unknown>
  return (
    typeof musica.id === 'string' &&
    typeof musica.titulo === 'string' &&
    typeof musica.canal === 'string' &&
    typeof musica.miniatura === 'string'
  )
}

function dadosParaSalvar(): object {
  const { fila, indice, volume, repetir, aleatorio } = usePlayerStore.getState()
  return { fila, indice, volume, repetir, aleatorio }
}

function agendarSalvamento(): void {
  if (!persistenciaAtiva) return
  if (JSON.stringify(dadosParaSalvar()) === ultimoSalvo) return
  clearTimeout(temporizador)
  temporizador = setTimeout(() => {
    const dados = dadosParaSalvar()
    const texto = JSON.stringify(dados)
    if (texto === ultimoSalvo) return
    ultimoSalvo = texto
    window.api.salvarEstadoDoPlayer(dados)
  }, 500)
}

function prepararMusicaSalva(): void {
  const { fila, indice } = usePlayerStore.getState()
  const musica = fila[indice]
  if (!player || !musica) return
  restaurando = true
  player.cueVideoById(musica.id)
}

export async function restaurarEstado(): Promise<void> {
  if (restauracaoIniciada) return
  restauracaoIniciada = true

  const salvo = (await window.api.lerEstadoDoPlayer()) as EstadoSalvo | null

  if (salvo && usePlayerStore.getState().fila.length === 0) {
    const lista: unknown[] = Array.isArray(salvo.fila) ? salvo.fila : []
    const fila = lista.every(musicaValida) ? (lista as ResultadoBusca[]) : []
    const indice =
      typeof salvo.indice === 'number' &&
      Number.isInteger(salvo.indice) &&
      salvo.indice >= 0 &&
      salvo.indice < fila.length
        ? salvo.indice
        : -1
    const volume =
      typeof salvo.volume === 'number' && salvo.volume >= 0 && salvo.volume <= 100
        ? salvo.volume
        : 100
    const repetir: ModoRepetir =
      salvo.repetir === 'fila' || salvo.repetir === 'uma' ? salvo.repetir : 'desligado'
    const aleatorio = salvo.aleatorio === true

    usePlayerStore.setState({
      fila: indice >= 0 ? fila : [],
      indice,
      volume,
      repetir,
      aleatorio
    })

    if (player && usePlayerStore.getState().pronto) {
      player.setVolume(volume)
    }
  }

  ultimoSalvo = JSON.stringify(dadosParaSalvar())
  usePlayerStore.subscribe(agendarSalvamento)
  persistenciaAtiva = true

  if (usePlayerStore.getState().pronto) {
    prepararMusicaSalva()
  }
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

export function tocarMusica(musica: ResultadoBusca): void {
  tocarFila([musica], 0)
}

export function adicionarNaFila(musica: ResultadoBusca): 'tocando' | 'adicionada' | 'repetida' {
  const estado = usePlayerStore.getState()
  if (estado.fila.length === 0) {
    tocarFila([musica], 0)
    return 'tocando'
  }
  if (estado.fila.some((item) => item.id === musica.id)) {
    return 'repetida'
  }
  estado.adicionarNaFila(musica)
  return 'adicionada'
}

export function tocarDaFila(indice: number): void {
  irPara(indice)
}

export function removerDaFila(posicao: number): void {
  const estado = usePlayerStore.getState()
  if (posicao === estado.indice) return
  historico = []
  estado.removerDaFila(posicao)
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