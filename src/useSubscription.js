import { useEffect } from "react";
import useWebSocketStatus from "./useWebSocketStatus";
import getSocket from "./getSocket";

export default function useSubscription(destination, callback, id) {

  const socket = getSocket();
  const wsStatus = useWebSocketStatus();

  useEffect(() => {
    if (!wsStatus) return;
    const sub = socket.subscribe(
      destination, 
      callback, 
      {id: id}
    );

    return () => {
      sub.unsubscribe();
    }

  }, [socket, wsStatus, destination, callback, id]);

  return;

}