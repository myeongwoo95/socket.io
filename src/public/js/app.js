const socket = io();

const welcome = document.querySelector("#welcome");
const welcome_form = welcome.querySelector("form");

const room = document.querySelector("#room");
const room_form = room.querySelector("form");
const room_h3 = room.querySelector("h3");
const room_ul = room.querySelector("ul");

room.hidden = true;
let roomName;

// 화면에 메세지 추가하는 함수
function addMessage(message) {
  const li = document.createElement("li");
  li.innerText = message;
  room_ul.appendChild(li);
}

// 메세지 보내기 이벤트 함수
function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("input");

  // 굳이 프론트 데이터가 아닌 서버 데이터를 사용하는 이유는 그냥 보여주기 위해서
  socket.emit("new_message", { msg: input.value, roomName }, (data) => {
    addMessage(`You: ${data.msg}`);
  });

  input.value = "";
}

// 방 생성 이벤트
welcome_form.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = welcome_form.querySelector("input");

  // 굳이 프론트 데이터가 아닌 서버 데이터를 사용하는 이유는 그냥 보여주기 위해서
  socket.emit("enter_room", { roomName: input.value }, (data) => {
    welcome.hidden = true;
    room.hidden = false;
    room_h3.innerText = `방 이름: ${data.roomName}`;

    // room div를 보여줄 때 그때서야 room_form에 event를 달아줌
    room_form.addEventListener("submit", handleMessageSubmit);
  });

  roomName = input.value;
  input.value = "";
});

// 서버에서 emit한 welcomeToMe 구현
socket.on("welcomeToMe", (data) => {
  addMessage(`방 이름 ${data.roomName}에 참가하였습니다.`);
});

// 서버에서 emit한 welcomeToOthers 구현
socket.on("welcomeToOthers", (data) => {
  addMessage(`${data.socketId}님이 방에 참가하였습니다.`);
});

// 서버에서 emit한 bye를 구현
socket.on("bye", (data) => {
  addMessage(`${data.socketId}님이 방에 떠났습니다.`);
});

// 서버에서 emit한 new_message를 구현
socket.on("new_message", (data) => {
  addMessage(`${data.socketId}: ${data.msg}`);
});
