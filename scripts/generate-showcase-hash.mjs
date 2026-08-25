import { hashInternalPassword } from "../server/domain/internal-auth.ts";

const password = process.env.SHOWCASE_TEST_PASSWORD;
if (!password) throw new Error("SHOWCASE_TEST_PASSWORD is required");
process.stdout.write(hashInternalPassword(password));
