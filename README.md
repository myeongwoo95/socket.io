# 1. soket.io

- npm i socket.io
- soket.io는 websocket을 사용하지만, websocket을 지원하지 않으면 다른 것을 사용한다. (http long polling)
- soket.io는 연결이 끊어졌을때 자동으로 재연결하는 기능을 가지고잇다. 소켓이 연결된 상태에서 서버가 다운되면 클라이언트에서 F12로 확인가능
- soket.io는 방화벽이나 프록시가 있어도 동작한다.
- 백엔드에서 soket.io는 설치하는 것만으로 url이 생기는데(/socket.io/socket.io.js). 프론트에서는 그걸 import하여 socket.io를 설치한다.
  <pre>
  <script src="/socket.io/socket.io.js"></script>
  </pre>
- soket.io는 클라이언트에서 백엔드로 연결하는것이 굉장히 간단하다. 프론트에서 const socket = io(); 만해주면된다.
- 참고로 socket.io는 웹소켓이 아니라 소켓이다.
- socket.io는 방(room) 개념이 있다.
- 기본적으로 소켓은 자기의 소켓id와 동일한 고유한 방에 속해있다. 그리고 이 방을 private room이라고 한다.
- ★★★ socket.io는 emit기능으로 이벤트를 마음대로 만들 수 있고, 데이터도 string뿐만 아니라 오브젝트도 보낼수있다.
  (이것은 socket.io가 string으로 알아서 바꿔주는것이다.)
- ★★★ socket.io는 클라이언트가 백엔드에서 작업이 끝나고 클라이언트에서 실행되야하는 함수를 실행시킬 수 있는 trigger도 보낼 수 있다.
  심지어 이 함수는 클라이언트 정의하고 클라이언트에서 동작하지만 백엔드에서 실행시키고 파라미터도 백엔드에서 넘길수가있다.
  (함수를 마지막 argument로 보내주면된다.)
- disconnecting과 disconnect는 다르다. disconnect는 연결이 완전히 끊어졌다는 뜻이고, disconnecting과 방을 나가기전이다.
- emit 헷갈릴때가 있는데 클라이언트에서 A를 emit하면 백엔드에서 A구현해주고, 백엔드에서도 A를 emit하면 클라이언트에서도 A를 구현해줘야한다.
- 기본적으로 서버가 꺼지면 모든 room과 socket이 사라진다.
- ★★★ 소켓서버에만 국한된 이야기는 아니지만, 당연하게도 3대의 소켓서버는 같은 메모리 풀을 공유하지않는다.
  (어댑터를 변경해야함 메모리에서 -> 몽고DB, query 코드도 개발자가 직접 짜야하나? 아니면 어댑터만 변경하면 알아서 동작하는건가?)
- ★★★ 확실한건 아닌데 서버에서 done함수만 사용해도 emit함수는 만들필요가 없는듯?

##### admin 페이지

- $ npm i @socket.io/admin-ui
- 설정 (서버에서)
  <pre>
  const { instrument } = require("@socket.io/admin-ui"); 
  or 
  import { instrument } from "@socket.io/admin-ui"
  </pre>

  위처럼 instrument 가져 온 후 기존 socket.io 가져오는 코드를 변경
  <pre>
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
    // type: "basic",
    // username: "admin",
    // password: "encrypted hash...",
    // },
    });
  </pre>

- https://admin.socket.io/ 접속해서 serverURL등록 "http://localhost:3000"

##### 메서드 목록

// 소켓이 수신하는 모든 이벤트를 감지하고 처리
socket.onAny((event) => { ... })

// 클라이언에서 정의한 emit 구현
socket.on("emit_name", (data1, data2, function) => { ... })

// 방 입장
socket.join("room1");

// 방 떠나기
socket.leave("room1");

// 소켓이 속한 방 확인 (여러방에 속할 수 있고, 맨 처음에 기본적으로 소켓의 고유의 id가 방으로 하나 있고 그 방에 속해있다.)
console.log("소켓이 속한 방:", socket.rooms);

// 모든방에 메세지 보내기
ws(io).sockets.emit()

// 자신에게 메세지 보내기 (emit)

// 한 방안의 다른 소켓들에게 메세지 보내기 (emit)

// 개인 메세지 보내기 (모든 소켓은 고유의 private room을 가지고 있어서 가능)

</pre>

##### TODO 쉬운거

- 방 입장할때 닉네임 정하기 (일단 안하는 방향으로 가닥잡힘)
- 누군가 들어올때 떠낫을때 색깔 그린, 레드로 분기처리, 자기닉네임 변경은 파랑색
- removelistener도 처리도해야함

##### TODO 난이도 쫌 있는거

- 사진등록
- 귓속말

ws(io).sockets.emit()
