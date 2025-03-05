
import React from "react";
import { User } from "@/lib/socket";
import { motion } from "framer-motion";

type UserCursorProps = {
  user: User;
};

const UserCursor: React.FC<UserCursorProps> = ({ user }) => {
  if (!user.cursor) return null;

  return (
    <>
      <motion.div
        className="absolute pointer-events-none z-50"
        style={{ 
          left: user.cursor.x,
          top: user.cursor.y,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 300,
          mass: 0.5
        }}
      >
        {/* Cursor dot */}
        <motion.div
          className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
          style={{ 
            borderColor: user.color,
            backgroundColor: `${user.color}20`
          }}
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
        />
        
        {/* User label */}
        <motion.div
          className="absolute px-2 py-1 rounded text-xs text-white whitespace-nowrap flex items-center gap-1"
          style={{ 
            backgroundColor: user.color,
            top: 16,
            left: 8,
            transform: 'translateX(-50%)'
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {user.name}
          {!user.isAuthenticated && (
            <span className="text-[10px] px-1 py-0.5 bg-white/20 rounded-full">
              Guest
            </span>
          )}
        </motion.div>
      </motion.div>
    </>
  );
};

export default UserCursor;
