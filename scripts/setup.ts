/**
 * One-shot MEDORA provisioning: boots (or reuses) the zero-setup embedded
 * MySQL database, applies migrations, and seeds the administrative account
 * and reference data — then reports where things stand. Safe to re-run.
 *
 * Usage: pnpm setup
 */
import { prepareRuntimeEnvironment, stopEmbeddedDatabase } from "../server/_core/embedded-database";

try {
  const info = await prepareRuntimeEnvironment();
  console.log("");
  console.log("MEDORA is provisioned and ready.");
  console.log(`  database mode : ${info.mode}`);
  if (info.mode === "embedded") {
    console.log(`  embedded port : ${info.port}`);
    console.log(`  data directory: ${info.dataDir}`);
  }
  console.log("  admin account : admin / admin (change MEDORA_ADMIN_USERNAME / MEDORA_ADMIN_PASSWORD to override)");
  console.log("");
  console.log("Start the application with:  pnpm dev");
} finally {
  await stopEmbeddedDatabase();
}
process.exit(0);
