const socket = io();

const container = document.querySelector("#container");
const container_ul = container.querySelector("ul");

const welcome = document.querySelector("#welcome");
const welcome_form = welcome.querySelector("form");
const welcome_ul = welcome.querySelector("ul");

const room = document.querySelector("#room");
const room_name_form = room.querySelector("#name");
const room_h1 = room.querySelector("h1");
const room_h2 = room.querySelector("h2");
const room_ul = room.querySelector("ul");

const footer = document.querySelector("footer");
const footer_textarea = footer.querySelector("textarea");
const footer_a = footer.querySelector("a");

let roomName;
let nickname;
let socketId;

const who = {
  YOU: "you",
  ME: "me",
  MESSAGE: "message",
};

// 임시
container.hidden = true;
room.hidden = true;

// 채팅방 유저 목록 업데이트 함수
function updateAsideUsers(users, socketIdToBeDeleted) {
  container_ul.innerHTML = "";

  if (socketIdToBeDeleted) {
    delete users[socketIdToBeDeleted];
  }

  for (const key in users) {
    const li_string = `<li>
                      <img src="/public/img/no-profile-icon1.png" alt="" />
                      <div>
                        <h2>${users[key].nickname}</h2>
                        <h3>
                          <span class="status green"></span>
                          ${users[key].socketId}
                        </h3>
                      </div>
                    </li>`;

    const li = document.createElement("li");
    li.innerHTML = li_string;
    container_ul.appendChild(li);
  }
}

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

/** 방 클릭해서 입장하기 이벤트 */
welcome_ul.addEventListener("click", (event) => {
  event.preventDefault();
  const tagName = event.target.tagName;

  if (tagName === "BUTTON") {
    const liElement = event.target.closest("li");
    const spanElement = liElement.querySelector("span");
    const innerTextValue = spanElement.innerText;

    socket.emit("enter_room", { roomName: innerTextValue }, (data) => {
      welcome.hidden = true;
      room.hidden = false;
      container.hidden = false;

      room_name_form.addEventListener("submit", handleNicknameSubmit);
      footer_textarea.addEventListener("keydown", handleMessageSubmit);
      footer_a.addEventListener("click", handleMessageSubmit_a);

      room_name_form.querySelector("input").value = data.socketNickname;
      nickname = data.socketNickname;
      socketId = data.socketId;
    });

    roomName = innerTextValue;
  }
});

/** aside profile 클릭 이벤트(li, img) */
container_ul.addEventListener("click", (event) => {
  event.preventDefault();
  const tagName = event.target.tagName;

  if (tagName === "LI" || tagName === "H3" || tagName === "H2") {
    alert("li");
  } else {
    alert("IMG");
  }
});

/** 화면에 메세지 추가하는 함수 */
function addMessage(who, data) {
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

/** 닉네임 저장 이벤트 함수 */ handleNicknameSubmit;
function handleNicknameSubmit(event) {
  event.preventDefault();
  const input = room_name_form.querySelector("input");
  if (nickname === input.value) {
    return;
  }

  socket.emit(
    "save_nickname",
    {
      nickname: input.value,
      roomName,
    },
    (data) => {
      const msg = `${data.beforeNickname}에서 ${data.afterNickname}으로 변경되었습니다.`;
      addMessage(who.MESSAGE, msg);
      nickname = input.value;
      updateAsideUsers(data.users);
    }
  );
}

/** 메세지 보내기 이벤트 함수 (Enter) */
function handleMessageSubmit(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    const msg = footer_textarea.value;

    socket.emit(
      "new_message",
      { msg: footer_textarea.value, roomName },
      (data) => {
        addMessage(who.ME, data);
      }
    );

    footer_textarea.value = "";
  }
}

/** 메세지 보내기 이벤트 함수 (a-click) */
function handleMessageSubmit_a(event) {
  event.preventDefault();
  const msg = footer_textarea.value;

  socket.emit(
    "new_message",
    { msg: footer_textarea.value, roomName },
    (data) => {
      addMessage(who.ME, data);
    }
  );

  footer_textarea.value = "";
}

/** 방 생성 이벤트 */
welcome_form.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = welcome_form.querySelector("input");

  socket.emit("enter_room", { roomName: input.value }, (data) => {
    welcome.hidden = true;
    room.hidden = false;
    container.hidden = false;

    room_name_form.addEventListener("submit", handleNicknameSubmit);
    footer_textarea.addEventListener("keydown", handleMessageSubmit);
    footer_a.addEventListener("click", handleMessageSubmit_a);

    room_name_form.querySelector("input").value = data.socketNickname;
    nickname = data.socketNickname;
    socketId = data.socketId;
  });

  roomName = input.value;
  input.value = "";
});

// emits ##########################################################################################
/** 서버에서 emit한 welcomeToMe 구현 */
socket.on("welcomeToMe", (data) => {
  room_h1.innerText = `👋Room: ${roomName}`;
  room_h2.innerText = `👩🧑🏾👨🧓👩 Current Users: ${data.numberOfUsersInRoom}`;
  const msg = `${data.roomName}방에 참가하였습니다.`;
  addMessage(who.MESSAGE, msg);
  updateAsideUsers(data.users);
});

/** 서버에서 emit한 welcomeToOthers 구현 */
socket.on("welcomeToOthers", (data) => {
  room_h1.innerText = `👋Room: ${roomName}`;
  room_h2.innerText = `👩🧑🏾👨🧓 Current Users: ${data.numberOfUsersInRoom}`;
  const msg = `${data.socketNickname}님이 방에 참가하였습니다.`;
  addMessage(who.MESSAGE, msg);
  updateAsideUsers(data.users);
});

/** 서버에서 emit한 bye를 구현 */
socket.on("bye", (data) => {
  console.log("A: 난 두번찍어야 정상");
  room_h1.innerText = `👋Room: ${roomName}`;
  room_h2.innerText = `👩🧑🏾👨🧓 Current Users: ${data.numberOfUsersInRoom}`;
  const msg = `${data.socketNickname}님이 방에 떠났습니다.`;
  addMessage(who.MESSAGE, msg);
  updateAsideUsers(data.users, data.socketIdToBeDeleted);
});

/** 서버에서 emit한 new_message를 구현 */
socket.on("new_message", (data) => {
  addMessage(who.YOU, data);
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
    li_string = `<li>
                  <span>${publicRoom}</span>
                  <button class="w-btn w-btn-blue">Enter</button>
                </li>`;

    const li = document.createElement("li");
    li.innerHTML = li_string;
    ul.append(li);
  });
});

/** 서버에서 emit한 save_nickname 구현 */
socket.on("save_nickname", (data) => {
  updateAsideUsers(data.users);
});
