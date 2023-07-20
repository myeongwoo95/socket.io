/** Web Server */
import express from "express";
import http from "http";
import SocketIO from "socket.io";

const port = 3000;
const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/*", (req, res) => {
  res.redirect("/");
});

/** Socket Server */
const server = http.createServer(app);
const wss = SocketIO(server);

wss.on("connection", (socket) => {
  // 메서드 목록
  /**
   * // 소켓이 수신하는 모든 이벤트를 감지하고 처리
   * socket.onAny((event) => { ... }
   *
   * // 클라이언에서 정의한 emit 구현
   *  socket.on("emit_name", (data1, data2, function) => { ... }
   *
   * // 방 입장
   * socket.join("room1");
   *
   * // 방 떠나기
   * socket.leave("room1");
   *
   * // 소켓이 속한 방 확인 (여러방에 속할 수 있고, 맨 처음에 기본적으로 소켓의 고유의 id가 방으로 하나 있고 그 방에 속해있다.)
   * console.log("소켓이 속한 방:", socket.rooms);
   *
   * // 자신에게 메세지 보내기 (클라이언트에서 구현할 필요없음)
   *
   * // 한 방안의 다른 소켓들에게 메세지 보내기 (클라이언트에서 구현해야함)
   *
   * // 개인 메세지 보내기 (소켓ID를 알아야함)
   *
   * // uuid를 제외한 모든 방을 알 필요가 있음, 방목록으로 보여줘야하기 때문 근데 db와 연결할필요는없궁...
   */

  // 1. 소켓이 수신하는 모든 이벤트를 감지하고 처리
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });

  // 2. 방 접속 emit
  socket.on("enter_room", (data, done) => {
    // 방 입장
    socket.join(data.roomName);

    // 방에 정상적으로 입장 되었다면 프론트에서 채팅방 div show
    if (socket.rooms.has(data.roomName)) {
      done({
        roomName: data.roomName,
      });
    }

    // 자신에게 메시지 보내기 (다른 사람한테는 보내지않음)
    socket.emit("welcomeToMe", {
      roomName: data.roomName,
    });

    // 특정 방의 다른 클라이언트들에게 메시지 보내기 (나한테는 보내지않음)
    // 물론 여러방에 메세지를 보낼 수 도 있음.
    socket.to(data.roomName).emit("welcomeToOthers", {
      socketId: socket.id,
    });
  });

  // 3. 메세지 보내기
  socket.on("new_message", (data, done) => {
    // 보낸이는 제외하고 특정 방에 있는 모든 사람에게 보냄
    socket.to(data.roomName).emit("new_message", {
      socketId: socket.id,
      msg: data.msg,
    });

    // 보낸이 자신한테 전달되는 callback?
    done({
      msg: data.msg,
    });
  });

  // 4. disconnecting
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit("bye", {
        socketId: socket.id,
      });
    });
  });
});

server.listen(port, () => {
  console.log(`listening ${port}`);
});
