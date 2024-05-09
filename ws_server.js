const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const uuidv4 = require("uuid").v4;

const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

app.use(express.static("../client_1"));

const wss = new WebSocket.WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  const clientId = uuidv4();
  ws.id = clientId;

  console.log(`Client connected with ID: ${clientId}`);

  ws.on("message", (message) => {
    console.log(`Received from client ${clientId} => ${message.toString()}`);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        // console.log(client)
        if (ws !== client) {
          client.send(
            JSON.stringify({
              clientId,
              message: message.toString(),
              flag: false,
            })
          );
        } else {
          client.send(
            JSON.stringify({
              clientId,
              message: message.toString(),
              flag: true,
            })
          );
        }
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
