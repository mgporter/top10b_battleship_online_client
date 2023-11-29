import { C } from "./Constants";

/**
 * Note: See Stomp client documentation at:
 * https://stomp-js.github.io/stomp-websocket/codo/extra/docs-src/Usage.md.html
 */

const socket = new window.SockJS(C.serverPrefix + '/ws');
const stompClient = window.Stomp.over(socket);
stompClient.reconnect_delay = 3000;

if (!C.debugMode) stompClient.debug = null; // Disable console messages
else {
  console.log(socket);
  console.log(stompClient);
}

let credentialsSub = null;

stompClient.connect({}, onConnected, onError);

function onError() {
  window.dispatchEvent(new Event("wsDisconnected"));
}

function onConnected() {
  // wsConnected event will be dispatched within SetScreen after credentials are received
  credentialsSub = stompClient.subscribe("/user/queue/credentials", receiveCredentials, {id: "credentials"});
}

function receiveCredentials(payload) {
  console.log("Credentials RECEIVED")
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