let { messageHandler } = require("./utils/message");

// console.log(__dirname + "/../public");
let path = require("path");
let http = require("http");
let socketIO = require("socket.io");
let PublicPath = path.join(__dirname, "/../public");
// console.log(PublicPath);
let express = require("express");
const { create } = require("domain");
let app = express();
let port = process.env.PORT || 3000;
let server = http.createServer(app);
let io = socketIO(server);

io.on("connection", (socket) => {
  console.log("A new user connected");

  socket.emit(
    "newMessage",
    messageHandler("Admin", "Welcome to the chat room")
  );

  socket.broadcast.emit(
    "newMessage",
    messageHandler("Admin", "Anew User joined")
  );

  socket.on("createMessage", (createMessage) => {
    // console.log("create Message:", createMessage);
    io.emit(
      "newMessage",
      messageHandler(createMessage.from, createMessage.text)
    );
    // socket.broadcast.emit("newMessage", {
    //   from: createMessage.from,
    //   text: createMessage.text,
    //   createAt: new Date().getTime(),
    // });
  });

  // socket.emit("newMessage", {
  //   from: "Mohamed",
  //   text: "Hello how are you today",
  //   createdAt: 12,
  // });

  socket.on("createEmail", (createEmail) => {
    console.log("create Email:", createEmail);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

app.use(express.static(PublicPath));
server.listen(port, () => {
  console.log(`app is listening on port : ${port}`);
});
