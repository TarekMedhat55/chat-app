const socket = io();
document.querySelector("#increment").addEventListener("click", () => {
  socket.emit("increment");
});
document.querySelector("#decrement").addEventListener("click", () => {
  socket.emit("decrement");
});
document.querySelector("#reset").addEventListener("click", () => {
  socket.emit("reset");
});

socket.on("countUpdated", (count) => {
  document.querySelector("#counter").innerText = count;
});
