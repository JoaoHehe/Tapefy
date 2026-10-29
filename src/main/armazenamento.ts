import { app } from 'electron'
import { join } from 'path'
import { readFile, rename, writeFile } from 'fs/promises'

function caminhoDoArquivo(): string {
  return join(app.getPath('userData'), 'biblioteca.json')
}

export async function lerBiblioteca(): Promise<unknown> {
  try {
    const texto = await readFile(caminhoDoArquivo(), 'utf-8')
    return JSON.parse(texto)
  } catch {
    return null
  }
}

export async function salvarBiblioteca(dados: unknown): Promise<void> {
  const destino = caminhoDoArquivo()
  const temporario = `${destino}.tmp`
  await writeFile(temporario, JSON.stringify(dados), 'utf-8')
  await rename(temporario, destino)
}