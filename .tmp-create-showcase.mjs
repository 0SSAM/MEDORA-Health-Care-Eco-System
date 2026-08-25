import { randomBytes, scryptSync } from 'node:crypto';

const password = `MEDORA-${randomBytes(9).toString('base64url')}-Showcase`;
const salt = randomBytes(16);
const derived = scryptSync(password, salt, 32, { N: 16384, r: 8, p: 1 });
const hash = `scrypt$16384$8$1$${salt.toString('base64url')}$${derived.toString('base64url')}`;
console.log(JSON.stringify({ password, hash }));
