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
  const publicRooms = getPublicRooms();
  res.render("home", { publicRooms });
});

app.get("/*", (req, res) => {
  res.redirect("/");
});

/** Socket Server */
const server = http.createServer(app);
const wss = SocketIO(server);

function getPublicRooms() {
  const publicRooms = [];

  // const sids = wss.sockets.adapter.sids;
  // const rooms = wss.sockets.adapter.rooms;
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wss;

  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) publicRooms.push(key);
  });

  return publicRooms;
}

function getCountPublicRooms() {
  return getPublicRooms().length;
}

function getCountRoom(roomName) {
  // get(roomName)가 undefined일 경우에도 에러 없이 undefined를 반환
  return wss.sockets.adapter.rooms.get(roomName)?.size;
}

wss.on("connection", (socket) => {
  // 최초의 nickname Anonymous
  socket["nickname"] = "Anonymous";

  /** 1. 모든 이벤트를 감지 */
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });

  /** 2. disconnecting */
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit("bye", {
        socketNickname: socket.nickname,
      });
    });
  });

  /** 3. disconnect */
  socket.on("disconnect", () => {
    wss.sockets.emit("change_publicRooms", {
      publicRooms: getPublicRooms(),
    });
  });

  /** enter_room emit */
  socket.on("enter_room", (data, done) => {
    socket.join(data.roomName);

    if (socket.rooms.has(data.roomName)) {
      done({
        roomName: data.roomName,
      });
    }

    socket.emit("welcomeToMe", {
      roomName: data.roomName,
    });

    socket.to(data.roomName).emit("welcomeToOthers", {
      socketNickname: socket.nickname,
    });

    wss.sockets.emit("change_publicRooms", {
      publicRooms: getPublicRooms(),
    });
  });

  /** save_nickname emit */
  socket.on("save_nickname", (data, done) => {
    const beforeNickname = socket["nickname"];
    socket["nickname"] = data.nickname;
    done({
      beforeNickname,
      afterNickname: data.nickname,
    });
  });

  /** new_message emit */
  socket.on("new_message", (data, done) => {
    socket.to(data.roomName).emit("new_message", {
      socketNickname: socket.nickname,
      msg: data.msg,
    });

    done({ msg: data.msg });
  });
});

server.listen(port, () => {
  console.log(`listening ${port}`);
});
