import { clearStoredSessionAuth } from "@/lib/sessionAuth";

type QueryCacheController = {
  clear: () => void;
};

/**
 * Removes browser-memory data associated with the account that was active
 * before an internal authentication boundary. The server remains the source
 * of truth for authorization; this prevents an earlier account's cached
 * records or error states from being rendered to the next account.
 */
export function resetIdentityBoundClientState(queryClient: QueryCacheController) {
  clearStoredSessionAuth();
  queryClient.clear();
}
