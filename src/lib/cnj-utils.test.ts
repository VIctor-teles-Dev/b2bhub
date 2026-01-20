/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { extractAndCleanCnj, formatCnj } from "./cnj-utils";

describe("CNJ Utils", () => {
  describe("extractAndCleanCnj", () => {
    test("should extract and clean a valid formatted CNJ", () => {
      const input = "Processo nº 0000000-00.0000.0.00.0000";
      const result = extractAndCleanCnj(input);
      expect(result).toBe("00000000000000000000");
    });

    test("should extract and clean a valid raw CNJ", () => {
      const input = "CNJ: 12345678901234567890";
      const result = extractAndCleanCnj(input);
      expect(result).toBe("12345678901234567890");
    });

    test("should return null for invalid length", () => {
      const input = "12345";
      const result = extractAndCleanCnj(input);
      expect(result).toBeNull();
    });

    test("should return null when no CNJ is found", () => {
      const input = "Apenas um texto sem números suficientes";
      const result = extractAndCleanCnj(input);
      expect(result).toBeNull();
    });
    
    test("should handle mixed text correctly", () => {
        const input = "O numero é 5003289-93.2024.8.24.0020 verifique";
        const result = extractAndCleanCnj(input);
        expect(result).toBe("50032899320248240020");
    });
  });

  describe("formatCnj", () => {
    test("should format a 20-digit string correctly", () => {
      const input = "00000000000000000000";
      const expected = "0000000-00.0000.0.00.0000";
      const result = formatCnj(input);
      expect(result).toBe(expected);
    });

    test("should format a real CNJ correctly", () => {
        const input = "50032899320248240020";
        const expected = "5003289-93.2024.8.24.0020";
        const result = formatCnj(input);
        expect(result).toBe(expected);
    });

    test("should return original string if not matching format regex (though extract guarantees length)", () => {
      // This case is theoretically unreachable if used after extractAndCleanCnj, but good for robustness
      const input = "123";
      const result = formatCnj(input);
      expect(result).toBe("123");
    });
  });
});
