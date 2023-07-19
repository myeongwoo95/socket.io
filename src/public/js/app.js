const socket = io();

const welcome = document.querySelector("#welcome");
const form = welcome.querySelector("form");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = form.querySelector("input");
  // 서버에 발신
  socket.emit(
    "enter_room",
    { payload: input.value },
    "hello",
    1995,
    6,
    16,
    // 이 함수는 server에서 실행되는게 아니다. (보안적으로 서버에서 실행되는건 말이안됨)
    // 서버에서 함수를 동작시키는건 맞지만 실제로 실행되는건 클라이언트이다.
    () => {
      console.log("Server is done");
    }
  );
  input.value = "";
});
