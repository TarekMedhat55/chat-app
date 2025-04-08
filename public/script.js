const socket = io();

const messages = document.querySelector("#messages");
const messageTemplate = document.querySelector("#message-template").innerHTML;
//options
const { name, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });
// console.log("====================================");
// console.log(name, room);
// console.log("====================================");
socket.on("message", (message) => {
  // console.log("====================================");
  // console.log(message);
  // console.log("====================================");
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm"),
  });
  messages.insertAdjacentHTML("beforeend", html);
});
document.querySelector("#message-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const message = document.querySelector("#message-input").value;

  socket.emit("sendMessage", message, (ack) => {
    console.log("Server acknowledged:", ack);
  });
  document.querySelector("#message-input").value = "";
});
socket.emit("join", { name, room });
