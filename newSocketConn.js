const jwt = require("jsonwebtoken");
const WebSocket = require("ws");
const asyncHandler = require("express-async-handler");
const MessageModel = require("./models/message.model");

const webSocketConn = (server) => {
  const wss = new WebSocket.WebSocketServer({ server });

  wss.on(
    "connection",
    asyncHandler(async (connection, req) => {
      console.log("Client connected");
      // console.log("ws-1", req.headers.cookie);

      function notifyAboutOnlineUsers() {
        [...wss.clients].forEach((client) => {
          client.send(
            JSON.stringify({
              online: [...wss.clients].map((c) => ({
                userId: c.userId,
                username: c.username,
              })),
            })
          );
        });
      }

      connection.isAlive = true;

      connection.timer = setInterval(() => {
        connection.ping();
        connection.deathTimer = setTimeout(() => {
          connection.isAlive = false;
          clearInterval(connection.timer);
          connection.terminate();
          notifyAboutOnlineUsers();
          console.log("dead");
        }, 1000);
      }, 5000);

      connection.on("pong", () => {
        clearTimeout(connection.deathTimer);
      });

      // checking cookies for access-token
      const cookies = req.headers.cookie;

      if (!cookies) {
        return;
      } else {
        const cookiesArray = cookies.split(";");
        const accessCookie = cookiesArray.find((curr) =>
          curr.includes("tokenCookie=")
        );
        const token = accessCookie ? accessCookie.split("=")[1] : null;
        // console.log(token);

        if (token) {
          jwt.verify(
            token,
            process.env.ACCESS_PRIVATE_KEY,
            {},
            (err, decoded) => {
              if (err) {
                console.log(err);
                throw err;
              }
              // console.log(decoded);
              // assigning user's id and name to connection
              connection.userId = decoded.id;
              connection.username = decoded.username;
            }
          );
        }
      }

      // console.log([...wss.clients].map((c) => c.userId));
      // console.log([...wss.clients].map((c) => c.username));

      connection.on(
        "message",
        asyncHandler(async (message) => {
          const messageData = JSON.parse(message);
          // console.log(messageData);
          const { recipient, text } = messageData.messagePayload;
          if (recipient && text) {
            const messageDoc = await MessageModel.create({
              sender: connection.userId,
              recipient,
              text,
            });

            [...wss.clients]
              .filter((c) => {
                // console.log("SENDER", c.userId);
                // console.log("RECEIVER", recipient);
                // console.log("TEXT", text);
                return c.userId === recipient;
              })
              .forEach((c) =>
                c.send(
                  JSON.stringify({
                    text,
                    sender: connection.userId,
                    recipient,
                    _id: messageDoc._id,
                  })
                )
              );
          }
        })
      );

      // notify everyone about online people (when someone connects)
      notifyAboutOnlineUsers();

      // connection.on("close", () => {
      //   console.log("Client disconnected");
      // });
    })
  );
};

module.exports = webSocketConn;
