const socket = io();

const welcome = document.querySelector("#welcome");
const welcome_form = welcome.querySelector("form");

const room = document.querySelector("#room");
const room_name_form = room.querySelector("#name");
const room_msg_form = room.querySelector("#message");
const room_h3 = room.querySelector("h3");
const room_ul = room.querySelector("ul");

room.hidden = true;
let roomName;

/** 화면에 메세지 추가하는 함수 */
function addMessage(message) {
  const li = document.createElement("li");
  li.innerText = message;
  room_ul.appendChild(li);
}

/** 닉네임 저장 이벤트 함수 */
function handleNicknameSubmit(event) {
  event.preventDefault();
  const input = room_name_form.querySelector("input");
  socket.emit("save_nickname", { nickname: input.value }, (data) => {
    addMessage(
      `${data.beforeNickname}에서 ${data.afterNickname}으로 변경되었습니다.`
    );
  });
}

/** 메세지 보내기 이벤트 함수 */
function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room_msg_form.querySelector("input");

  socket.emit("new_message", { msg: input.value, roomName }, (data) => {
    addMessage(`You: ${data.msg}`);
  });

  input.value = "";
}

/** 방 생성 이벤트 */
welcome_form.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = welcome_form.querySelector("input");

  socket.emit("enter_room", { roomName: input.value }, (data) => {
    welcome.hidden = true;
    room.hidden = false;
    room_h3.innerText = `방 이름: ${data.roomName}`;

    room_msg_form.addEventListener("submit", handleMessageSubmit);
    room_name_form.addEventListener("submit", handleNicknameSubmit);
  });

  roomName = input.value;
  input.value = "";
});

/** 서버에서 emit한 welcomeToMe 구현 */
socket.on("welcomeToMe", (data) => {
  addMessage(`방 이름 ${data.roomName}에 참가하였습니다.`);
});

/** 서버에서 emit한 welcomeToOthers 구현 */
socket.on("welcomeToOthers", (data) => {
  addMessage(`${data.socketNickname}님이 방에 참가하였습니다.`);
});

/** 서버에서 emit한 bye를 구현 */
socket.on("bye", (data) => {
  addMessage(`${data.socketNickname}님이 방에 떠났습니다.`);
});

/** 서버에서 emit한 new_message를 구현 */
socket.on("new_message", (data) => {
  addMessage(`${data.socketNickname}: ${data.msg}`);
});

/** 서버에서 emit한 announce_room_created를 구현 */
socket.on("change_publicRooms", (data) => {
  const ul = welcome.querySelector("ul");
  ul.innerHTML = "";

  if (data.publicRooms.length === 0) {
    ul.innerHTML = "";
    return;
  }

  data.publicRooms.forEach((publicRoom) => {
    const li = document.createElement("li");
    li.innerText = publicRoom;
    ul.append(li);
  });
});
