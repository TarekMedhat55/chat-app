const users = [];

const addUser = ({ id, name, room }) => {
  // Clean the data
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validate the data
  if (!name || !room) {
    return {
      error: "Username and room are required!",
    };
  }

  // Check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.name === name;
  });

  // Validate username
  if (existingUser) {
    return {
      error: "Username is already taken!",
    };
  }

  // Store user
  const user = { id, name, room };
  users.push(user);
  return { user };
};
const removeUser = (id) => {
  // Find the user
  const index = users.findIndex((user) => user.id === id);

  // If not found, return undefined
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};
const getUser = (id) => {
  // Find the user
  const user = users.find((user) => user.id === id);

  // If not found, return undefined
  if (user) {
    return user;
  }
};
const getUsersInRoom = (room) => {
  // Return users in the room
  return users.filter((user) => user.room === room);
};

export { addUser, removeUser, getUser, getUsersInRoom };
