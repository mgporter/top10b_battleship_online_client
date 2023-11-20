import { useCallback, useEffect, useRef, useState } from "react";
import useWebSocketStatus from "./useWebSocketStatus";
import getSocket from "./getSocket";

export default function useSubscription(destination, callback, id) {

  const socket = getSocket();
  const wsStatus = useWebSocketStatus();
  // const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!wsStatus) return;
    const sub = socket.subscribe(
      destination, 
      callback, 
      {id: id}
    );
    // setIsSubscribed(true);

    return () => {
      sub.unsubscribe();
      // setIsSubscribed(false);
    }

  }, [socket, wsStatus, destination, callback, id]);

  return;

}