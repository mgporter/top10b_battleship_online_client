export const ApplicationState = {
  ROOM_SELECTION: "ROOM_SELECTION",
  GAME_INITIALIZED: "GAME_INITIALIZED",
  SHIP_PLACEMENT: "SHIP_PLACEMENT",
  SHIPS_PLACED_AND_STARTED: "SHIPS_PLACED_AND_STARTED",
  ATTACK_PHASE: "ATTACK_PHASE",
  GAME_END: "GAME_END"
}

export const PacketType = {
  ATTACK: "ATTACK",
  ATTACK_MISSED: "ATTACK_MISSED", 
  ATTACK_HITSHIP: "ATTACK_HITSHIP",
  ATTACK_SUNKSHIP: "ATTACK_SUNKSHIP",
  ATTACK_ALLSUNK: "ATTACK_ALLSUNK",
  PLACED_SHIP: "PLACED_SHIP",
  PLACED_COMPLETE: "PLACED_COMPLETE",
  GAME_INITIALIZED: "GAME_INITIALIZED",
  GAME_START: "GAME_START",
  GAME_ATTACK_PHASE_START: "GAME_ATTACK_PHASE_START",
  PLAYERLIST_UPDATE: "PLAYERLIST_UPDATE",
  LOAD_ALL_DATA: "LOAD_ALL_DATA",
  SUNKSHIP_INFO: "SUNKSHIP_INFO"
}

export const connectionStatus = {
  UNINSTANTIATED: -1,
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
  ERROR: 4
}

export const MessageTypes = {
  CREDENTIALS: "CREDENTIALS",
  GAMEROOMLIST: "GAMEROOMLIST",
  JOINLOBBY: "JOINLOBBY",
  JOINGAME: "JOINGAME",
  EXITEDLOBBY: "EXITEDLOBBY",
  EXITEDGAME: "EXITEDGAME",
  GAMEREMOVED: "GAMEREMOVED",
  CREATEDGAME: "CREATEDGAME",
  REJECTEDJOIN_ALREADY_IN_GAME: "REJECTEDJOIN_ALREADY_IN_GAME",
  REJECTEDJOIN_NO_OBSERVERS: "REJECTEDJOIN_NO_OBSERVERS",
  ACCEPTEDJOIN: "ACCEPTEDJOIN"
}

export const LobbyColors = {
  playerJoin: "green",
  playerLeave: "red",
  emphasis: "yellow",
  standard: "white",
}

export const PlayerType = {
  PLAYER1: "PLAYER1",
  PLAYER2: "PLAYER2",
  OBSERVER: "OBSERVER"
}

export const ShipType = {
  PATROLBOAT: 'PATROLBOAT',
  SUBMARINE: 'SUBMARINE',
  DESTROYER: 'DESTROYER',
  BATTLESHIP: 'BATTLESHIP',
  CARRIER: 'CARRIER'
}

export const Avatars = {
  PLAYERCAPTAIN: "PLAYERCAPTAIN",
  ENEMYCOMMANDER: "ENEMYCOMMANDER",
  SYSTEM: "SYSTEM"
}

export const battleStatsActions = {
  incrementMyShotsFired: "incrementMyShotsFired",
  incrementMyShotsHit: "incrementMyShotsHit",
  incrementOpponentShotsFired: "incrementOpponentShotsFired",
  incrementOpponentShotsHit: "incrementOpponentShotsHit"
}