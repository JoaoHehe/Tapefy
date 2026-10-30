type ItemDeBusca = {
  id: { videoId: string }
  snippet: {
    title: string
    channelTitle: string
    thumbnails: { medium: { url: string } }
  }
}

type RespostaDeBusca = { items?: ItemDeBusca[] }

type RespostaDeVideos = {
  items?: { id: string; contentDetails: { duration: string } }[]
}

type ErroDaApi = { error?: { errors?: { reason?: string }[] } }

export type ResultadoBusca = {
  id: string
  titulo: string
  canal: string
  miniatura: string
  duracao?: number
}

const VALIDADE_DO_CACHE = 30 * 60 * 1000
const LIMITE_DO_CACHE = 50
const cache = new Map<string, { guardadoEm: number; resultados: ResultadoBusca[] }>()

function limparTexto(texto: string): string {
  return texto
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function converterDuracao(texto: string): number {
  const partes = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(texto)
  if (!partes) return 0
  const [, dias, horas, minutos, segundos] = partes
  return (
    Number(dias ?? 0) * 86400 +
    Number(horas ?? 0) * 3600 +
    Number(minutos ?? 0) * 60 +
    Number(segundos ?? 0)
  )
}

async function chamarYoutube(
  caminho: string,
  parametros: Record<string, string>
): Promise<unknown> {
  const chave = import.meta.env.MAIN_VITE_YOUTUBE_API_KEY
  if (!chave) {
    throw new Error('SEM_CHAVE')
  }

  const consulta = new URLSearchParams({ ...parametros, key: chave })
  const resposta = await fetch(`https://www.googleapis.com/youtube/v3/${caminho}?${consulta}`)

  if (!resposta.ok) {
    let motivo = ''
    try {
      const corpo = (await resposta.json()) as ErroDaApi
      motivo = corpo.error?.errors?.[0]?.reason ?? ''
    } catch {
      motivo = ''
    }
    if (motivo === 'quotaExceeded') {
      throw new Error('COTA_ESGOTADA')
    }
    throw new Error(`O YouTube respondeu com erro ${resposta.status}`)
  }

  return resposta.json()
}

async function buscarDuracoes(ids: string[]): Promise<Map<string, number>> {
  const dados = (await chamarYoutube('videos', {
    part: 'contentDetails',
    id: ids.join(',')
  })) as RespostaDeVideos

  const duracoes = new Map<string, number>()
  for (const item of dados.items ?? []) {
    duracoes.set(item.id, converterDuracao(item.contentDetails.duration))
  }
  return duracoes
}

function guardarNoCache(chave: string, resultados: ResultadoBusca[]): void {
  if (cache.size >= LIMITE_DO_CACHE) {
    const maisAntiga = cache.keys().next().value
    if (maisAntiga !== undefined) {
      cache.delete(maisAntiga)
    }
  }
  cache.set(chave, { guardadoEm: Date.now(), resultados })
}

export async function buscarMusicas(termo: string): Promise<ResultadoBusca[]> {
  const consulta = termo.trim().replace(/\s+/g, ' ')
  const chaveDoCache = consulta.toLowerCase()

  const guardado = cache.get(chaveDoCache)
  if (guardado && Date.now() - guardado.guardadoEm < VALIDADE_DO_CACHE) {
    console.log('[busca] veio do cache:', consulta)
    return guardado.resultados
  }

  console.log('[busca] indo na API:', consulta)
  const dados = (await chamarYoutube('search', {
    part: 'snippet',
    type: 'video',
    videoCategoryId: '10',
    videoEmbeddable: 'true',
    maxResults: '10',
    q: consulta
  })) as RespostaDeBusca

  const resultados: ResultadoBusca[] = (dados.items ?? []).map((item) => ({
    id: item.id.videoId,
    titulo: limparTexto(item.snippet.title),
    canal: limparTexto(item.snippet.channelTitle),
    miniatura: item.snippet.thumbnails.medium.url
  }))

  let completo = true

  if (resultados.length > 0) {
    try {
      const duracoes = await buscarDuracoes(resultados.map((resultado) => resultado.id))
      for (const resultado of resultados) {
        const duracao = duracoes.get(resultado.id)
        if (duracao !== undefined) {
          resultado.duracao = duracao
        }
      }
    } catch {
      completo = false
    }
  }

  if (completo) {
    guardarNoCache(chaveDoCache, resultados)
  }

  return resultados
}