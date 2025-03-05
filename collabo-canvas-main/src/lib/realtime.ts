
// Define connection types
export type ConnectionType = "authenticated" | "anonymous";

// Define our WebSocket URL based on environment
export const getWebSocketUrl = (roomId: string): string => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = import.meta.env.VITE_WEBSOCKET_URL || `${protocol}//${window.location.host}`;
  return `${host}/ws?roomId=${roomId}`;
};

// Simple reconnection manager
export class ReconnectionManager {
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private baseDelay = 1000;
  private maxDelay = 30000;

  public getNextDelay(): number {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return -1; // Signal to stop reconnecting
    }
    
    // Exponential backoff with jitter
    const delay = Math.min(
      this.maxDelay,
      this.baseDelay * Math.pow(2, this.reconnectAttempts) + 
      Math.random() * 1000
    );
    
    this.reconnectAttempts++;
    return delay;
  }

  public reset(): void {
    this.reconnectAttempts = 0;
  }
}

// Utility to generate room codes
export const generateRoomCode = (): string => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Omitting confusing chars like 0/O, 1/I
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Determine if a room code is valid format
export const isValidRoomCode = (code: string): boolean => {
  return /^[A-Z0-9]{6}$/.test(code);
};
