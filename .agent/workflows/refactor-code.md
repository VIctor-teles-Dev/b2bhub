
---
description: Como refatorar código do projeto B2Bhub
---

# 🔄 Workflow: Refatorar Código

Este workflow guia o processo de refatoração de código existente no B2Bhub, mantendo qualidade e evitando regressões.

---

## 📋 Princípios de Refatoração

1. **Pequenas alterações incrementais** - Evite grandes mudanças de uma vez
2. **Testes primeiro** - Garanta que existem testes antes de refatorar
3. **Sem mudança de comportamento** - Refatoração não altera funcionalidade
4. **Commits frequentes** - Commite a cada melhoria significativa

---

## 🔍 Fase 1: Análise do Código Atual

### 1.1 Identificar Problemas (Code Smells)
Problemas comuns a serem identificados:

| Code Smell | Descrição | Solução |
|------------|-----------|---------|
| Arquivo muito grande | Arquivo com 500+ linhas | Dividir em módulos |
| Função longa | Função com 50+ linhas | Extrair funções |
| Regex inline | Regex complexa sem explicação | Criar constantes nomeadas |
| Tipos implícitos | Falta de tipagem | Adicionar interfaces |
| Código duplicado | Lógica repetida | Extrair para utilitário |
| Componente grande | Componente com múltiplas responsabilidades | Dividir em subcomponentes |
| Aninhamento excessivo | Muitos níveis de if/else | Early return pattern |

### 1.2 Mapear Dependências
```bash
# Verificar onde o arquivo é importado
grep -r "import.*from.*[arquivo]" src/
```

### 1.3 Verificar Cobertura de Testes
```bash
# Verificar se existem testes
ls src/app/[feature]/*.test.ts
ls src/lib/*.test.ts
```

---

## 🏗️ Fase 2: Preparação

### 2.1 Garantir Testes Existentes
Se não houver testes, **crie antes de refatorar**:
```typescript
// Criar teste que capture comportamento atual
import { describe, expect, test } from "bun:test";
import { functionToRefactor } from "./file";

describe("functionToRefactor", () => {
  test("comportamento atual documentado", async () => {
    const result = await functionToRefactor(input);
    expect(result).toMatchSnapshot(); // ou asserções específicas
  });
});
```

### 2.2 Rodar Testes Antes
```bash
bun test
```
Todos os testes devem passar antes de iniciar.

---

## 🔧 Fase 3: Padrões de Refatoração

### 3.1 Extrair Tipos e Interfaces
**Antes:**
```typescript
async function getData(id: string): Promise<{ name: string; date: Date; items: { id: number; value: string }[] }> {
  // ...
}
```

**Depois:**
```typescript
interface DataItem {
  id: number;
  value: string;
}

interface DataResponse {
  name: string;
  date: Date;
  items: DataItem[];
}

async function getData(id: string): Promise<DataResponse> {
  // ...
}
```

### 3.2 Extrair Regex para Constantes
**Antes:**
```typescript
const match = text.match(/^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/);
```

**Depois:**
```typescript
// Em src/lib/cnj-utils.ts
export const CNJ_PATTERN = /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/;

/**
 * Valida formato CNJ
 * Formato: NNNNNNN-DD.AAAA.J.TR.OOOO
 */
export function isValidCNJ(input: string): boolean {
  return CNJ_PATTERN.test(input);
}
```

### 3.3 Extrair Lógica de Datas
**Antes:**
```typescript
const formatted = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
```

**Depois:**
```typescript
// Em src/lib/date-utils.ts
export function formatDateBR(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}
```

### 3.4 Dividir Componentes Grandes
**Antes:**
```tsx
export default function FeaturePage() {
  // 300 linhas com múltiplas responsabilidades
}
```

**Depois:**
```tsx
// feature-form.tsx
export function FeatureForm({ onSubmit }: FeatureFormProps) { /* ... */ }

// feature-results.tsx
export function FeatureResults({ data }: FeatureResultsProps) { /* ... */ }

// page.tsx
export default function FeaturePage() {
  return (
    <>
      <FeatureForm onSubmit={handleSubmit} />
      <FeatureResults data={results} />
    </>
  );
}
```

### 3.5 Aplicar Early Return
**Antes:**
```typescript
function process(data: Data | null) {
  if (data) {
    if (data.isValid) {
      if (data.items.length > 0) {
        return data.items.map(/* ... */);
      } else {
        return [];
      }
    } else {
      throw new Error("Invalid");
    }
  } else {
    return null;
  }
}
```

**Depois:**
```typescript
function process(data: Data | null) {
  if (!data) return null;
  if (!data.isValid) throw new Error("Invalid");
  if (data.items.length === 0) return [];
  
  return data.items.map(/* ... */);
}
```

---

## ✅ Fase 4: Validação

### 4.1 Rodar Testes Após Cada Mudança
```bash
bun test
```

### 4.2 Verificar Lint
```bash
bun lint
```

### 4.3 Verificar Build
```bash
bun build
```

### 4.4 Teste Manual
- Verificar no browser que a funcionalidade continua igual
- Testar casos edge

---

## 📝 Fase 5: Documentação

### 5.1 Atualizar Comentários
Adicione comentários explicativos para lógicas complexas:
```typescript
/**
 * Extrai o ID da empresa do formato "COMP-XXXX-YY"
 * onde XXXX é o ID numérico e YY é a região
 */
export function extractCompanyId(raw: string): number {
  // ...
}
```

### 5.2 Commit Semântico
```bash
git commit -m "refactor: extrai utilitários de data para date-utils.ts"
```

---

## 📚 Checklist de Refatoração

- [ ] Testes existem antes da refatoração
- [ ] Testes passando após cada alteração
- [ ] Tipos TypeScript explícitos
- [ ] Funções com responsabilidade única
- [ ] Código duplicado removido
- [ ] Nomes descritivos para variáveis e funções
- [ ] Comentários em lógicas complexas
- [ ] Lint passando
- [ ] Build funcionando
- [ ] Teste manual realizado

---

## 📚 Referências

- **Utilitários existentes**: `src/lib/`
- **Padrão de Server Actions**: `src/app/distribution/actions.ts`
- **Padrão de testes**: `src/app/distribution/actions.test.ts`
