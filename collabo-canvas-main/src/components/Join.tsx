
import React from "react";
import Room from "./Room";
import { ConnectionType } from "@/lib/realtime";
import { useUser } from "@clerk/clerk-react";

type JoinProps = {
  onJoin: (name: string, roomCode: string) => void;
  onCreate: (name: string) => void;
};

const Join: React.FC<JoinProps> = ({ onJoin, onCreate }) => {
  const { isSignedIn } = useUser();

  const handleJoin = (name: string, roomCode: string) => {
    onJoin(name, roomCode);
  };

  const handleCreate = (name: string) => {
    onCreate(name);
  };

  return (
    <Room
      onJoin={handleJoin}
      onCreate={handleCreate}
    />
  );
};

export default Join;
