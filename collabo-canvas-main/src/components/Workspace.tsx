
import React, { useState } from "react";
import Canvas from "./Canvas";
import Toolbar from "./Toolbar";
import UserCursor from "./UserCursor";
import { useSocketConnection } from "@/lib/socket";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui/button";
import { ClipboardCopy, Users } from "lucide-react";
import { toast } from "sonner";

const Workspace: React.FC = () => {
  const [activeTool, setActiveTool] = useState<"select" | "rectangle" | "circle" | "line">("select");
  const [activeColor, setActiveColor] = useState("#3B82F6");
  const { users, shapes, isConnected, currentUser, currentRoom } = useSocketConnection();
  
  const handleClearCanvas = () => {
    // In a real implementation, this would clear the canvas by sending a message
    // to the server. For now, we'll just change the tool as feedback.
    setActiveTool("select");
  };

  const handleCopyRoomCode = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom.code);
      toast.success("Room code copied to clipboard");
    }
  };

  return (
    <div className="flex h-full">
      <div className="p-4 flex">
        <Toolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          activeColor={activeColor}
          setActiveColor={setActiveColor}
          onClear={handleClearCanvas}
          connectedUsers={users.length + (currentUser ? 1 : 0)}
        />
      </div>
      
      <div className="flex-1 p-4 relative overflow-hidden">
        {/* Room information bar */}
        {currentRoom && (
          <motion.div 
            className="absolute top-4 left-4 right-4 z-10 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border p-2 flex justify-between items-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 px-2">
              <span className="font-medium">{currentRoom.name || `Room ${currentRoom.code}`}</span>
              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                {currentRoom.code}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0"
                onClick={handleCopyRoomCode}
              >
                <ClipboardCopy className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {users.length + (currentUser ? 1 : 0)} connected
              </span>
            </div>
          </motion.div>
        )}
        
        {/* Connecting overlay */}
        <AnimatePresence>
          {!isConnected && (
            <motion.div 
              className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="flex flex-col items-center"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ 
                  type: "spring",
                  damping: 20,
                  stiffness: 300
                }}
              >
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-lg font-medium">Connecting...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main canvas */}
        <Canvas 
          activeTool={activeTool} 
          activeColor={activeColor} 
        />
        
        {/* User cursors */}
        <div className="absolute inset-0 pointer-events-none">
          {users.map((user) => (
            <UserCursor key={user.id} user={user} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Workspace;
