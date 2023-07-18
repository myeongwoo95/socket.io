# 1. 서버 셋업

##### 파일 생성

- src/server.js 생성
- .gitignore 생성
- README.MD 생성
- nodemon.json 생성
  {
  "exec": "babel-node src/server.js"
  }

- babel.config.json 생성
  {
  "presets": ["@babel/preset-env"]
  }

##### 패키지 설치

- npm i express pug ws
- npm i @babel/core @babel/cli @babel/node @babel/preset-env -D
- npm i nodemon -D

# 2. 프론트 셋업

##### Express Pug 설정

- /src/view/home.pug 생성
- app.set("view engine", "pug");
- app.set("views", \_\_dirname + "/views");
- controller 테스트
  app.get("/", (req, res) => { res.render("home"); });

##### Express static 파일 설정

- app.use("/public", express.static(\_\_dirname + "/public"));

##### nodemon이 static 수정 무시하도록 설정

- nodemon.json에 다음 추가 : "ignore": ["src/public/*"],

# 3. Websoket

- 웹소켓은 프로토콜이다. 언어와 상관없고, 브라우저-서버뿐만 아니라 서버-서버 통신도 된다.
- Websoket은 HTML5 표준이라 브라우저에는 기본적으로 내장되어있다.
- ws와 soket.io는 백에서 둘 다 설치해야하지만 클라이언트에서는 soket.io만 설치하면 된다.
- ws은 가장 기초적인 core라이브러리이고, soket.io가 Jquery같은 라이브러리이다.
- ws서버 독립적으로 구축가능하고, http + ws나 express + ws도 가능하다.
- http + ws 방식으로 구축하면 http, ws 리퀘스트 두 개를 한 포트에서 처리할 수 있다.

# 메모

- 여기서는 http서버 위에 ws 서버를 만들어서 한 포트에서 다 사용가능
  즉 두 개의 프로토콜을 다 같은 port에서 공유하고잇다.
- app.listen이랑 server.listen의 차이를 잘 모르겠음
- url은 상수로 박지말고 const ws = new WebSocket(`ws://${window.location.host}`); 이런식으로
- 데이터 통신은 무저건 String인데 JSON(String)으로 주고받는게 편하다.
- 클라이언트에서 서버로 데이터를 보낼때는 JS Object를 JSON.stringify 함수를 사용해서 String으로 변환해서 보내고
- 서버에서는 받은 데이터를 JSON.parse를 사용해서 다시 JS Object로 변환하여 사용한다.
- 서버로부터 받을때는 JSON.parse 함수를 이용해서 JSON(String)을 자바스크립트 객체(오브젝트)로 변환해서 사용한다.
- ★★★소켓을 구분하는법: 소켓은 기본적으로 객체다. 소켓에 값을 추가해줌으로써 소켓 구분할 수 있다.
<pre>

```javascript
wss.on("connection", (ws, request) => {
  // 소켓 연결됬을때
  console.log("some soket is Connected to Server");
  ws["nickname"] = "Anonymous";
});
```

</pre>

# 4. soket.io

- npm i socket.io
- soket.io는 websocket을 사용하지만, websocket을 지원하지 않으면 다른 것을 사용한다. (http long polling)
- 연결이 끊어졌을때 자동으로 재연결하는 기능을 가지고잇다.
- 방화벽이나 프록시가 있어도 동작한다.
