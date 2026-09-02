import { describe, expect, it } from "vitest";
import { configureWasmerDatabaseUrl } from "./wasmer-db-env";

describe("Wasmer managed MySQL environment", () => {
  it("maps Wasmer DB variables to DATABASE_URL", () => {
    const env = {
      DB_HOST: "mysql.example.test",
      DB_PORT: "3307",
      DB_NAME: "medora_ci",
      DB_USERNAME: "ci user",
      DB_PASSWORD: "p@ss:word",
    };

    configureWasmerDatabaseUrl(env);

    expect(env.DATABASE_URL).toBe(
      "mysql://ci%20user:p%40ss%3Aword@mysql.example.test:3307/medora_ci"
    );
  });

  it("preserves an existing DATABASE_URL", () => {
    const env = {
      DATABASE_URL: "mysql://existing.example.test/medora",
      DB_HOST: "mysql.example.test",
      DB_NAME: "ignored",
      DB_USERNAME: "ignored",
      DB_PASSWORD: "ignored",
    };

    configureWasmerDatabaseUrl(env);

    expect(env.DATABASE_URL).toBe("mysql://existing.example.test/medora");
  });
});
