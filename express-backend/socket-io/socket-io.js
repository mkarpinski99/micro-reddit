const { Server } = require('socket.io');

let io = null;


module.exports = {
  init: (server) => {
     io = new Server(server, {
      cors: {
        origin: "*",
      },
    });
  },
  emit: (url, message) => {
    io.emit(url, message);
  }
}