import { useEffect, useState } from "react";
import getSocket from "./getSocket";

export default function useWebSocketStatus() {

  const socket = getSocket();
  const [isConnected, setIsConnected] = useState(socket.ws.readyState === 1);

  useEffect(() => {

    function handleWsConnected() {
      setIsConnected(true);
    }

    function handleWsDisconnected() {
      setIsConnected(false);
    }

    window.addEventListener("wsConnected", handleWsConnected);
    window.addEventListener("wsDisconnected", handleWsDisconnected);

    return () => {
      window.removeEventListener("wsConnected", handleWsConnected);
      window.removeEventListener("wsDisconnected", handleWsDisconnected);
    }
  }, [])

  return isConnected;

}