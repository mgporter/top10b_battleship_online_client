import { createContext, useState } from "react";

export const PlayerContext = createContext(null);

export function PlayerProvider({children}) {
  
  const initialName = localStorage.getItem("playerName");
  const initialId = localStorage.getItem("playerId");

  const [playerName, setPlayerName] = useState(initialName ? initialName : null);
  const [playerId, setPlayerId] = useState(initialId ? initialId : null);

  const playerContextObject = {
    playerName,
    setPlayerName,
    playerId,
    setPlayerId
  }

  return (
    <PlayerContext.Provider value={playerContextObject}>
      {children}
    </PlayerContext.Provider>
  );
}