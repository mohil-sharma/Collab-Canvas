
import { useEffect, useState, useCallback, useRef } from "react";
import { ReconnectionManager, getWebSocketUrl, ConnectionType } from "./realtime";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";

// Define our state types
export type CursorPosition = {
  x: number;
  y: number;
};

export type User = {
  id: string;
  name: string;
  color: string;
  cursor: CursorPosition | null;
  isAuthenticated: boolean;
};

export type Shape = {
  id: string;
  type: "rectangle" | "circle" | "line";
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  points?: { x: number; y: number }[];
  color: string;
  userId: string;
};

export type Room = {
  id: string;
  code: string;
  name: string;
  userCount: number;
  createdBy: string | null;
};

// Message types for our WebSocket
export type ServerMessage =
  | { type: "users"; users: User[] }
  | { type: "user-joined"; user: User }
  | { type: "user-left"; userId: string }
  | { type: "cursor-move"; userId: string; position: CursorPosition }
  | { type: "add-shape"; shape: Shape }
  | { type: "shapes"; shapes: Shape[] }
  | { type: "room-joined"; room: Room }
  | { type: "error"; message: string };

export type ClientMessage =
  | { type: "join"; name: string; roomCode: string; connectionType: ConnectionType; userId?: string }
  | { type: "cursor-move"; position: CursorPosition }
  | { type: "add-shape"; shape: Omit<Shape, "id" | "userId"> };

// Implementation that can switch between real WebSocket and MockWebSocket
export const useSocketConnection = () => {
  const [socket, setSocket] = useState<WebSocket | MockWebSocket | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const reconnectManager = useRef(new ReconnectionManager());
  const { user: clerkUser } = useUser();
  
  // Track if we should use real WebSockets or mock
  const useMockSocket = typeof window !== 'undefined' && 
    !import.meta.env.VITE_WEBSOCKET_URL && 
    window.location.hostname === 'localhost';

  // Close socket on unmount or when creating a new one
  const closeSocket = useCallback(() => {
    if (socket) {
      socket.close();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  // Create a new WebSocket connection
  const createSocketConnection = useCallback((roomCode: string) => {
    closeSocket();
    
    let newSocket: WebSocket | MockWebSocket;
    
    if (useMockSocket) {
      console.log("Using mock WebSocket for development");
      newSocket = MockWebSocket.getInstance();
    } else {
      console.log(`Creating real WebSocket connection to room: ${roomCode}`);
      newSocket = new WebSocket(getWebSocketUrl(roomCode));
    }
    
    newSocket.addEventListener("open", () => {
      console.log("Socket connection opened");
      setIsConnected(true);
      reconnectManager.current.reset();
    });
    
    newSocket.addEventListener("message", (event) => {
      try {
        const message = JSON.parse(event.data) as ServerMessage;
        handleServerMessage(message);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    });
    
    newSocket.addEventListener("close", (event) => {
      console.log(`Socket connection closed: ${event.code}`);
      setIsConnected(false);
      
      // Attempt to reconnect unless this was a normal closure
      if (event.code !== 1000) {
        const delay = reconnectManager.current.getNextDelay();
        if (delay > 0) {
          toast.error("Connection lost. Reconnecting...");
          setTimeout(() => createSocketConnection(roomCode), delay);
        } else {
          toast.error("Connection lost. Please reload the page to reconnect.");
        }
      }
    });
    
    newSocket.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
      toast.error("Connection error. Please try again.");
    });
    
    setSocket(newSocket);
    return newSocket;
  }, [closeSocket, useMockSocket]);

  // Handle server messages
  const handleServerMessage = useCallback((message: ServerMessage) => {
    switch (message.type) {
      case "users":
        setUsers(message.users.filter(u => u.id !== currentUser?.id));
        break;

      case "user-joined":
        if (message.user.id !== currentUser?.id) {
          setUsers(prev => [...prev, message.user]);
          toast.success(`${message.user.name} joined the room`);
        }
        break;

      case "user-left":
        setUsers(prev => {
          const userLeaving = prev.find(u => u.id === message.userId);
          if (userLeaving) {
            toast.info(`${userLeaving.name} left the room`);
          }
          return prev.filter(user => user.id !== message.userId);
        });
        break;

      case "cursor-move":
        setUsers(prev =>
          prev.map(user =>
            user.id === message.userId
              ? { ...user, cursor: message.position }
              : user
          )
        );
        break;

      case "shapes":
        setShapes(message.shapes);
        break;

      case "add-shape":
        setShapes(prev => [...prev, message.shape]);
        break;
        
      case "room-joined":
        setCurrentRoom(message.room);
        toast.success(`Joined room: ${message.room.name || message.room.code}`);
        break;
        
      case "error":
        toast.error(message.message);
        break;

      default:
        console.log("Unknown message type:", message);
    }
  }, [currentUser?.id]);

  // Join a room
  const joinRoom = useCallback((name: string, roomCode: string, connectionType: ConnectionType = "anonymous") => {
    const newSocket = createSocketConnection(roomCode);
    
    if (newSocket) {
      const connectionData: ClientMessage = {
        type: "join",
        name,
        roomCode,
        connectionType,
        userId: connectionType === "authenticated" ? clerkUser?.id : undefined
      };
      
      // Allow socket time to connect
      setTimeout(() => {
        if (newSocket.readyState === WebSocket.OPEN || (useMockSocket && newSocket instanceof MockWebSocket)) {
          newSocket.send(JSON.stringify(connectionData));
          
          // Set current user after joining
          const newUserId = connectionType === "authenticated" && clerkUser?.id 
            ? clerkUser.id 
            : `anon-${Math.random().toString(36).substring(2, 10)}`;
            
          setCurrentUser({
            id: newUserId,
            name,
            color: getRandomColor(),
            cursor: null,
            isAuthenticated: connectionType === "authenticated"
          });
        }
      }, 500);
    }
  }, [createSocketConnection, clerkUser?.id, useMockSocket]);

  // Helper to generate a random color
  const getRandomColor = () => {
    const colors = [
      "#3B82F6", // blue
      "#10B981", // emerald
      "#F59E0B", // amber
      "#EF4444", // red
      "#8B5CF6", // violet
      "#EC4899", // pink
      "#06B6D4", // cyan
      "#F97316", // orange
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Update cursor position
  const updateCursor = useCallback((position: CursorPosition) => {
    if (socket && isConnected) {
      socket.send(
        JSON.stringify({
          type: "cursor-move",
          position,
        })
      );
    }
  }, [socket, isConnected]);

  // Add a shape to the canvas
  const addShape = useCallback((shape: Omit<Shape, "id" | "userId">) => {
    if (socket && isConnected) {
      socket.send(
        JSON.stringify({
          type: "add-shape",
          shape,
        })
      );
    }
  }, [socket, isConnected]);

  // Create a new room
  const createRoom = useCallback((name: string) => {
    joinRoom(name, "CREATE", clerkUser ? "authenticated" : "anonymous");
  }, [joinRoom, clerkUser]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      closeSocket();
    };
  }, [closeSocket]);

  return {
    currentUser,
    users,
    shapes,
    isConnected,
    currentRoom,
    joinRoom,
    updateCursor,
    addShape,
    createRoom,
  };
};

// ----------------------------------------------------------------------------
// Mock WebSocket implementation for development without a backend
// ----------------------------------------------------------------------------
export class MockWebSocket {
  private listeners: Record<string, ((event: any) => void)[]> = {};
  private static instance: MockWebSocket | null = null;
  private users: User[] = [];
  private shapes: Shape[] = [];
  private rooms: Map<string, Room> = new Map();
  private nextUserId = 1;
  private nextShapeId = 1;
  private connectionDelay = 300;
  private currentRoomCode: string | null = null;

  // Singleton pattern to ensure all components use the same mock socket
  public static getInstance(): MockWebSocket {
    if (!MockWebSocket.instance) {
      MockWebSocket.instance = new MockWebSocket();
    }
    return MockWebSocket.instance;
  }

  private constructor() {
    // Initialize with some demo rooms
    this.rooms.set("DEMO01", {
      id: "r-1",
      code: "DEMO01",
      name: "Demo Room",
      userCount: 0,
      createdBy: null
    });
  }

  public addEventListener(
    event: string,
    callback: (event: any) => void
  ): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // Simulate initial connection and data
    if (event === "open") {
      setTimeout(() => {
        this.emit("open", {});
      }, this.connectionDelay);
    }
  }

  public removeEventListener(
    event: string,
    callback: (event: any) => void
  ): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        (cb) => cb !== callback
      );
    }
  }

  private emit(event: string, data: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback({ data }));
    }
  }

  public send(message: string): void {
    const parsedMessage = JSON.parse(message) as ClientMessage;
    
    switch (parsedMessage.type) {
      case "join": {
        const colors = [
          "#3B82F6", // blue
          "#10B981", // emerald
          "#F59E0B", // amber
          "#EF4444", // red
          "#8B5CF6", // violet
          "#EC4899", // pink
          "#06B6D4", // cyan
          "#F97316", // orange
        ];
        
        // Handle room creation
        if (parsedMessage.roomCode === "CREATE") {
          const newRoomCode = this.generateRoomCode();
          this.rooms.set(newRoomCode, {
            id: `r-${Date.now()}`,
            code: newRoomCode,
            name: `${parsedMessage.name}'s Room`,
            userCount: 0,
            createdBy: parsedMessage.connectionType === "authenticated" ? parsedMessage.userId || null : null
          });
          this.currentRoomCode = newRoomCode;
          
          this.emit("message", JSON.stringify({ 
            type: "room-joined", 
            room: this.rooms.get(newRoomCode)!
          }));
        } 
        // Handle room joining
        else {
          const roomCode = parsedMessage.roomCode;
          if (!this.rooms.has(roomCode)) {
            // Auto-create the room if it doesn't exist
            this.rooms.set(roomCode, {
              id: `r-${Date.now()}`,
              code: roomCode,
              name: `Room ${roomCode}`,
              userCount: 0,
              createdBy: parsedMessage.connectionType === "authenticated" ? parsedMessage.userId || null : null
            });
          }
          
          this.currentRoomCode = roomCode;
          const room = this.rooms.get(roomCode)!;
          room.userCount++;
          
          this.emit("message", JSON.stringify({ 
            type: "room-joined", 
            room
          }));
        }
        
        // Create the new user
        const newUser: User = {
          id: parsedMessage.userId || `user-${this.nextUserId++}`,
          name: parsedMessage.name,
          color: colors[Math.floor(Math.random() * colors.length)],
          cursor: null,
          isAuthenticated: parsedMessage.connectionType === "authenticated"
        };
        
        this.users.push(newUser);
        
        // Notify about the new user
        this.emit("message", JSON.stringify({ 
          type: "user-joined", 
          user: newUser 
        }));
        
        // Send the current state to the new user
        this.emit("message", JSON.stringify({ 
          type: "users", 
          users: this.users 
        }));
        
        this.emit("message", JSON.stringify({ 
          type: "shapes", 
          shapes: this.shapes 
        }));
        
        break;
      }
      
      case "cursor-move": {
        // Find the current user
        const currentUser = this.users[this.users.length - 1];
        if (currentUser) {
          // Update cursor position
          currentUser.cursor = parsedMessage.position;
          
          this.emit("message", JSON.stringify({
            type: "cursor-move",
            userId: currentUser.id,
            position: parsedMessage.position
          }));
        }
        break;
      }
      
      case "add-shape": {
        // Find the current user
        const currentUser = this.users[this.users.length - 1];
        if (currentUser) {
          const newShape: Shape = {
            id: `shape-${this.nextShapeId++}`,
            userId: currentUser.id,
            color: currentUser.color,
            ...parsedMessage.shape
          };
          
          this.shapes.push(newShape);
          
          this.emit("message", JSON.stringify({
            type: "add-shape",
            shape: newShape
          }));
        }
        break;
      }
    }
  }

  public close(): void {
    if (this.listeners["close"]) {
      this.listeners["close"].forEach((callback) => callback({ code: 1000 }));
    }
    
    // Remove the last user
    if (this.users.length > 0) {
      const lastUser = this.users.pop();
      if (lastUser) {
        this.emit("message", JSON.stringify({
          type: "user-left",
          userId: lastUser.id
        }));
      }
      
      // Update room count
      if (this.currentRoomCode) {
        const room = this.rooms.get(this.currentRoomCode);
        if (room && room.userCount > 0) {
          room.userCount--;
        }
      }
    }
  }
  
  private generateRoomCode(): string {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoiding confusing characters
    let code;
    
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
    } while (this.rooms.has(code));
    
    return code;
  }
}
