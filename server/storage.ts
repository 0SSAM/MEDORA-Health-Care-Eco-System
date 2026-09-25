/**
 * Object storage helper for server-side uploads.
 *
 * MEDORA keeps object storage optional: when S3 credentials are configured
 * the generated/uploaded object is persisted to the bucket and a durable URL
 * is returned. Without credentials the caller receives a fail-closed error so
 * that flows never pretend an object was stored when it was not.
 *
 * Keys are sanitized before use: no traversal segments, no control
 * characters, and a bounded length.
 */
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const MAX_KEY_LENGTH = 512;

function isSafeKey(key: string): boolean {
  return (
    key.length > 0 &&
    key.length <= MAX_KEY_LENGTH &&
    !/[\\\0\r\n]/.test(key) &&
    !key.split("/").some(segment => segment === ".." || segment === ".")
  );
}

function s3Configured(): boolean {
  return Boolean(
    process.env.S3_ENDPOINT &&
      process.env.S3_BUCKET_NAME &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY
  );
}

let cachedClient: S3Client | null = null;

function getS3Client(): S3Client {
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: process.env.S3_REGION || "auto",
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
      },
    });
  }
  return cachedClient;
}

export type StoragePutResult = {
  /** Durable URL that can be handed to clients for download/display. */
  url: string;
  /** The sanitized storage key the object was written to. */
  key: string;
};

export async function storagePut(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<StoragePutResult> {
  if (!isSafeKey(key)) {
    throw new Error("Invalid storage key");
  }
  if (!s3Configured()) {
    throw new Error(
      "Object storage is not configured (S3_ENDPOINT, S3_BUCKET_NAME, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY)"
    );
  }

  const client = getS3Client();
  const bucket = process.env.S3_BUCKET_NAME as string;
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType || "application/octet-stream",
    })
  );

  const endpoint = (process.env.S3_ENDPOINT as string).replace(/\/+$/, "");
  const url = `${endpoint}/${bucket}/${key
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
  return { url, key };
}

/**
 * Mint a short-lived signed GET URL for a stored object. Fail-closed: throws
 * when storage is not configured or the key is unsafe so callers never fall
 * back to a publicly reachable URL by accident.
 */
export async function storageGetSignedUrl(
  key: string,
  expiresInSeconds = 900
): Promise<string> {
  if (!isSafeKey(key)) {
    throw new Error("Invalid storage key");
  }
  if (!s3Configured()) {
    throw new Error(
      "Object storage is not configured (S3_ENDPOINT, S3_BUCKET_NAME, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY)"
    );
  }

  const client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME as string,
    Key: key,
  });
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

export const storageInternals = { isSafeKey, s3Configured };
