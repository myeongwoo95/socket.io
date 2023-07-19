# 1. soket.io

- npm i socket.io
- soket.io는 websocket을 사용하지만, websocket을 지원하지 않으면 다른 것을 사용한다. (http long polling)
- 연결이 끊어졌을때 자동으로 재연결하는 기능을 가지고잇다.
- 방화벽이나 프록시가 있어도 동작한다.
- socketIO를 설치하는 것만으로 url이 생긴다. 프론트엔드단에서는 그걸 import하여 socket.io를 사용한다 -> /socket.io/socket.io.js
- front에서 io라는 funtion이 있는데 이것이 backend socket.io와 연결해주는 함수이다. 놀라운건 그냥 이렇게만 적어주면 됨... const socket = io();
- socket.io는 웹소켓이 아니라 소켓이다.
- socket.io는 방(room) 개념이 있다.
- socket.io는 커스텀 이벤트를 마음대로 만들 수 있고, string뿐만 아니라 오브젝트도 보낼수있다. (socket.io가 string으로 알아서 바꿔줌)
- 서버가 꺼지고 웹에서 F12를 하면 계속 connection하려고 시도중임을 확인할 수 있다.
