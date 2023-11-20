import { useCallback, useEffect, useRef, useState } from "react";
import useWebSocketStatus from "./useWebSocketStatus";
import getSocket from "./getSocket";

export default function useSubscription(destination, callback, id) {

  const socket = getSocket();
  // const wsStatus = useWebSocketStatus();
  const subscribeObjRef = useRef(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  // const shouldSubscribe = useRef(true); // Make sure the component only subscribes once

  /* Instead of adding 'callback' to the dependency array here, we will instead
  offer an updateCallback function. This way, when the callback reference
  changes, a new subscription does not have to be made. The updateCallback
  can be used inside of an useEffect hook */

  // console.log("use subscribe hook called for " + destination + " and shouldSubscribe is "+ shouldSubscribe.current)

  useEffect(() => {
    // if (!wsStatus) return;
    // console.log("subscribing to " + destination)
    // shouldSubscribe.current = false;
    subscribeObjRef.current = socket.subscribe(destination, callback, {id: id});
    setIsSubscribed(true);

    return () => {
      if (subscribeObjRef.current) {
        subscribeObjRef.current.unsubscribe();
        setIsSubscribed(false)
      }
    }
  }, [destination, id, socket]);

  const updateCallback = useCallback((callback) => {
    if (!subscribeObjRef.current) return;
    socket[id] = callback;
  }, [socket, id])
  

  return [
    isSubscribed,
    updateCallback
  ];

}