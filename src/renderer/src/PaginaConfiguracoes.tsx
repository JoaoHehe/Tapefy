import { ATALHOS } from './atalhos'

function PaginaConfiguracoes(): React.JSX.Element {
  return (
    <>
      <h2>Configurações</h2>

      <h3>Atalhos de teclado</h3>
      <p className="empty">
        Os atalhos não funcionam enquanto você digita num campo de texto. Com o foco num botão ou
        link, o Espaço aciona o próprio botão, então use o K.
      </p>

      <table className="atalhos">
        <tbody>
          {ATALHOS.map((atalho) => (
            <tr key={atalho.acao}>
              <th scope="row">
                <kbd>{atalho.teclas}</kbd>
              </th>
              <td>{atalho.acao}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default PaginaConfiguracoes