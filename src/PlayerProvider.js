import { createContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const uuid = uuidv4();

export const PlayerIdContext = createContext(uuid);
export const PlayerNameContext = createContext(null);
export const SetPlayerNameContext = createContext(null);

export function PlayerProvider({children}) {
  const [playerName, setPlayerName] = useState(`Player#${uuid.slice(0,5).toUpperCase()}`);

  return (
    <PlayerIdContext.Provider value={uuid}>
      <PlayerNameContext.Provider value={playerName}>
        <SetPlayerNameContext.Provider value={setPlayerName}>
          {children}
        </SetPlayerNameContext.Provider>
      </PlayerNameContext.Provider>
    </PlayerIdContext.Provider>
  );
}