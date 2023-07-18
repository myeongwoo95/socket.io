const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message");
const nickForm = document.querySelector("#nick");
const ws = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload) {
  const msg = { type, payload };
  return JSON.stringify(msg);
}

// 소켓이 연결되었을 때
ws.addEventListener("open", () => {
  console.log("Connected to Server");
});

// 소켓이 서버로부터 끊꼈을 때
ws.addEventListener("close", () => {
  console.log("Disconnected from the Server");
});

// 서버로부터 데이터 수신
ws.addEventListener("message", (message) => {
  const li = document.createElement("li");
  li.innerText = message.data;
  messageList.append(li);
});

// 데이터 발신
messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  ws.send(makeMessage("new_message", input.value));

  const li = document.createElement("li");
  li.innerText = `You: ${input.value}`;
  messageList.append(li);

  input.value = "";
});

nickForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = nickForm.querySelector("input");
  ws.send(makeMessage("nickname", input.value));
  alert(`닉네임이 ${input.value}로 변경되었습니다.`);
});
