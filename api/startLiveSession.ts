// Live sessions (WebSockets/WebRTC) are difficult to proxy perfectly via standard serverless functions.
// For Vercel, a true WebSocket proxy or edge function might be needed.
// However, since we are moving secrets to the server, we might have to re-evaluate how `startLiveSession` is done.
// If it must remain client-side for WebRTC connections, it requires a secure token exchange.
// For the purpose of removing the API key from the client bundle, we will mock or proxy the best we can.
export default function handler(req, res) {
  res.status(501).json({ error: 'Live session proxying not fully implemented in serverless yet. Requires WebSocket/WebRTC proxy.' });
}
