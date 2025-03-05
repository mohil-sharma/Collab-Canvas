
import React from "react";
import Join from "@/components/Join";
import Workspace from "@/components/Workspace";
import { useSocketConnection } from "@/lib/socket";
import { AnimatePresence, motion } from "framer-motion";
import { useUser } from "@clerk/clerk-react";
import { UserButton } from "@clerk/clerk-react";

const Index = () => {
  const { currentUser, currentRoom, joinRoom, createRoom } = useSocketConnection();
  const { user, isSignedIn } = useUser();
  
  const handleJoin = (name: string, roomCode: string) => {
    joinRoom(name, roomCode, isSignedIn ? "authenticated" : "anonymous");
  };
  
  const handleCreate = (name: string) => {
    createRoom(name);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <motion.header 
        className="border-b bg-white px-6 py-4 flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center space-x-2">
          <motion.div
            className="w-2 h-2 rounded-full bg-primary animate-pulse"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          />
          <h1 className="text-xl font-medium">Collabo Canvas</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {currentUser && (
            <motion.div 
              className="px-3 py-1 rounded-full text-sm flex items-center"
              style={{ 
                backgroundColor: `${currentUser.color}15`,
                color: currentUser.color
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: currentUser.color }}
              />
              <span>{currentUser.name}</span>
              {!currentUser.isAuthenticated && (
                <span className="ml-2 text-xs px-1.5 py-0.5 bg-gray-100 rounded-full">
                  Guest
                </span>
              )}
            </motion.div>
          )}
          
          {isSignedIn && <UserButton />}
        </div>
      </motion.header>
      
      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <Workspace />
        
        {/* Join modal */}
        <AnimatePresence>
          {!currentUser && (
            <Join onJoin={handleJoin} onCreate={handleCreate} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;
