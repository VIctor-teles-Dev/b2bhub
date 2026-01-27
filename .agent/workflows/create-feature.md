---
description: Como criar uma nova feature no projeto B2Bhub
---

# 🚀 Workflow: Criar Nova Feature

Este workflow guia a criação de novas funcionalidades no projeto B2Bhub seguindo os padrões estabelecidos.

---

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de:

1. **Entender o contexto do projeto** lendo o `README.md`
2. **Verificar a estrutura de pastas** em `src/`
3. **Identificar componentes reutilizáveis** em `src/components/ui/`

---

## 🔍 Fase 1: Análise e Planejamento

### 1.1 Levantar Requisitos
- Definir claramente o objetivo da feature
- Identificar endpoints de API necessários (se houver integração)
- Listar os dados que serão manipulados
- Mapear interações do usuário

### 1.2 Analisar Código Existente
```bash
# Verificar features similares para seguir padrões
ls -la src/app/
```

- Analise `src/app/distribution/` como referência de estrutura
- Observe os padrões de Server Actions em `actions.ts`
- Verifique os padrões de componentes em `page.tsx`

### 1.3 Criar Plano de Implementação
Documente:
- [ ] Nome da feature (ex: `new-feature`)
- [ ] Arquivos a serem criados
- [ ] Dependências necessárias
- [ ] Integração com sidebar (se necessário)

---

## 🏗️ Fase 2: Estrutura da Feature

### 2.1 Criar Pasta da Feature
Localização: `src/app/[nome-da-feature]/`

Estrutura obrigatória:
```plaintext
src/app/[nome-da-feature]/
├── page.tsx          # Página principal (Client Component)
├── actions.ts        # Server Actions para lógica de negócio
├── actions.test.ts   # Testes unitários das actions
└── [componentes].tsx # Componentes específicos da feature
```

### 2.2 Criar Server Actions (`actions.ts`)
```typescript
"use server";

// 1. Definir tipos para Request/Response
interface FeatureInput {
  // campos de entrada
}

interface FeatureOutput {
  // campos de saída
}

// 2. Implementar a action principal
export async function processFeature(input: FeatureInput): Promise<FeatureOutput> {
  // Validação de entrada
  // Lógica de negócio
  // Tratamento de erros
}
```

**Regras para Server Actions:**
- Sempre usar `"use server"` no topo do arquivo
- Tipar explicitamente inputs e outputs
- Tratar erros com try/catch
- Usar variáveis de ambiente via `process.env`

### 2.3 Criar Página (`page.tsx`)
```tsx
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { processFeature } from "./actions";

export default function FeaturePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const data = await processFeature(/* params */);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Nome da Feature</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Formulário e resultados */}
        </CardContent>
      </Card>
    </div>
  );
}
```

**Regras para Pages:**
- Usar `"use client"` para componentes interativos
- Importar componentes UI de `@/components/ui/`
- Gerenciar estados de loading e error
- Seguir padrão visual das outras páginas

---

## 🧩 Fase 3: Componentes UI

### 3.1 Usar Componentes Existentes
Componentes disponíveis em `src/components/ui/`:
- `Button`, `Card`, `Input`, `Label`
- `Alert`, `Badge`, `Skeleton`
- `Tooltip`, `Separator`, `Sheet`

### 3.2 Criar Componentes Específicos
Se a feature precisar de componentes próprios:
```tsx
// src/app/[feature]/feature-component.tsx
"use client";

interface FeatureComponentProps {
  // props tipadas
}

export function FeatureComponent({ prop1, prop2 }: FeatureComponentProps) {
  return (
    // JSX
  );
}
```

### 3.3 Adicionar Novos Componentes shadcn/ui
```bash
npx shadcn@latest add [nome-do-componente]
```

---

## 🔗 Fase 4: Integração com Navegação

### 4.1 Adicionar à Sidebar
Editar `src/components/app-sidebar.tsx`:
```typescript
const items = [
  // ... itens existentes
  {
    title: "Nome da Feature",
    url: "/nome-da-feature",
    icon: IconeApropriado,
  },
];
```

### 4.2 Adicionar Card na Home (Opcional)
Editar `src/app/page.tsx` se a feature precisar de destaque na home.

---

## ✅ Fase 5: Testes

### 5.1 Criar Testes Unitários (`actions.test.ts`)
```typescript
import { describe, expect, test, mock, beforeEach } from "bun:test";
import { processFeature } from "./actions";

describe("processFeature", () => {
  beforeEach(() => {
    // Setup de mocks
  });

  test("deve retornar resultado esperado", async () => {
    const result = await processFeature(/* input */);
    expect(result).toBeDefined();
    // Asserções
  });

  test("deve tratar erros corretamente", async () => {
    // Teste de cenário de erro
  });
});
```

### 5.2 Executar Testes
```bash
# Rodar testes da feature
bun test src/app/[nome-da-feature]/

# Rodar todos os testes
bun test
```

---

## 📝 Fase 6: Documentação e Revisão

### 6.1 Checklist Final
- [ ] Feature implementada e funcionando
- [ ] Testes passando
- [ ] Tipagem TypeScript completa
- [ ] Componentes seguem padrão visual
- [ ] Navegação funcionando
- [ ] Código sem erros de lint (`bun lint`)

### 6.2 Commit
```bash
git add .
git commit -m "feat: adiciona [nome-da-feature]"
```

---

## 📚 Referências Internas

- **Feature de referência**: `src/app/distribution/`
- **Componentes UI**: `src/components/ui/`
- **Utilitários**: `src/lib/`
- **Configuração shadcn**: `components.json`
