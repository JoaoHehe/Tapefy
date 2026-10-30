import { app } from 'electron'
import { join } from 'path'
import { readFile, rename, writeFile } from 'fs/promises'

async function ler(nome: string): Promise<unknown> {
  try {
    const texto = await readFile(join(app.getPath('userData'), nome), 'utf-8')
    return JSON.parse(texto)
  } catch {
    return null
  }
}

async function salvar(nome: string, dados: unknown): Promise<void> {
  const destino = join(app.getPath('userData'), nome)
  const temporario = `${destino}.tmp`
  await writeFile(temporario, JSON.stringify(dados), 'utf-8')
  await rename(temporario, destino)
}

export const lerBiblioteca = (): Promise<unknown> => ler('biblioteca.json')
export const salvarBiblioteca = (dados: unknown): Promise<void> => salvar('biblioteca.json', dados)
export const lerEstadoDoPlayer = (): Promise<unknown> => ler('player.json')
export const salvarEstadoDoPlayer = (dados: unknown): Promise<void> => salvar('player.json', dados)