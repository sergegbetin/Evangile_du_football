import ws from "ws"

/** Node 20 lacks native WebSocket; required by @supabase/supabase-js scripts. */
export function ensureWebSocketPolyfill() {
  if (!globalThis.WebSocket) {
    globalThis.WebSocket = ws
  }
}
