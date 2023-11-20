import { C } from "./Constants";

const socket = new window.SockJS(C.serverPrefix + '/ws');
const stompClient = window.Stomp.over(socket);

stompClient.connect({}, onConnected, onError);

let credentialsSub = null;

function onConnected() {
  credentialsSub = stompClient.subscribe("/user/queue/credentials", receiveCredentials, {id: "credentials"});
  // wsConnected event will be dispatched within SetScreen after credentials are received
}

function onError() {
  window.dispatchEvent(new Event("wsDisconnected"));
}

function receiveCredentials(payload) {
  const message = JSON.parse(payload.body);
  window.dispatchEvent(new CustomEvent("credentialsReceived", {
    detail: {
      id: message.id,
      name: message.name
    }
  }));
  credentialsSub.unsubscribe();
}

export default function getSocket() {

  return stompClient;
  
}