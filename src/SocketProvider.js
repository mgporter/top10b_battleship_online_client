import { createContext, useState, useEffect } from "react";
import { connectionStatus } from "./enums";

const socket = new window.SockJS('http://localhost:8080/ws');
const stompClient = window.Stomp.over(socket);

export const SocketContext = createContext(stompClient);
export const wsStatusContext = createContext(null);
export const PrivateMessageContext = createContext(null);
export const SetPrivateMessageContext = createContext(null);  // Remove??


export function SocketProvider({children}) {

  const [status, setStatus] = useState(connectionStatus.UNINSTANTIATED);
  const [privateMessage, setPrivateMessage] = useState([{type: null}]);

  useEffect(() => {
    stompClient.connect({}, onConnected, onError);
    return () => {
      if (status == connectionStatus.OPEN) stompClient.disconnect();
    }
  }, [])

  function onConnected() {
    // stompClient.subscribe("/user/queue/message", onPrivateMessageReceived);
    // stompClient.send("/app/getCredentials", {}, "Test");
    setStatus(connectionStatus.OPEN);
  }

  function onError() {
    console.log("Websockets error occurred")
    setStatus(connectionStatus.ERROR);
  }

/*   function onPrivateMessageReceived(payload) {
    console.log("Private message: " + payload.body);
    const message = JSON.parse(payload.body);
    // window.dispatchEvent(new Event(""));
    // setPrivateMessage((prev) => [JSON.parse(payload.body), ...prev]);
  } */

  return (
    <SocketContext.Provider value={stompClient}>
      <wsStatusContext.Provider value={status}>
        <PrivateMessageContext.Provider value={privateMessage}>
          <SetPrivateMessageContext.Provider value={setPrivateMessage}>
            {children}
          </SetPrivateMessageContext.Provider>
        </PrivateMessageContext.Provider>
      </wsStatusContext.Provider>
    </SocketContext.Provider>
  );

  
};