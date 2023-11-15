import { endpoints } from "./Endpoints";
import useSocketSend from "./useSocketSend";

export default function useUpdateServerName() {

  const socketSend = useSocketSend();

  function to(name) {
    socketSend.send(endpoints.changeName, name);
  }

  return {to};
}