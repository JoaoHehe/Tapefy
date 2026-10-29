import { useState } from 'react'
import type { ResultadoBusca } from './tipos'
import { usePlayerStore } from './store/playerStore'
import { adicionarNaFila } from './player/youtube'

function BotaoFila({ musica }: { musica: ResultadoBusca }): React.JSX.Element {
    const pronto = usePlayerStore((estado) => estado.pronto)
    const [mensagem, setMensagem] = useState('')

    function clicar(): void {
        const resultado = adicionarNaFila(musica)
        if (resultado === 'adicionada') setMensagem('Adicionada à fila')
        if (resultado === 'repetida') setMensagem('Já está na fila')
        if (resultado === 'tocando') setMensagem('Tocando agora')
        setTimeout(() => setMensagem(''), 2000)
    }

    return (
        <>
            <button
                className="botao-pequeno"
                disabled={!pronto}
                onClick={clicar}
                aria-label={`Adicionar ${musica.titulo} à fila`}
            >
                + Fila
            </button>
            {mensagem && (
                <span className="aviso-playlist" role="status">
                    {mensagem}
                </span>
            )}
        </>
    )
}

export default BotaoFila