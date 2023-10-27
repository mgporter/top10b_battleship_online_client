export const ApplicationState = {
  ROOM_SELECTION: "ROOM_SELECTION",
  SHIP_PLACEMENT: "SHIP_PLACEMENT",
  ATTACK_PHASE: "ATTACK_PHASE",
  GAME_END: "GAME_END"
}

export const connectionStatus = {
  UNINSTANTIATED: -1,
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
}

export const MessageTypes = {
  JOINLOBBY: "JOINLOBBY",
  JOINGAME: "JOINGAME",
  EXITEDLOBBY: "EXITEDLOBBY",
  EXITEDGAME: "EXITEDGAME",
  CREATEDGAME: "CREATEDGAME"
}

export const LobbyColors = {
  playerJoin: "green",
  playerLeave: "red",
  emphasis: "yellow",
  standard: "white",
}