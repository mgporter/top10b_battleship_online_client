import { createContext, useState } from "react";
// import { v4 as uuidv4 } from "uuid";

// const uuid = uuidv4();

export const PlayerIdContext = createContext(null);
export const SetPlayerIdContext = createContext(null);
export const PlayerNameContext = createContext(null);
export const SetPlayerNameContext = createContext(null);

export function PlayerProvider({children}) {
  // const [playerName, setPlayerName] = useState(`Player#${uuid.slice(0,5).toUpperCase()}`);
  const [playerName, setPlayerName] = useState("Player");
  const [playerId, setPlayerId] = useState(null);

  return (
    <PlayerIdContext.Provider value={playerId}>
      <SetPlayerIdContext.Provider value={setPlayerId}>
        <PlayerNameContext.Provider value={playerName}>
          <SetPlayerNameContext.Provider value={setPlayerName}>
            {children}
          </SetPlayerNameContext.Provider>
        </PlayerNameContext.Provider>
      </SetPlayerIdContext.Provider>
    </PlayerIdContext.Provider>
  );
}