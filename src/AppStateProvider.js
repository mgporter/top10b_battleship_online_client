import { createContext, useContext, useState } from "react";
import { ApplicationState } from "./enums";

export const AppStateContext = createContext(null);
export const SetAppStateContext = createContext(null);

export function AppStateProvider({children}) {

  const [appState, setAppState] = useState(ApplicationState.ROOM_SELECTION);
  // const [appState, setAppState] = useState(ApplicationState.SHIP_PLACEMENT);

  return (
    <AppStateContext.Provider value={appState}>
      <SetAppStateContext.Provider value={setAppState}>
        {children}
      </SetAppStateContext.Provider>
    </AppStateContext.Provider>
  )
}