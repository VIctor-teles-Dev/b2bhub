---
description: Como realizar code review no projeto B2Bhub
---

# 🔍 Workflow: Code Review

Este workflow guia o processo de revisão de código no B2Bhub, focando em qualidade, padrões e melhores práticas.

---

## 📋 Checklist de Revisão Geral

### ✅ Estrutura e Organização
- [ ] Arquivos na pasta correta segundo a estrutura do projeto
- [ ] Nomenclatura de arquivos segue o padrão (kebab-case)
- [ ] Imports organizados e usando alias `@/`
- [ ] Código sem duplicação desnecessária

### ✅ TypeScript
- [ ] Tipos explícitos em funções e parâmetros
- [ ] Interfaces bem definidas e reutilizáveis
- [ ] Sem uso de `any` (exceto quando justificado)
- [ ] Props de componentes tipadas

### ✅ React/Next.js
- [ ] `"use client"` aplicado corretamente
- [ ] `"use server"` em Server Actions
- [ ] Hooks seguem regras do React
- [ ] Estados gerenciados corretamente

### ✅ Testes
- [ ] Testes unitários para Server Actions
- [ ] Testes para funções utilitárias
- [ ] Mocks apropriados para dependências externas
- [ ] Cobertura de cenários de sucesso e erro

### ✅ Segurança
- [ ] Variáveis sensíveis em env, não hardcoded
- [ ] Validação de inputs do usuário
- [ ] Tratamento de erros sem expor detalhes internos

---

## 🔍 Fase 1: Análise de Server Actions

### 1.1 Padrão Esperado
```typescript
"use server";

// ✅ Tipos explícitos
interface InputType {
  param1: string;
  param2: number;
}

interface OutputType {
  data: SomeData[];
  error?: string;
}

// ✅ Função com tipagem completa
export async function actionName(input: InputType): Promise<OutputType> {
  // ✅ Validação de entrada
  if (!input.param1) {
    return { data: [], error: "Param1 é obrigatório" };
  }

  try {
    // ✅ Acesso seguro a env vars
    const token = process.env.API_TOKEN;
    if (!token) throw new Error("Token não configurado");

    // ✅ Fetch com tratamento de erro
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return { data: processData(data) };
  } catch (error) {
    // ✅ Logging para debug
    console.error("Error in actionName:", error);
    return { data: [], error: "Falha na operação" };
  }
}
```

### 1.2 Red Flags em Server Actions
- ❌ Falta de `"use server"`
- ❌ Sem tipagem de retorno
- ❌ Token hardcoded no código
- ❌ Sem tratamento de erro
- ❌ Expor detalhes de erro para o cliente

---

## 🔍 Fase 2: Análise de Componentes

### 2.1 Padrão Esperado
```tsx
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ✅ Props tipadas
interface ComponentProps {
  title: string;
  onAction: (id: string) => void;
  items?: Item[];
}

// ✅ Componente nomeado (não default anônimo)
export function ComponentName({ title, onAction, items = [] }: ComponentProps) {
  // ✅ Estados bem nomeados
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Handler extraído
  const handleClick = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onAction("123");
    } catch (e) {
      setError("Falha na operação");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Early return para loading/error
  if (error) {
    return <Alert variant="destructive">{error}</Alert>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* ✅ Renderização condicional clara */}
        {items.length > 0 ? (
          items.map((item) => <ItemComponent key={item.id} item={item} />)
        ) : (
          <p>Nenhum item encontrado</p>
        )}
        <Button onClick={handleClick} disabled={isLoading}>
          {isLoading ? "Carregando..." : "Ação"}
        </Button>
      </CardContent>
    </Card>
  );
}
```

### 2.2 Red Flags em Componentes
- ❌ Componente com 200+ linhas (dividir)
- ❌ Lógica de negócio no componente
- ❌ Fetch direto no componente (usar Server Action)
- ❌ Props sem tipagem
- ❌ Keys faltando em listas
- ❌ Estados não tratados (loading, error)

---

## 🔍 Fase 3: Análise de Utilitários

### 3.1 Padrão Esperado
```typescript
// src/lib/utils-name.ts

/**
 * Descrição do que a função faz
 * @param input - Descrição do parâmetro
 * @returns Descrição do retorno
 */
export function utilityFunction(input: string): string {
  // ✅ Validação de entrada
  if (!input?.trim()) {
    return "";
  }

  // ✅ Lógica clara e comentada se complexa
  return input.trim().toLowerCase();
}

// ✅ Constantes exportadas e tipadas
export const SOME_CONSTANT: number = 100;

// ✅ Regex nomeadas com comentário explicativo
/**
 * Pattern para validar CNJ
 * Formato: NNNNNNN-DD.AAAA.J.TR.OOOO
 */
export const CNJ_PATTERN = /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/;
```

### 3.2 Red Flags em Utilitários
- ❌ Funções sem tipagem
- ❌ Regex inline sem explicação
- ❌ Side effects (modificar parâmetros)
- ❌ Funções fazendo mais de uma coisa

---

## 🔍 Fase 4: Análise de Testes

### 4.1 Padrão Esperado
```typescript
import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";
import { functionToTest } from "./file";

describe("functionToTest", () => {
  // ✅ Setup/teardown para mocks
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = mock(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    );
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  // ✅ Nomes descritivos
  test("deve retornar dados quando input válido", async () => {
    const result = await functionToTest("valid-input");
    expect(result).toBeDefined();
    expect(result.data).toHaveLength(1);
  });

  // ✅ Teste de cenário de erro
  test("deve retornar erro quando API falha", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve({ ok: false, status: 500 })
    );

    const result = await functionToTest("input");
    expect(result.error).toBeDefined();
  });

  // ✅ Teste de edge case
  test("deve lidar com input vazio", async () => {
    const result = await functionToTest("");
    expect(result.data).toEqual([]);
  });
});
```

### 4.2 Red Flags em Testes
- ❌ Sem cleanup de mocks
- ❌ Apenas cenários de sucesso
- ❌ Asserções genéricas (`expect(result).toBeDefined()` sozinho)
- ❌ Nomes de teste vagos

---

## 📝 Fase 5: Feedback de Review

### 5.1 Tipos de Comentários

**🔴 Bloqueante (deve ser corrigido)**
```
🔴 BLOQUEANTE: Token de API está hardcoded no código.
Mova para variável de ambiente em process.env.
```

**🟡 Sugestão (recomendado)**
```
🟡 SUGESTÃO: Considere extrair este componente de 150 linhas
em subcomponentes menores para melhor manutenibilidade.
```

**🟢 Nitpick (opcional)**
```
🟢 NITPICK: Prefira usar `const` ao invés de `let` quando
a variável não é reatribuída.
```

### 5.2 Template de Review
```markdown
## Resumo do Review

### ✅ Pontos Positivos
- Boa tipagem TypeScript
- Server Actions bem estruturadas
- Testes abrangentes

### 🔴 Bloqueantes
1. [Descrição do problema]
   - Arquivo: `path/to/file.ts`
   - Linha: XX
   - Sugestão: [como corrigir]

### 🟡 Sugestões
1. [Descrição da melhoria]

### 🟢 Nitpicks
1. [Pequenos ajustes]

### Aprovação
- [ ] Aprovado
- [ ] Aprovado com ressalvas
- [ ] Mudanças necessárias
```

---

## ⚡ Ferramentas de Suporte

### Lint Automático
```bash
# Verificar erros de lint
bun lint

# Executar testes
bun test
```

### Verificar Build
```bash
# Garantir que compila
bun build
```

---

## 📚 Referências

- **Padrões TypeScript**: https://www.typescriptlang.org/docs/handbook/
- **Best Practices React**: https://react.dev/learn
- **Next.js App Router**: https://nextjs.org/docs/app
