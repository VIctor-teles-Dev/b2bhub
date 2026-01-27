# 🏛️ B2Bhub - Painel de Automação Jurídica

> Plataforma interna de automação para agilizar o fluxo jurídico da Jus Soluções, com ferramentas para análise de distribuições e validação de padrões regex.

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-blue?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css)
![Bun](https://img.shields.io/badge/Bun-Runtime-f9f1e4?logo=bun)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Stack Tecnológica](#-stack-tecnológica)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Design Patterns](#-design-patterns)
- [Instalação](#-instalação)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Configuração de Ambiente](#-configuração-de-ambiente)
- [Funcionalidades](#-funcionalidades)
- [Componentes UI](#-componentes-ui)
- [Guidelines de Contribuição](#-guidelines-de-contribuição)
- [Licença](#-licença)
- [Contato](#-contato)

---

## 📖 Sobre o Projeto

O **B2Bhub** é um painel de automação interno desenvolvido para centralizar operações e otimizar processos jurídicos. A plataforma oferece:

- **Análise de Distribuições**: Verifica datas e empresas responsáveis pela distribuição de processos judiciais via integração com a API do Digesto.
- **Validador de Regex**: Valida partes de processos contra padrões regex corporativos.
- **Design System**: Interface baseada no aesthetic da Jusbrasil com componentes reutilizáveis.

---

## 🛠️ Stack Tecnológica

O projeto utiliza a **B.E.R.T. Stack** (adaptada):

| Tecnologia       | Versão   | Propósito                                      |
| ---------------- | -------- | ---------------------------------------------- |
| **Bun**          | Latest   | Runtime JavaScript e gerenciador de pacotes    |
| **Next.js**      | 16.1.1   | Framework React com App Router                 |
| **React**        | 19.2.3   | Biblioteca de UI com React Compiler habilitado |
| **Tailwind CSS** | 4        | Framework CSS utility-first                    |
| **TypeScript**   | 5        | Tipagem estática                               |
| **shadcn/ui**    | new-york | Componentes UI baseados em Radix UI            |
| **Lucide React** | 0.562.0  | Biblioteca de ícones                           |

### Principais Dependências

```json
{
  "@radix-ui/react-dialog": "^1.1.15",
  "@radix-ui/react-label": "^2.1.8",
  "@radix-ui/react-tooltip": "^1.2.8",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.4.0"
}
```

---

## 📁 Estrutura de Pastas

```plaintext
B2Bhub/
├── public/                     # Assets estáticos (logo, ícones)
├── src/
│   ├── app/                    # App Router (Next.js)
│   │   ├── distribution/       # Feature: Análise de Distribuições
│   │   │   ├── actions.ts      # Server Actions
│   │   │   ├── actions.test.ts # Testes unitários
│   │   │   ├── page.tsx        # Página da feature
│   │   │   ├── company-tooltip.tsx
│   │   │   └── copy-message-button.tsx
│   │   ├── regex-validator/    # Feature: Validador de Regex
│   │   │   ├── actions.ts
│   │   │   ├── actions.test.ts
│   │   │   └── page.tsx
│   │   ├── globals.css         # CSS global + Design tokens
│   │   ├── layout.tsx          # Layout raiz com Sidebar
│   │   └── page.tsx            # Home page
│   ├── components/
│   │   ├── ui/                 # Componentes shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── ...
│   │   ├── distribution/       # Componentes específicos da feature
│   │   └── app-sidebar.tsx     # Navegação lateral
│   ├── hooks/
│   │   └── use-mobile.ts       # Hook para detecção mobile
│   └── lib/
│       ├── cnj-utils.ts        # Utilitários para CNJ
│       ├── cnj-utils.test.ts   # Testes
│       ├── date-utils.ts       # Utilitários de data
│       ├── date-utils.test.ts  # Testes
│       └── utils.ts            # Utilitários gerais (cn)
├── components.json             # Configuração shadcn/ui
├── next.config.ts              # Configuração Next.js
├── tailwind.config.ts          # Configuração Tailwind (se presente)
├── tsconfig.json               # Configuração TypeScript
└── package.json
```

---


## 🚀 Instalação

### Pré-requisitos

- **Bun** versão 1.0 ou superior ([instalar Bun](https://bun.sh/))
- **Node.js** 18+ (opcional, para compatibilidade)

### Passos

1. **Clone o repositório**

   ```bash
   git clone https://github.com/seu-usuario/B2Bhub.git
   cd B2Bhub
   ```

2. **Instale as dependências**

   ```bash
   bun install
   ```

3. **Configure as variáveis de ambiente**

   Crie um arquivo `.env.local` na raiz do projeto:

   ```env
   DIGESTO_API_TOKEN=seu_token_aqui
   ```

4. **Inicie o servidor de desenvolvimento**

   ```bash
   bun dev
   ```

5. **Acesse a aplicação**

   Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 📜 Scripts Disponíveis

| Comando     | Descrição                            |
| ----------- | ------------------------------------ |
| `bun dev`   | Inicia o servidor de desenvolvimento |
| `bun build` | Gera build de produção               |
| `bun start` | Inicia servidor de produção          |
| `bun test`  | Executa testes unitários             |
| `bun lint`  | Executa ESLint                       |

---

## ⚙️ Configuração de Ambiente

### Variáveis Obrigatórias

| Variável            | Descrição                                 |
| ------------------- | ----------------------------------------- |
| `DIGESTO_API_TOKEN` | Token de autenticação para API do Digesto |

### Arquivo `.env.local` de Exemplo

```env
# API Digesto
DIGESTO_API_TOKEN=seu_token_bearer

# Outras configurações (se necessário)
# NEXT_PUBLIC_API_URL=https://api.example.com
```

---

## ✨ Funcionalidades

### 🔍 Análise de Distribuições

Consulta a API do Digesto para obter informações sobre distribuições de processos:

- Pesquisa por CNJ (formato flexível)
- Exibe data de envio e data de distribuição
- Mostra empresa responsável via tooltip
- Copia mensagem formatada para clipboard
- Alerta visual quando distribuição foi tardia

### 🧪 Validador de Regex

Ferramenta para testar e validar padrões regex contra textos:

- Editor de regex interativo
- Destaque de matches em tempo real
- Suporte a flags de regex

---

## 🧩 Componentes UI

O projeto utiliza **shadcn/ui** (estilo `new-york`) com os seguintes componentes:

| Componente | Arquivo            | Uso                    |
| ---------- | ------------------ | ---------------------- |
| Alert      | `ui/alert.tsx`     | Mensagens de feedback  |
| Badge      | `ui/badge.tsx`     | Labels e tags          |
| Button     | `ui/button.tsx`    | Botões interativos     |
| Card       | `ui/card.tsx`      | Containers de conteúdo |
| Input      | `ui/input.tsx`     | Campos de entrada      |
| Label      | `ui/label.tsx`     | Labels de formulário   |
| Separator  | `ui/separator.tsx` | Divisores              |
| Sheet      | `ui/sheet.tsx`     | Painéis laterais       |
| Sidebar    | `ui/sidebar.tsx`   | Navegação lateral      |
| Skeleton   | `ui/skeleton.tsx`  | Loading states         |
| Tooltip    | `ui/tooltip.tsx`   | Dicas de contexto      |

### Adicionando Novos Componentes

```bash
npx shadcn@latest add [nome-do-componente]
```

---

## 🤝 Guidelines de Contribuição

### Padrões de Código

1. **TypeScript Strict Mode**: Sempre tipagem explícita
2. **Imports Absolutos**: Use `@/` para imports (ex: `@/components/ui/button`)
3. **Server vs Client**: Marque componentes com `'use client'` quando necessário
4. **Testes**: Adicione testes para novas funcionalidades em `lib/`

### Estrutura de Commits

```
feat: adiciona nova funcionalidade
fix: corrige bug específico
refactor: refatora código sem alterar comportamento
test: adiciona ou modifica testes
docs: atualiza documentação
```

### Processo de Contribuição

1. Faça fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit das suas alterações
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Executando Testes

```bash
# Todos os testes
bun test

# Testes específicos
bun test src/lib/cnj-utils.test.ts
```

---

## 📄 Licença

Este projeto é **privado** e de uso interno da **Jus Soluções**.

Todos os direitos reservados © 2026 JUS SOLUÇÕES.

---

<div align="center">
  <sub>Desenvolvido com pela equipe Jus Soluções</sub>
</div>
