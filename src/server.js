/** Web Server */
import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import express from "express";

const port = 3000;
const app = express();

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  const publicRooms = getPublicRooms();
  const numOfPublicRooms = getCountPublicRooms();
  res.render("home", { publicRooms, numOfPublicRooms });
});

app.get("/*", (req, res) => {
  res.redirect("/");
});

/** Socket Server */
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["https://admin/socket.io"],
    credentials: true,
  },
});

instrument(io, {
  auth: false,

  // auth: {
  //   type: "basic",
  //   username: "admin",
  //   password: "encrypted hash...",
  // },
});

function getUsersByRoomname(roomName) {
  const users = {};
  io.sockets.adapter.rooms.get(roomName).forEach((socketId) => {
    const user = {};
    user.nickname = io.sockets.sockets.get(socketId).nickname;
    user.socketId = io.sockets.sockets.get(socketId).id;
    users[socketId] = user;
  });
  return users;
}

function getPublicRooms() {
  const publicRooms = [];

  // const sids = io.sockets.adapter.sids;
  // const rooms = io.sockets.adapter.rooms;
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = io;

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
  return io.sockets.adapter.rooms.get(roomName)?.size;
}

io.on("connection", (socket) => {
  socket["nickname"] = "Anonymous";

  /** 1. 모든 이벤트를 감지 */
  socket.onAny((event) => {
    // console.log(`Socket Event: ${event}`);
  });

  /** 2. disconnecting */
  socket.on("disconnecting", () => {
    // 소켓이 현재 참가하고 있는 모든 방에 대해 반복문
    socket.rooms.forEach((room) => {
      socket.to(room).emit("bye", {
        socketNickname: socket.nickname,
        numberOfUsersInRoom: getCountRoom(room) - 1,
        users: getUsersByRoomname(room),
        socketIdToBeDeleted: socket.id,
      });
    });
  });

  /** 3. disconnect */
  socket.on("disconnect", () => {
    io.sockets.emit("change_publicRooms", {
      publicRooms: getPublicRooms(),
    });
  });

  /** 4. enter_room emit */
  socket.on("enter_room", (data, done) => {
    socket.join(data.roomName);

    if (socket.rooms.has(data.roomName)) {
      done({
        roomName: data.roomName,
        socketId: socket.id,
        socketNickname: socket.nickname,
      });
    }

    socket.emit("welcomeToMe", {
      roomName: data.roomName,
      numberOfUsersInRoom: getCountRoom(data.roomName),
      users: getUsersByRoomname(data.roomName),
    });

    socket.to(data.roomName).emit("welcomeToOthers", {
      socketNickname: socket.nickname,
      numberOfUsersInRoom: getCountRoom(data.roomName),
      users: getUsersByRoomname(data.roomName),
    });

    io.sockets.emit("change_publicRooms", {
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
      users: getUsersByRoomname(data.roomName),
    });

    socket.to(data.roomName).emit("save_nickname", {
      users: getUsersByRoomname(data.roomName),
    });
  });

  /** new_message emit */
  socket.on("new_message", (data, done) => {
    socket.to(data.roomName).emit("new_message", {
      socketNickname: socket.nickname,
      msg: data.msg,
    });

    done({
      socketNickname: socket.nickname,
      msg: data.msg,
    });
  });
});

httpServer.listen(port, () => {
  console.log(`listening ${port}`);
});
