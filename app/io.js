var io = require("socket.io")();

io.on("connection", function (socket) {
    socket.emit("news", {hello: "world"});
});

module.exports = io;