# 📈 CryptoDash - Terminal de Operações em Tempo Real

Um dashboard interativo e profissional para acompanhamento do mercado de criptomoedas em tempo real. Desenvolvido com **Next.js** e focado em alta performance, o projeto consome o fluxo contínuo de dados da Binance via **WebSocket**, renderizando variações de preço, volume e gráficos sem a necessidade de recarregar a página.

![Status: Produção](https://img.shields.io/badge/Status-Produção-success)
![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0+-38B2AC?logo=tailwind-css)

## ✨ Funcionalidades

* **⚡ Dados em Tempo Real (WebSocket):** Conexão direta com a API stream da Binance, atualizando preços e estatísticas instantaneamente.
* **📊 Gráficos Sparkline Dinâmicos:** Visualização do histórico recente de preços através de gráficos de linha leves e responsivos renderizados com Recharts.
* **🤏 Drag and Drop Nativo (Arrastar e Soltar):** Reordenação livre dos cards de criptomoedas pelo usuário utilizando a API HTML5 nativa, sem bibliotecas pesadas.
* **📌 Layout Híbrido:** Linha de destaque fixa para os principais ativos (BTC, ETH, BNB, SOL) separada do mercado geral customizável.
* **🧠 Insights de Mercado (Macro):** Cálculo ao vivo do sentimento do painel, exibindo as moedas com as maiores altas e quedas nas últimas 24h.
* **🔍 Ação de Preço Detalhada (Micro):** Leitura de estatísticas aprofundadas (Máxima 24h, Mínima 24h e Volume) com foco no Bitcoin.
* **➕ Gestão de Ativos:** Adição e remoção dinâmica de novos *tickers* da corretora diretamente pela interface.

## 🛠️ Stack Tecnológica

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Linguagem:** [TypeScript](https://www.typescriptlang.org/) (Tipagem estática rigorosa para os contratos da API)
* **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
* **Gráficos:** [Recharts](https://recharts.org/)
* **Fonte de Dados:** [Binance WebSocket API](https://binance-docs.github.io/apidocs/spot/en/#websocket-market-streams)
* **Hospedagem:** [Vercel](https://vercel.com/)

## 🚀 Como rodar localmente

Siga as instruções abaixo para rodar o projeto no seu ambiente de desenvolvimento.

### Pré-requisitos
* Node.js (versão 20.x ou superior)
* NPM ou Yarn

### Instalação

1. Clone o repositório:
```bash
git clone [https://github.com/SEU_USUARIO/crypto-dashboard.git](https://github.com/aprendiz-mkunha1979/crypto-dashboard.git)

2. Entre no diretório do projeto:
```bash
cd crypto-dashboard

3. Instale as dependências:
```bash
npm install

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev

5.Abra ![http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

### 🏗️ Arquitetura do Projeto

A base de código segue o princípio de Separação de Responsabilidades (Separation of Concerns), isolando a lógica de conexão de rede, tipagens, e regras visuais:
src/
├── app/
│   └── page.tsx                 # View principal e orquestração de estado global
├── components/
│   ├── CryptoCard.tsx           # Componente visual isolado do card e gráfico
│   └── DashboardGrid.tsx        # Componente responsável pela malha e lógica de Drag & Drop
├── hooks/
│   └── useCryptoWebSocket.ts    # Custom Hook encapsulando a conexão e gestão do WebSocket
└── types/
    └── crypto.ts                # Contratos de interface TypeScript (Data Models)

### 📄 Licença

Este projeto está sob a licença MIT. Sinta-se livre para usá-lo e modificá-lo.


