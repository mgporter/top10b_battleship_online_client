import { useEffect, useRef, useState } from "react";
import useWebSocketStatus from "./useWebSocketStatus";
import getSocket from "./getSocket";

export default function useSubscription(subscription, callback, id) {

  const [isSubscribed, setIsSubscribed] = useState(false);
  const socket = getSocket();
  const wsStatus = useWebSocketStatus();
  const isSubscribedRef = useRef(isSubscribed);

  useEffect(() => {
    console.log(isSubscribed)
    console.log("USE SUBSCRIPTION CALLED FOR " + subscription + " " + id + " and isSubscribed is " + isSubscribedRef.current)
    console.log(wsStatus);
    if (!wsStatus || isSubscribedRef.current === true) {
      return;
    }
    console.log("subscribing to " + subscription)
    const sub = socket.subscribe(subscription, callback, {id: id});
    isSubscribedRef.current = true;
    setIsSubscribed(true);
    return () => {
      isSubscribedRef.current = false;
      setIsSubscribed(false);
      sub.unsubscribe();
      
    }
  }, [wsStatus, callback])

  return isSubscribed;

}