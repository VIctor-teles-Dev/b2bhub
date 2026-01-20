/// <reference types="bun-types" />
import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";
import { getRegexPatterns } from "./actions";

const originalFetch = global.fetch;

describe("Regex Validator Actions", () => {
  beforeEach(() => {
    process.env.DIGESTO_API_TOKEN = "test-token";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    mock.restore();
  });

  describe("getRegexPatterns", () => {
    test("should return regexps from array response", async () => {
      const mockResponse = ["^\\d{3}$", "^[A-Z]+$"];
      global.fetch = mock(() =>
        Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
      ) as unknown as typeof fetch;

      const result = await getRegexPatterns("1");
      expect(result.success).toBe(true);
      expect(result.regexps).toEqual(mockResponse);
    });

    test("should return regexps from object response", async () => {
      const mockResponse = { regexps: ["^\\d{3}$"] };
      global.fetch = mock(() =>
        Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
      ) as unknown as typeof fetch;

      const result = await getRegexPatterns("1");
      expect(result.success).toBe(true);
      expect(result.regexps).toEqual(["^\\d{3}$"]);
    });

    test("should handle API error", async () => {
      global.fetch = mock(() =>
        Promise.resolve(new Response("Error", { status: 500 }))
      ) as unknown as typeof fetch;

      const result = await getRegexPatterns("1");
      expect(result.success).toBe(false);
      expect(result.error).toContain("Erro ao consultar API");
    });
    });


  describe("validatePartAgainstCompanies", () => {
    const { validatePartAgainstCompanies } = require("./actions");

    test("should validate against multiple companies", async () => {
      const mockResponse1 = ["^Autor$"];
      const mockResponse2 = ["^Réu$"];

      global.fetch = mock((url: string) => {
        if (url.includes("123")) {
          return Promise.resolve(new Response(JSON.stringify(mockResponse1), { status: 200 }));
        }
        if (url.includes("456")) {
          return Promise.resolve(new Response(JSON.stringify(mockResponse2), { status: 200 }));
        }
        return Promise.resolve(new Response("Not Found", { status: 404 }));
      }) as unknown as typeof fetch;

      const results = await validatePartAgainstCompanies("Autor", ["123", "456"]);
      
      expect(results).toHaveLength(2);
      
      const result1 = results.find((r: any) => r.companyId === "123");
      expect(result1.success).toBe(true);
      expect(result1.matchedRegex).toBe("^Autor$");

      const result2 = results.find((r: any) => r.companyId === "456");
      expect(result2.success).toBe(false);
      expect(result2.error).toBe("Nenhuma correspondência encontrada.");
    });

    test("should handle API errors for specific companies", async () => {
      global.fetch = mock((url: string) => {
        if (url.includes("123")) {
          return Promise.resolve(new Response(JSON.stringify(["^Autor$"]), { status: 200 }));
        }
        return Promise.resolve(new Response("Error", { status: 500 }));
      }) as unknown as typeof fetch;

      const results = await validatePartAgainstCompanies("Autor", ["123", "999"]);
      
      expect(results).toHaveLength(2);
      
      const result1 = results.find((r: any) => r.companyId === "123");
      expect(result1.success).toBe(true);

      const result2 = results.find((r: any) => r.companyId === "999");
      expect(result2.success).toBe(false);
      expect(result2.error).toContain("Erro ao consultar API");
    });
  });
});
