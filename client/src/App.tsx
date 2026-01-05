import { useEffect, useRef, useState } from "react";

// --- Types ---
type MessageType = "system" | "chat" | "join";

interface Message {
  type: MessageType;
  user?: string;
  message: string;
  room?: string;
  timestamp?: string;
}

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

function App() {
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  // --- WebSocket Logic ---
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socketRef.current = socket;

    socket.onopen = () => setStatus("connected");
    socket.onclose = () => setStatus("disconnected");
    socket.onerror = () => setStatus("error");

    socket.onmessage = (event) => {
      const data: Message = JSON.parse(event.data);
      const msgWithTime = {
        ...data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, msgWithTime]);
    };

    return () => socket.close();
  }, []);

  // --- Auto-scroll ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Handlers ---
  const joinRoom = () => {
    if (!room || !username || status !== "connected") return;

    // FIX: Clear previous messages before joining new room
    setMessages([]); 

    socketRef.current?.send(JSON.stringify({ type: "join", room, user: username }));
    setJoined(true);
  };

  const createAndJoin = () => {
    if (!username) return alert("Please enter a username first");
    if (status !== "connected") return;

    // Generate random 6-character room ID
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    setRoom(newRoomId);
    setMessages([]); // Clear previous
    
    // Send join request immediately with the new ID
    socketRef.current?.send(JSON.stringify({ 
      type: "join", 
      room: newRoomId, 
      user: username 
    }));
    
    setJoined(true);
  };

  const sendMessage = () => {
    if (!message.trim() || !socketRef.current) return;
    socketRef.current.send(JSON.stringify({ type: "message", room, user: username, message }));
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") action();
  };

  return (
    // Background: Pure black, clean sans-serif text
    <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-2 sm:p-6">
       <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[400px] bg-slate-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[400px] bg-slate-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      {/* Container: Simple border, minimal shadow, softer dark background */}
      <div className="w-full max-w-md h-[600px] bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Header: Minimalist with status dot */}
        <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              status === 'connected' ? 'bg-green-500' : 'bg-red-500'
            } ring-2 ring-black`} />
            <h1 className="font-semibold text-sm tracking-wide text-zinc-200">
              {joined ? room : "Join Room"}
            </h1>
          </div>
          {joined && (
             <button 
             onClick={() => {
               setJoined(false);
               setMessages([]); // FIX: Clear messages on leave
               setRoom("");     // Optional: Clear the room input field
             }}
             className="text-xs text-zinc-500 hover:text-white transition-colors"
           >
             Leave
           </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          
        {!joined ? (
            /* Join View */
            <div className="h-full flex flex-col justify-center px-8">
              <div className="text-center space-y-1 mb-8">
                <h2 className="text-2xl font-semibold text-white">Welcome</h2>
                <p className="text-sm text-zinc-500">Enter your details to connect.</p>
              </div>

              <div className="space-y-4">
                <input
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:border-white focus:outline-none transition-colors placeholder-zinc-600 text-white"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <input
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:border-white focus:outline-none transition-colors placeholder-zinc-600 text-white"
                  placeholder="Room Name (to join existing)"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, joinRoom)}
                />
                
                <button
                  onClick={joinRoom}
                  disabled={status !== "connected" || !room}
                  className="w-full bg-white text-black font-medium py-3 rounded-lg hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  Join Room
                </button>

                {/* --- New Create Room Section --- */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-800"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-zinc-950 px-2 text-zinc-500">or</span>
                  </div>
                </div>

                <button
                  onClick={createAndJoin}
                  disabled={status !== "connected" || !username}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium py-3 rounded-lg hover:bg-zinc-800 hover:text-white hover:border-zinc-700 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Create New Room
                </button>
              </div>
            </div>
          ) : (
            /* Chat View */
            <div className="h-full flex flex-col">
              
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
                {messages.length === 0 && (
                   <div className="text-center text-zinc-600 text-xs mt-10">
                     No messages yet. Say hello.
                   </div>
                )}

                {messages.map((m, i) => (
                  <div key={i}>
                    {m.type === "system" && (
                      <div className="flex justify-center">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest bg-zinc-900 px-2 py-1 rounded">
                          {m.message}
                        </span>
                      </div>
                    )}

                    {m.type === "chat" && (
                      <div className={`flex flex-col ${m.user === username ? "items-end" : "items-start"}`}>
                        <div
                          className={`max-w-[80%] px-4 py-2 text-sm rounded-2xl ${
                            m.user === username
                              ? "bg-white text-black rounded-br-sm" // Me: White bubble
                              : "bg-zinc-800 text-zinc-200 rounded-bl-sm" // Them: Dark Grey bubble
                          }`}
                        >
                          <p>{m.message}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1 px-1">
                          {m.user !== username && (
                            <span className="text-[10px] text-zinc-500 font-medium">{m.user}</span>
                          )}
                          <span className="text-[10px] text-zinc-600">{m.timestamp}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              <div className="p-4 bg-zinc-950 border-t border-zinc-800">
                <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-full border border-zinc-800 focus-within:border-zinc-600 transition-colors">
                  <input
                    className="flex-1 bg-transparent px-4 py-2 outline-none text-sm text-white placeholder-zinc-500"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, sendMessage)}
                  />
                  <button
                    onClick={sendMessage}
                    className="w-8 h-8 flex items-center justify-center bg-white text-black rounded-full hover:bg-zinc-200 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.89 28.89 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                    </svg>
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;