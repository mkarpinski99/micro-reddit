const io = require("socket.io-client")("ws://" + location.hostname + ":" + "3000", {
reconnection: true,
  reconnectionDelay: 500,
  reconnectionAttempts: 10,
});

io.connect();


export default io;
