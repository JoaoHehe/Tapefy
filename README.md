# Orbital Audio Systems

Player de música para desktop que reproduz músicas do YouTube, com biblioteca pessoal, playlists e uma interface inspirada em equipamentos de áudio analógicos e ficção científica retrô.

> **Status:** em desenvolvimento. Projeto independente, desenvolvido com foco inicial em Windows.

## O que ele faz

- **Busca de músicas:** pesquisa no YouTube com busca automática enquanto você digita, atraso para reduzir o consumo da API, cache e duração dos resultados.
- **Player persistente:** continua tocando enquanto você navega entre as páginas ou está fora do player. Inclui reprodução, pausa, música anterior e próxima, barra de progresso, controle de volume, mudo, repetição e reprodução aleatória.
- **Fila manual:** clicar em uma música reproduz somente aquela faixa. Para adicionar outras músicas à fila, utilize o botão **+ Fila**. O aplicativo não adiciona músicas automaticamente.
- **Biblioteca pessoal:** músicas curtidas, playlists personalizadas e histórico de reprodução.
- **Gerenciamento de playlists:** criar, renomear, excluir com confirmação, adicionar e remover músicas.
- **Minha biblioteca:** visão geral das músicas curtidas, histórico e playlists.
- **Painel da música atual:** painel lateral com informações da reprodução, lista "A seguir" e uma representação visual de fita cassete.
- **Explorar:** página de descoberta com novidades dos canais mais ouvidos e uma lista de músicas populares no Brasil.
- **Atalhos de teclado:** comandos rápidos para controlar a reprodução.
- **Persistência local:** biblioteca, fila, volume e modos de reprodução são preservados ao fechar e reabrir o aplicativo.
- **Modo offline:** o aplicativo pode ser aberto sem internet para consultar a biblioteca. Buscar e reproduzir músicas exigem conexão.

## Identidade visual

A Orbital Audio Systems utiliza uma direção visual retrofuturista inspirada em equipamentos de áudio dos anos 1980, interfaces industriais, ficção científica e cultura das fitas cassete.

A interface combina:

- Tons de âmbar, ferrugem, azul profundo, bege vintage e carbono.
- Elementos visuais inspirados em painéis de controle e equipamentos analógicos.
- Tipografia e detalhes que remetem a sistemas eletrônicos antigos.
- Representação visual de fita cassete no painel da música atual.
- Ícones e identidade próprios da Orbital Audio Systems.

## Tecnologias

- [Electron](https://www.electronjs.org/) com [electron-vite](https://electron-vite.org/)
- [React](https://react.dev/) e TypeScript
- [Zustand](https://zustand.docs.pmnd.rs/) para gerenciamento do estado global.
- [React Router](https://reactrouter.com/) com `HashRouter`.
- Armazenamento local em arquivos JSON, gerenciado pelo processo principal do Electron.
- YouTube IFrame Player API e YouTube Data API v3.

## Estrutura do projeto

```text
src/
├── main/                       processo principal do Electron
│   ├── index.ts                janela e comunicação com a interface
│   ├── busca.ts                busca na YouTube Data API, com cache
│   ├── recomendacoes.ts        sugestões baseadas no histórico e curtidas
│   └── armazenamento.ts        leitura e gravação dos arquivos JSON
├── preload/                    ponte segura entre os processos
└── renderer/src/               interface React
    ├── player/youtube.ts       lógica do player, fila e eventos
    ├── store/                  estado global do player e biblioteca
    ├── Pagina*.tsx             páginas do aplicativo
    ├── assets/                 imagens, ícones e identidade visual
    └── ...                     componentes, atalhos e utilitários

resources/
└── icon.png                    ícone utilizado pela janela do aplicativo

build/
├── icon.ico                    ícone para Windows
├── icon.icns                   ícone para macOS
└── icon.png                    ícone para Linux
```

## Como rodar

### Requisitos

- [Node.js](https://nodejs.org/) (versão LTS recente).
- Uma chave da YouTube Data API v3.

### Obtendo uma chave da API

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/) e crie um projeto.
2. Em **APIs e serviços**, ative a **YouTube Data API v3**.
3. Em **Credenciais**, crie uma chave de API.
4. Restrinja a chave para utilização com a YouTube Data API v3.

### Instalação

Clone o repositório e instale as dependências:

```bash
git clone URL_DO_REPOSITORIO
cd NOME_DA_PASTA
npm install
```

Crie um arquivo `.env` na raiz do projeto, utilizando o `.env.example` como referência:

```env
MAIN_VITE_YOUTUBE_API_KEY=cole_sua_chave_aqui
```

Inicie o aplicativo em modo de desenvolvimento:

```bash
npm run dev
```

> O arquivo `.env` contém sua chave de API e não deve ser enviado ao GitHub. Ele já está incluído no `.gitignore`.

## Build

Para gerar a versão de produção:

```bash
npm run build
```

Para executar a versão gerada:

```bash
npm run start
```

### Gerando instaladores

O projeto possui comandos de empacotamento para os seguintes sistemas:

```bash
npm run build:win
npm run build:mac
npm run build:linux
```

Os ícones próprios da Orbital Audio Systems estão configurados para Windows, macOS e Linux.

## Atalhos de teclado

Os atalhos funcionam quando a janela está em foco e o usuário não está digitando em um campo de texto.

| Tecla | Ação |
|---|---|
| Espaço ou K | Tocar / pausar |
| N | Próxima música |
| P | Música anterior |
| M | Silenciar / ativar som |
| Shift + ↑ | Aumentar volume em 5 |
| Shift + ↓ | Diminuir volume em 5 |

**Observação:** quando um botão ou link está em foco, a tecla Espaço pode acionar o próprio elemento. Nesse caso, utilize K para controlar a reprodução.

## Onde ficam os dados

Os dados são armazenados localmente no computador, na pasta de dados do aplicativo. No Windows, ela fica dentro de `%APPDATA%`.

Os arquivos JSON utilizados são:

- `biblioteca.json`: músicas curtidas, playlists e histórico.
- `player.json`: fila, última música reproduzida, volume e modos de repetição e aleatório.

Para montar as sugestões, o aplicativo envia à API do YouTube os IDs das últimas músicas do histórico e das músicas curtidas, limitados a 50 IDs.

Nenhuma outra informação pessoal é enviada por esse recurso.

## Limitações conhecidas

- Você pode ignorar o anúncios do Youtube utilizando o "Adblocker do Brave" mas não foi feito para utilizar outros "Adblockers" ao menos ainda não foi testado.
- O áudio não fica disponível offline. Apenas a biblioteca local pode ser consultada sem conexão.
- A busca encontra vídeos, não artistas, álbuns ou playlists como em serviços tradicionais de streaming.
- A cota diária da YouTube Data API é limitada. Quando ela acaba, novas buscas podem ficar indisponíveis até a renovação da cota.
- O desenvolvimento e os testes foram direcionados inicialmente ao Windows. As demais plataformas precisam de validação.

## Roadmap

- [ ] Pausar automaticamente a reprodução ao minimizar a janela.
- [ ] Permitir configurar a chave da API diretamente nas configurações do aplicativo.
- [ ] Implementar testes automatizados.
- [ ] Validar os instaladores e a distribuição em diferentes plataformas.
- [ ] Adicionar opções para ordenar e pesquisar músicas dentro das playlists.
- [ ] Aprimorar as sugestões e a descoberta de músicas.

## Aviso

Este é um projeto independente e não possui afiliação, patrocínio ou endosso do YouTube ou do Google.

YouTube é uma marca registrada da Google LLC. Todo o conteúdo reproduzido pertence aos seus respectivos proprietários.

## Licença

MIT
