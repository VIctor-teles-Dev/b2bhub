---
description: Como criar testes unitários no projeto B2Bhub
---

# 🧪 Workflow: Criar Testes Unitários

Este workflow guia a criação de testes unitários no B2Bhub utilizando o Bun Test Runner.

---

## 📋 Pré-requisitos

- Runtime **Bun** instalado
- Familiaridade com estrutura de testes (`describe`, `test`, `expect`)
- Conhecimento de mocking para dependências externas

---

## 🔍 Fase 1: Identificar o que Testar

### 1.1 Prioridade de Testes
Ordenados por importância:

1. **Server Actions** (`actions.ts`) - Lógica de negócio crítica
2. **Utilitários** (`src/lib/`) - Funções reutilizáveis
3. **Funções de parsing/formatação** - Transformação de dados
4. **Validações** - Regras de validação

### 1.2 O que NÃO testar diretamente
- Componentes UI (use testes de integração/E2E)
- Bibliotecas externas (shadcn, React)
- Fetch API diretamente (mockar)

---

## 🏗️ Fase 2: Estrutura de Testes

### 2.1 Convenção de Nomenclatura
```plaintext
arquivo.ts       → arquivo.test.ts
actions.ts       → actions.test.ts
cnj-utils.ts     → cnj-utils.test.ts
date-utils.ts    → date-utils.test.ts
```

### 2.2 Template Base de Teste
```typescript
import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";
import { functionToTest } from "./file";

describe("functionToTest", () => {
  // Setup antes de cada teste
  beforeEach(() => {
    // Resetar mocks, estado, etc.
  });

  // Cleanup após cada teste
  afterEach(() => {
    // Limpar mocks
  });

  // Testes de sucesso
  describe("cenários de sucesso", () => {
    test("deve retornar X quando input Y", async () => {
      const result = await functionToTest(input);
      expect(result).toEqual(expectedOutput);
    });
  });

  // Testes de erro
  describe("cenários de erro", () => {
    test("deve lançar erro quando input inválido", async () => {
      expect(() => functionToTest(null)).toThrow();
    });
  });

  // Casos edge
  describe("casos edge", () => {
    test("deve lidar com array vazio", async () => {
      const result = await functionToTest([]);
      expect(result).toEqual([]);
    });
  });
});
```

---

## 🔧 Fase 3: Técnicas de Mocking

### 3.1 Mock de Fetch (para APIs)
```typescript
import { mock, beforeEach, afterEach } from "bun:test";

// Salvar referência original
const originalFetch = globalThis.fetch;

beforeEach(() => {
  // Criar mock de fetch
  globalThis.fetch = mock((url: string) => {
    // Simular resposta baseada na URL
    if (url.includes("/api/data")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: "mocked" }),
      });
    }
    
    // Resposta padrão para outras URLs
    return Promise.resolve({
      ok: false,
      status: 404,
    });
  });
});

afterEach(() => {
  // Restaurar fetch original
  globalThis.fetch = originalFetch;
});
```

### 3.2 Mock Detalhado de Fetch
```typescript
// Para testes mais específicos
globalThis.fetch = mock((url: string, options?: RequestInit) => {
  const responses: Record<string, unknown> = {
    "https://api.example.com/users/1": { id: 1, name: "John" },
    "https://api.example.com/users/2": { id: 2, name: "Jane" },
  };

  const responseData = responses[url];

  if (responseData) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(responseData),
      text: () => Promise.resolve(JSON.stringify(responseData)),
    });
  }

  return Promise.resolve({
    ok: false,
    status: 404,
    json: () => Promise.resolve({ error: "Not found" }),
  });
}) as typeof fetch;
```

### 3.3 Mock de Variáveis de Ambiente
```typescript
beforeEach(() => {
  process.env.DIGESTO_API_TOKEN = "test-token";
});

afterEach(() => {
  delete process.env.DIGESTO_API_TOKEN;
});
```

---

## 📊 Fase 4: Asserções Comuns

### 4.1 Asserções Básicas
```typescript
// Igualdade
expect(result).toBe(expected);           // Comparação estrita
expect(result).toEqual(expected);        // Comparação profunda (objetos)

// Tipos
expect(result).toBeDefined();
expect(result).toBeNull();
expect(result).toBeUndefined();

// Numéricos
expect(result).toBeGreaterThan(0);
expect(result).toBeLessThan(100);

// Strings
expect(result).toContain("substring");
expect(result).toMatch(/regex/);

// Arrays
expect(result).toHaveLength(3);
expect(result).toContain(item);

// Objetos
expect(result).toHaveProperty("key");
expect(result).toMatchObject({ partial: "match" });
```

### 4.2 Asserções de Erro
```typescript
// Função síncrona
expect(() => throwingFunction()).toThrow();
expect(() => throwingFunction()).toThrow("message");
expect(() => throwingFunction()).toThrow(ErrorClass);

// Função assíncrona
await expect(asyncThrowingFunction()).rejects.toThrow();
```

---

## 📝 Fase 5: Exemplos por Tipo

### 5.1 Teste de Server Action
```typescript
// src/app/distribution/actions.test.ts
import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";
import { getDistributionData } from "./actions";

describe("getDistributionData", () => {
  const originalFetch = globalThis.fetch;
  
  beforeEach(() => {
    process.env.DIGESTO_API_TOKEN = "test-token";
    
    globalThis.fetch = mock(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          results: [
            {
              cnj: "1234567-89.2024.8.26.0001",
              distribuicaoData: "2024-01-15",
            },
          ],
        }),
      })
    ) as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    delete process.env.DIGESTO_API_TOKEN;
  });

  test("deve retornar dados de distribuição para CNJ válido", async () => {
    const result = await getDistributionData("1234567-89.2024.8.26.0001");
    
    expect(result).toBeDefined();
    expect(result.distributions).toHaveLength(1);
    expect(result.distributions[0].cnj).toBe("1234567-89.2024.8.26.0001");
  });

  test("deve retornar array vazio para CNJ não encontrado", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ results: [] }),
      })
    ) as typeof fetch;

    const result = await getDistributionData("0000000-00.0000.0.00.0000");
    expect(result.distributions).toHaveLength(0);
  });
});
```

### 5.2 Teste de Utilitário
```typescript
// src/lib/cnj-utils.test.ts
import { describe, expect, test } from "bun:test";
import { normalizeCNJ, isValidCNJ, extractCNJParts } from "./cnj-utils";

describe("normalizeCNJ", () => {
  test("deve normalizar CNJ com pontuação", () => {
    expect(normalizeCNJ("1234567-89.2024.8.26.0001"))
      .toBe("12345678920248260001");
  });

  test("deve normalizar CNJ já sem pontuação", () => {
    expect(normalizeCNJ("12345678920248260001"))
      .toBe("12345678920248260001");
  });

  test("deve lidar com espaços", () => {
    expect(normalizeCNJ("  1234567-89.2024.8.26.0001  "))
      .toBe("12345678920248260001");
  });
});

describe("isValidCNJ", () => {
  test("deve validar CNJ correto", () => {
    expect(isValidCNJ("1234567-89.2024.8.26.0001")).toBe(true);
  });

  test("deve rejeitar CNJ inválido", () => {
    expect(isValidCNJ("123")).toBe(false);
    expect(isValidCNJ("")).toBe(false);
    expect(isValidCNJ("invalid")).toBe(false);
  });
});
```

### 5.3 Teste de Função de Data
```typescript
// src/lib/date-utils.test.ts
import { describe, expect, test } from "bun:test";
import { formatDateBR, parseISODate, compareDates } from "./date-utils";

describe("formatDateBR", () => {
  test("deve formatar data para padrão brasileiro", () => {
    const date = new Date("2024-01-15T00:00:00Z");
    expect(formatDateBR(date)).toBe("15/01/2024");
  });
});

describe("parseISODate", () => {
  test("deve parsear data ISO", () => {
    const result = parseISODate("2024-01-15");
    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2024);
  });

  test("deve retornar null para data inválida", () => {
    expect(parseISODate("invalid")).toBeNull();
  });
});

describe("compareDates", () => {
  test("deve retornar true se data1 é anterior a data2", () => {
    expect(compareDates("2024-01-10", "2024-01-15")).toBe(true);
  });
});
```

---

## ▶️ Fase 6: Executar Testes

### 6.1 Comandos
```bash
# Todos os testes
bun test

# Arquivo específico
bun test src/lib/cnj-utils.test.ts

# Diretório específico
bun test src/app/distribution/

# Com watch mode
bun test --watch

# Com cobertura (se configurado)
bun test --coverage
```

### 6.2 Interpretar Resultados
```
✓ normalizeCNJ > deve normalizar CNJ com pontuação [0.12ms]
✓ normalizeCNJ > deve normalizar CNJ já sem pontuação [0.05ms]
✗ normalizeCNJ > deve lidar com espaços [0.08ms]
  Expected: "12345678920248260001"
  Received: " 12345678920248260001"
```

---

## 📚 Checklist de Testes

- [ ] Arquivo de teste criado ao lado do arquivo testado
- [ ] Import de `bun:test` correto
- [ ] Mocks de dependências externas configurados
- [ ] Testes de cenários de sucesso
- [ ] Testes de cenários de erro
- [ ] Testes de casos edge (null, undefined, array vazio, etc.)
- [ ] Variáveis de ambiente mockadas
- [ ] Cleanup em `afterEach` quando necessário
- [ ] Todos os testes passando
- [ ] Nomes de testes descritivos em português

---

## 📚 Referências

- **Testes existentes**: `src/app/distribution/actions.test.ts`, `src/lib/cnj-utils.test.ts`
- **Documentação Bun Test**: https://bun.sh/docs/cli/test
