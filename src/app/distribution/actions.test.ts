/// <reference types="bun-types" />
import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";
import { getDistributionData, getCompanyName } from "./actions";

// Mock global fetch
const originalFetch = global.fetch;

describe("Distribution Actions", () => {
  beforeEach(() => {
    process.env.DIGESTO_API_TOKEN = "test-token";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    mock.restore();
  });

  describe("getDistributionData", () => {
    test("should return success with data when API returns items", async () => {
      const mockResponse = [
        {
          $uri: "/api/monitored_event/123",
          created_at: { $date: 1705238400000 }, // 2024-01-14
          user_company_id: 1,
          data: [{ distribuicaoData: "2024-01-10" }]
        }
      ];

      global.fetch = mock(() =>
        Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
      ) as unknown as typeof fetch;

      const result = await getDistributionData("5003289-93.2024.8.24.0020");

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0].distribution_id).toBe("123");
      expect(result.data![0].distribution_date).toBe("10/01/2024");
    });

    test("should return error when API token is missing", async () => {
      delete process.env.DIGESTO_API_TOKEN;
      const result = await getDistributionData("5003289-93.2024.8.24.0020");
      expect(result.success).toBe(false);
      expect(result.error).toBe("API token not configured");
    });

    test("should return error when API fails", async () => {
      global.fetch = mock(() =>
        Promise.resolve(new Response("Error", { status: 500 }))
      ) as unknown as typeof fetch;

      const result = await getDistributionData("5003289-93.2024.8.24.0020");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Erro ao consultar API");
    });
  });

  describe("getCompanyName", () => {
    test("should return company name on success", async () => {
      const mockResponse = { name: "Test Company" };
      global.fetch = mock(() =>
        Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
      ) as unknown as typeof fetch;

      const result = await getCompanyName(1);
      expect(result.success).toBe(true);
      expect(result.name).toBe("Test Company");
    });

    test("should return error when company not found", async () => {
      const mockResponse = {};
      global.fetch = mock(() =>
        Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
      ) as unknown as typeof fetch;

      const result = await getCompanyName(1);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Nome da empresa não encontrado");
    });
  });
});
