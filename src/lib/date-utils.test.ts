/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { parseDate, parseDateTime, isSentBeforeDistributed } from "./date-utils";

describe("Date Utils", () => {
  describe("parseDate", () => {
    test("should parse valid DD/MM/YYYY date", () => {
      const result = parseDate("15/01/2026");
      expect(result).toEqual(new Date(2026, 0, 15));
    });

    test("should return null for invalid format", () => {
      expect(parseDate("2026-01-15")).toBeNull();
      expect(parseDate("invalid")).toBeNull();
    });

    test("should return null for N/A or empty", () => {
      expect(parseDate("N/A")).toBeNull();
      expect(parseDate("")).toBeNull();
    });
  });

  describe("parseDateTime", () => {
    test("should parse date part from DD/MM/YYYY, HH:mm:ss", () => {
      const result = parseDateTime("15/01/2026, 14:30:00");
      expect(result).toEqual(new Date(2026, 0, 15));
    });

    test("should return null for N/A", () => {
      expect(parseDateTime("N/A")).toBeNull();
    });
  });

  describe("isSentBeforeDistributed", () => {
    test("should return true when sent date is before distributed date", () => {
      // Sent: 14/01, Dist: 15/01 -> True
      const sent = "14/01/2026, 10:00:00";
      const dist = "15/01/2026";
      expect(isSentBeforeDistributed(sent, dist)).toBe(true);
    });

    test("should return false when sent date is same as distributed date", () => {
      // Sent: 15/01, Dist: 15/01 -> False
      const sent = "15/01/2026, 10:00:00";
      const dist = "15/01/2026";
      expect(isSentBeforeDistributed(sent, dist)).toBe(false);
    });

    test("should return false when sent date is after distributed date", () => {
      // Sent: 16/01, Dist: 15/01 -> False
      const sent = "16/01/2026, 10:00:00";
      const dist = "15/01/2026";
      expect(isSentBeforeDistributed(sent, dist)).toBe(false);
    });

    test("should return false if any date is invalid", () => {
      expect(isSentBeforeDistributed("N/A", "15/01/2026")).toBe(false);
      expect(isSentBeforeDistributed("15/01/2026, 10:00:00", "N/A")).toBe(false);
    });
  });
});
