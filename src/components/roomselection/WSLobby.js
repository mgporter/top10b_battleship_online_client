import { WebSocketState } from "../../enums";
import { useState, useEffect } from "react";

function WSLobby({onMessageReceived, setWsState, wsState, playerName}) {

  const [stompClient, setStompClient] = useState(null);
  // const [unsubscribeFunction, setUnsubscribeFunction] = useState(null);
  // const [subId, setSubId] = useState(null);

  useEffect(() => {
    console.log("WSLobby attempt to connect called from useEffect")
    const socket = new window.SockJS('http://localhost:8080/ws');
    const client = window.Stomp.over(socket);
    client.connect({}, () => {
        setWsState(WebSocketState.CONNECTED);
        setStompClient(client);
      }, onError);
    return () => {
      if (wsState == WebSocketState.CONNECTED) {
        client.disconnect(() => {console.log("you are disconnected from lobby")});
      }
    }
  }, [])

  useEffect(() => {
    if (wsState == WebSocketState.CONNECTED) {
      onConnected();
    }
  }, [wsState])

  function onError() {
    console.log("unable to connect to the lobby via websockets");
    setWsState(WebSocketState.DISCONNECTED);
  }

  function onConnected() {
    console.log("You are now connected to the lobby via WebSockets");
    setWsState(WebSocketState.CONNECTED);
    const unsubObject = stompClient.subscribe("/lobby", onMessageReceived);
    // console.log(`returning subscribe object ${unsubObject}`);
    // setSubId(unsubObject.id);
    stompClient.send("/app/joinLobby", {}, JSON.stringify({sender: {id: null, name: playerName}, messageType: 'JOINLOBBY'}));
  }
}

export default WSLobby;