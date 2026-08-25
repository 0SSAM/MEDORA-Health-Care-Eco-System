import { randomBytes, scryptSync } from 'node:crypto';
const password = process.env.SHOWCASE_TEST_PASSWORD;
if (!password) throw new Error('SHOWCASE_TEST_PASSWORD is required');
const salt = randomBytes(16);
const derived = scryptSync(password, salt, 32, { N: 16384, r: 8, p: 1 });
console.log(`scrypt$16384$8$1$${salt.toString('base64url')}$${derived.toString('base64url')}`);
