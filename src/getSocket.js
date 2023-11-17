import { C } from "./Constants";

const socket = new window.SockJS(C.serverPrefix + '/ws');
const stompClient = window.Stomp.over(socket);

stompClient.connect({}, onConnected, onError);

function onConnected() {
  window.dispatchEvent(new Event("wsConnected"));
}

function onError() {
  window.dispatchEvent(new Event("wsDisconnected"));
}

export default function getSocket() {

  return stompClient;
  
}