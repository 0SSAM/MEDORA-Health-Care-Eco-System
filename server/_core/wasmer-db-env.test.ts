import { describe, expect, it } from "vitest";

describe("Wasmer managed MySQL environment", () => {
  it("maps Wasmer DB variables to DATABASE_URL", async () => {
    const original = {
      DATABASE_URL: process.env.DATABASE_URL,
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DB_NAME: process.env.DB_NAME,
      DB_USERNAME: process.env.DB_USERNAME,
      DB_PASSWORD: process.env.DB_PASSWORD,
    };

    try {
      delete process.env.DATABASE_URL;
      process.env.DB_HOST = "mysql.example.test";
      process.env.DB_PORT = "3307";
      process.env.DB_NAME = "medora_ci";
      process.env.DB_USERNAME = "ci user";
      process.env.DB_PASSWORD = "p@ss:word";

      await import(`./wasmer-db-env.ts?wasmer-test=${Date.now()}`);

      expect(process.env.DATABASE_URL).toBe(
        "mysql://ci%20user:p%40ss%3Aword@mysql.example.test:3307/medora_ci"
      );
    } finally {
      if (original.DATABASE_URL === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = original.DATABASE_URL;

      for (const [key, value] of Object.entries(original).slice(1)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    }
  });
});
