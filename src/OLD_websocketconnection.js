import { WebSocketState } from "./enums";

export const wsObject = {
  state: WebSocketState.DISCONNECTED,
  client: null,
}

export default function WebSocketConnection() {
  let stompClient = null;
  let socket = null;

  function connect() {
    socket = new window.SockJS('http://localhost:8080/ws');
    stompClient = window.Stomp.over(socket);
    stompClient.connect({}, onConnected, onError);
  }

  function onError() {
    console.log("unable to connect to WebSockets");
    wsObject.state = WebSocketState.DISCONNECTED;
    wsObject.client = null;
    document.dispatchEvent(new Event("wsDisconnected"));
  }

  function onConnected() {
    console.log("You are now connected via WebSockets");
    wsObject.state = WebSocketState.CONNECTED;
    wsObject.client = stompClient;
    // document.dispatchEvent(new Event("wsConnected"));


    // stompClient.subscribe("/lobby", onLobbyMessageReceived);
    // stompClient.send("/app/joinLobby",
    //   {},
    //   JSON.stringify({messageType: 'JOINLOBBY'}));
  }

  // function onLobbyMessageReceived(payload) {
  //   const message = JSON.parse(payload.body);
  //   if (receivedMessageHandler != null) {
  //     receivedMessageHandler(payload);
  //   }
  // }

  function getStompClient() {
    return stompClient;
  }


  return {
    connect,
    getStompClient,
  }
}

