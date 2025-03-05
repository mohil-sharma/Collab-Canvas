
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useUser } from "@clerk/clerk-react";
import { isValidRoomCode } from "@/lib/realtime";

type RoomProps = {
  onJoin: (name: string, roomCode: string) => void;
  onCreate: (name: string) => void;
};

const Room: React.FC<RoomProps> = ({ onJoin, onCreate }) => {
  const { user } = useUser();
  const [name, setName] = useState(user?.firstName || "");
  const [roomCode, setRoomCode] = useState("");
  const [mode, setMode] = useState<"join" | "create">("join");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    
    if (mode === "join") {
      if (!roomCode.trim()) {
        setError("Please enter a room code");
        return;
      }
      
      if (!isValidRoomCode(roomCode.toUpperCase())) {
        setError("Room code must be 6 characters (letters and numbers)");
        return;
      }
      
      onJoin(name, roomCode.toUpperCase());
    } else {
      onCreate(name);
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ 
          type: "spring",
          damping: 30,
          stiffness: 300
        }}
      >
        <h2 className="text-2xl font-bold mb-2">
          {mode === "join" ? "Join a Room" : "Create a Room"}
        </h2>
        <p className="text-gray-500 mb-6">
          {mode === "join" 
            ? "Enter your name and a room code to join" 
            : "Enter your name to create a new room"}
        </p>
        
        <div className="flex space-x-2 mb-6">
          <Button 
            variant={mode === "join" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setMode("join")}
            type="button"
          >
            Join Room
          </Button>
          <Button 
            variant={mode === "create" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setMode("create")}
            type="button"
          >
            Create Room
          </Button>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Your Name</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full"
              autoFocus
            />
          </div>
          
          {mode === "join" && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Room Code</label>
              <Input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-character code"
                className="w-full uppercase"
                maxLength={6}
              />
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-white"
            disabled={!name.trim() || (mode === "join" && !roomCode.trim())}
          >
            {mode === "join" ? "Join Room" : "Create Room"}
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Room;
