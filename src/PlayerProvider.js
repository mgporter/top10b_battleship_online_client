import { createContext, useState } from "react";


export const PlayerContext = createContext(null);

export function PlayerProvider({children}) {

  const [playerName, setPlayerName] = useState(null);
  const [playerId, setPlayerId] = useState(null);

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