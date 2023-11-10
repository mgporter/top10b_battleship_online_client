import { useEffect, useState } from "react";
import useWebSocketStatus from "./useWebSocketStatus";
import getSocket from "./getSocket";

export default function useSubscription(subscription, callback) {

  const [isSubscribed, setIsSubscribed] = useState(false);
  const socket = getSocket();
  const wsStatus = useWebSocketStatus();

  console.log("USE SUBSCRIPTION CALLED FOR " + subscription + " and isSubscribed is " + isSubscribed)

  useEffect(() => {
    if (!wsStatus || isSubscribed) {
      return;
    }
    console.log("ACTUALLY SUBSCRIBING TO " + subscription)
    const sub = socket.subscribe(subscription, callback);
    setIsSubscribed(true);
    return () => {
      sub.unsubscribe();
      setIsSubscribed(false);
    }
  }, [wsStatus])

  return isSubscribed;

}