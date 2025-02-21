const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const portId = 8091
const server = new WebSocket.Server({ port: portId });
const clients = new Map();
let connectedClientsCount = 0;

server.on('connection', (ws) => {
  const clientId = uuidv4();
  clients.set(ws, clientId);
  connectedClientsCount++;
  console.log(`Client connected: ${clientId}`);
  // 广播当前连接的终端数给所有客户端
  broadcastClientCount();
  ws.on('message', (message) => {
    console.log(`websocket.js服务端收到来自${clientId}的消息: ${message}`);
    const reply = `${message}`;
    clients.forEach((id, client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(reply);
      }
    });
  });
  ws.on('close', () => {
    clients.delete(ws);
    connectedClientsCount--;
    console.log(`终端${clientId}断开连接`);
    broadcastClientCount();
  });
});

function broadcastClientCount() {
  const countMessage = `当前连接的终端数: ${connectedClientsCount}`;
  clients.forEach((id, client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(countMessage);
    }
  });
}

console.log(`WebSocket 服务器正在运行在 ws://localhost:${portId}`);
