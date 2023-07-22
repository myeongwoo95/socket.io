const socket = io();

const container = document.querySelector("#container");

const welcome = document.querySelector("#welcome");
const welcome_form = welcome.querySelector("form");

const room = document.querySelector("#room");
const room_name_form = room.querySelector("#name");
const room_msg_form = room.querySelector("#message");
const room_h3 = room.querySelector("h3");
const room_ul = room.querySelector("ul");

const footer = document.querySelector("footer");
const footer_textarea = footer.querySelector("textarea");
const footer_a = footer.querySelector("a");

let roomName;

const who = {
  YOU: "you",
  ME: "me",
  MESSAGE: "message",
};

// 임시
// container.hidden = true;
room.hidden = true;

/** 현재 시간 구하는 함수 */
function getTimes() {
  const now = new Date();
  const year = now.getFullYear();
  const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(now);
  const date = now.getDate();
  const currentTime = `${now.getHours() % 12 || 12}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")} ${now.getHours() >= 12 ? "PM" : "AM"}`;

  return {
    year,
    month,
    date,
    currentTime,
  };
}

/** (구)화면에 메세지 추가하는 함수 */
function addMessage(message) {
  const li = document.createElement("li");
  li.innerText = message;
  room_ul.appendChild(li);
}

/** (new)화면에 메세지 추가하는 함수 */
function addMessage2(who, data) {
  if (who !== "you" && who !== "me" && who !== "message") {
    console.log(
      'Invalid value for "who". It should be either "you" or "me" or "message'
    );
    return;
  }

  let li_string = "";
  const { year, month, date, currentTime } = getTimes();

  if (who === "you") {
    li_string = `<li class="${who}">
                  <div class="entete">
                    <h2>${
                      who === "me"
                        ? `You (${data.socketNickname})`
                        : `${data.socketNickname}`
                    } </h2>
                    <h3>${currentTime}, ${date} ${month} ${year}</h3>
                    <span class="status ${
                      who === "you" ? "green" : "blue"
                    }"></span>
                  </div>

                  <div class="triangle"></div>
                  
                  <div class="message">
                    ${data.msg}
                  </div>
                </li>`;
  } else if (who === "me") {
    li_string = `<li class="${who}">
                  <div class="entete">
                    <h3>${currentTime}, ${date} ${month} ${year}</h3>
                    <h2>${
                      who === "me"
                        ? `You (${data.socketNickname})`
                        : `${data.socketNickname}`
                    } </h2>
                    <span class="status ${
                      who === "you" ? "green" : "blue"
                    }"></span>
                  </div>

                  <div class="triangle"></div>
                  
                  <div class="message">
                    ${data.msg}
                  </div>
                </li>`;
  } else {
    li_string = `<li style="text-align: center">
                  <div class="entete">
                    <span class="status orange"></span>
                    <h2>${data}</h2>
                  </div>
                </li>`;
  }

  const ul = document.querySelector("#chat");
  const li = document.createElement("li");
  li.innerHTML = li_string;
  ul.appendChild(li);
  ul.scrollTop = ul.scrollHeight;
}

/** 닉네임 저장 이벤트 함수 */
function handleNicknameSubmit(event) {
  event.preventDefault();
  const input = room_name_form.querySelector("input");
  socket.emit("save_nickname", { nickname: input.value }, (data) => {
    addMessage(
      `${data.beforeNickname}에서 ${data.afterNickname}으로 변경되었습니다.`
    );
    addMessage2(who.NICKNAME, data);
  });
}

/** (NEW)메세지 보내기 이벤트 함수*/
function handleMessageSubmit(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    const msg = footer_textarea.value;
    console.log(msg);

    socket.emit(
      "new_message",
      { msg: footer_textarea.value, roomName },
      (data) => {
        addMessage2(who.ME, data);
      }
    );

    footer_textarea.value = "";
  }
}

footer_textarea.addEventListener("keydown", handleMessageSubmit1);
//footer_a.addEventListener("click", handleMessageSubmit2);

/** 방 생성 이벤트 */
welcome_form.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = welcome_form.querySelector("input");

  socket.emit("enter_room", { roomName: input.value }, (data) => {
    welcome.hidden = true;
    room.hidden = false;
    container.hidden = false;
    room_h3.innerText = `방 이름: ${data.roomName}`;

    //room_msg_form.addEventListener("submit", handleMessageSubmit);
    room_name_form.addEventListener("submit", handleNicknameSubmit);
  });

  roomName = input.value;
  input.value = "";
});

/** 서버에서 emit한 welcomeToMe 구현 */
socket.on("welcomeToMe", (data) => {
  room_h3.innerText = `방 이름: ${roomName} (현재 방 인원 수: ${data.numberOfUsersInRoom})`;
  const msg = `${data.roomName}방에 참가하였습니다.`;
  addMessage(msg);
  addMessage2(who.MESSAGE, msg);
});

/** 서버에서 emit한 welcomeToOthers 구현 */
socket.on("welcomeToOthers", (data) => {
  room_h3.innerText = `방 이름: ${roomName} (현재 방 인원 수: ${data.numberOfUsersInRoom})`;
  const msg = `${data.socketNickname}님이 방에 참가하였습니다.`;
  addMessage(msg);
  addMessage2(who.MESSAGE, msg);
});

/** 서버에서 emit한 bye를 구현 */
socket.on("bye", (data) => {
  room_h3.innerText = `방 이름: ${roomName} (현재 방 인원 수: ${data.numberOfUsersInRoom})`;
  const msg = `${data.socketNickname}님이 방에 떠났습니다.`;
  addMessage(msg);
  addMessage2(who.MESSAGE, msg);
});

/** 서버에서 emit한 new_message를 구현 */
socket.on("new_message", (data) => {
  addMessage(`${data.socketNickname}: ${data.msg}`);
  addMessage2(who.YOU, data);
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

function getTime() {}
