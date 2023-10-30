import { createContext, useState } from "react";
import { connectionStatus } from "./enums";

const socket = new window.SockJS('http://localhost:8080/ws');
const stompClient = window.Stomp.over(socket);

export const SocketContext = createContext(stompClient);
export const wsStatusContext = createContext(null);

export function SocketProvider({children}) {

  const [status, setStatus] = useState(connectionStatus.UNINSTANTIATED);
  // console.log("SOCKET PROVIDER is being called")
  stompClient.connect({}, onConnected, onError);

  function onConnected() {
    // console.log("Websockets connected (from socketprovider)");
    setStatus(connectionStatus.OPEN);
  }

  function onError() {
    console.log("Websockets error occurred")
    setStatus(connectionStatus.ERROR);
  }

  return (
    <SocketContext.Provider value={stompClient}>
      <wsStatusContext.Provider value={status}>
        {children}
      </wsStatusContext.Provider>
    </SocketContext.Provider>
  );

  
};