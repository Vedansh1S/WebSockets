# ChatApp

A real-time chat application built with React and WebSockets. Join rooms, send messages, and chat with others in real-time.

## Features

- Real-time messaging via WebSocket
- Room-based chat system
- Username identification
- Modern dark UI with Tailwind CSS
- Responsive design

## Tech Stack

**Frontend:**
- React 19
- TypeScript
- Tailwind CSS

**Backend:**
- Node.js
- TypeScript
- WebSocket (ws)

## Getting Started


### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chatApp
```

2. Install dependencies for both client and server:

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### Running the Application

1. Start the WebSocket server:
```bash
cd server
npm run dev
```

The server will run on `ws://localhost:8080`

2. In a new terminal, start the client:
```bash
cd client
npm run dev
```

### Usage

1. Open the application in your browser
2. Enter your username and a room name
3. Click "Start Chatting" to join the room
4. Start sending messages!



## Project Structure

```
chatApp/
├── client/          # React frontend application
│   ├── src/
│   │   ├── App.tsx  # Main application component
│   │   └── ...
│   └── package.json
└── server/          # WebSocket server
    ├── src/
    │   └── server.ts # WebSocket server implementation
    └── package.json
```