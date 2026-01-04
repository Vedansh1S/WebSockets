import { WebSocketServer, WebSocket } from "ws";

interface ClientSocket extends WebSocket {
  username?: string;
  room?: string;
}

interface Message {
  type: "join" | "message";
  room?: string;
  user?: string;
  message?: string;
}

const wss = new WebSocketServer({ port: 8080 });

const rooms = new Map<string, Set<ClientSocket>>();

wss.on("connection", (socket: ClientSocket) => {
  console.log("Client connected");

  socket.on("message", raw => {
    const data: Message = JSON.parse(raw.toString());

    // join a room
    if (data.type === "join" && data.room) {
      const room = data.room;

      // remove from previous room
      if (socket.room && rooms.has(socket.room)) {
        rooms.get(socket.room)!.delete(socket);
      }

      socket.room = room;

      if (!rooms.has(room)) rooms.set(room, new Set());
      rooms.get(room)!.add(socket);

      socket.send(JSON.stringify({
        type: "system",
        message: `Joined room ${room}`
      }));
    }

    // message in room
    if (data.type === "message" && socket.room) {
      const clients = rooms.get(socket.room);
      if (!clients) return;

      for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "chat",
            user: data.user,
            message: data.message,
            room: socket.room
          }));
        }
      }
    }
  });

  socket.on("close", () => {
    if (socket.room && rooms.has(socket.room)) {
      rooms.get(socket.room)!.delete(socket);
    }
  });
});

console.log("WS server running ws://localhost:8080");