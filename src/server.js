import express from "express";
import http from "http";

const port = 3000;
const app = express();
const { WebSocketServer } = require("ws");

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/*", (req, res) => {
  res.redirect("/");
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws, request) => {
  // 소켓 연결됬을때
  console.log("some soket is Connected to Server");
  ws["nickname"] = "Anonymous";

  // 소켓이 끊겼을때
  ws.on("close", () => {
    console.log("Disconnected from the Brower");
  });

  // 1개의 브라우저에게서 수신
  ws.on("message", (msg) => {
    const message = JSON.parse(msg);

    switch (message.type) {
      case "new_message":
        wss.clients.forEach((soket) => {
          soket.send(`${ws.nickname}: ${message.payload}`);
        });
        break;

      case "nickname":
        ws["nickname"] = message.payload;
        break;
    }
  });

  // 1개의 브라우저에게 발신
  ws.send("Message (hello world) from server");
});

server.listen(port, () => {
  console.log(`listening ${port}`);
});
