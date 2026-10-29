type RespostaYoutube = {
  items: {
    id: { videoId: string }
    snippet: {
      title: string
      channelTitle: string
      thumbnails: { medium: { url: string } }
    }
  }[]
}

export type ResultadoBusca = {
  id: string
  titulo: string
  canal: string
  miniatura: string
}

function limparTexto(texto: string): string {
  return texto
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

export async function buscarMusicas(termo: string): Promise<ResultadoBusca[]> {
  const chave = import.meta.env.MAIN_VITE_YOUTUBE_API_KEY
  if (!chave) {
    throw new Error('Falta a chave da API no arquivo .env')
  }

  const parametros = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    videoCategoryId: '10',
    videoEmbeddable: 'true',
    maxResults: '10',
    q: termo,
    key: chave
  })

  const resposta = await fetch(`https://www.googleapis.com/youtube/v3/search?${parametros}`)
  if (!resposta.ok) {
    throw new Error(`O YouTube respondeu com erro ${resposta.status}`)
  }

  const dados = (await resposta.json()) as RespostaYoutube

  return dados.items.map((item) => ({
    id: item.id.videoId,
    titulo: limparTexto(item.snippet.title),
    canal: limparTexto(item.snippet.channelTitle),
    miniatura: item.snippet.thumbnails.medium.url
  }))
}