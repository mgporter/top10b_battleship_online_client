import getSocket from "./getSocket";
import useWebSocketStatus from "./useWebSocketStatus";


export default function useSocketSend() {

  const socket = getSocket();
  const wsStatus = useWebSocketStatus();

  function send(destination, payload) {
    const stringifiedPayload = typeof payload === "string" ? payload : JSON.stringify(payload);
    if (wsStatus)
      socket.send(destination, {}, stringifiedPayload);
    else console.error(`Message to ${destination} could not be sent.`);
  }

  return {send};  

}