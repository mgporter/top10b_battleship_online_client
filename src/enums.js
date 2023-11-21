export const ApplicationState = {
  ROOM_SELECTION: 0,
  GAME_INITIALIZED: 1,
  GAME_INITIALIZED_AND_LOADED: 2,
  SHIP_PLACEMENT: 3,
  SHIPS_PLACED_AND_STARTED: 4,
  ATTACK_PHASE: 5,
  GAME_END: 6
}

export const Events = {
  NOTENOUGHPLAYERS: "NOTENOUGHPLAYERS",
  GAMEROOMLOADED: "GAMEROOMLOADED",
  PLACEMENTSSUBMITTED: "PLACEMENTSSUBMITTED",
  ATTACKRECEIVED: "ATTACKRECEIVED",
  MYATTACKRESULTSRECEIVED: "MYATTACKRESULTSRECEIVED",
  OPPONENTATTACKRECEIVED: "OPPONENTATTACKRECEIVED",
  OPPONENTPLACEDSHIP: "OPPONENTPLACEDSHIP",
  STARTPLACEMENT: "STARTPLACEMENT",
  TELLSERVERTOLOADDATA: "TELLSERVERTOLOADDATA",
  STARTATTACKPHASE: "STARTATTACKPHASE",
  SETWINNERSCREEN: "SETWINNERSCREEN",
  LOADSAVEDGAME: "LOADSAVEDGAME",
  BOTHPLAYERSPRESENT: "BOTHPLAYERSPRESENT",
  MODELLOADED: "MODELLOADED"
}

export const PacketType = {
  ATTACK: "ATTACK",
  ATTACK_MISSED: "ATTACK_MISSED", 
  ATTACK_HITSHIP: "ATTACK_HITSHIP",
  ATTACK_SUNKSHIP: "ATTACK_SUNKSHIP",
  ATTACK_ALLSUNK: "ATTACK_ALLSUNK",
  M: "M",  // M H S is short for Missed, Hit, Sunk
  H: "H",
  S: "S",
  PLACED_SHIP: "PLACED_SHIP",
  PLACED_COMPLETE: "PLACED_COMPLETE",
  GAME_INITIALIZED: "GAME_INITIALIZED",
  GAME_START: "GAME_START",
  GAME_ATTACK_PHASE_START: "GAME_ATTACK_PHASE_START",
  PLAYERLIST_UPDATE: "PLAYERLIST_UPDATE",
  LOAD_ALL_DATA: "LOAD_ALL_DATA",
  SUNKSHIP_INFO: "SUNKSHIP_INFO",
  SAVESTATE: "SAVESTATE",
  GAMEROOMLOADED: "GAMEROOMLOADED"
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
  ACCEPTEDJOIN: "ACCEPTEDJOIN",
  GOFIRST: "GOFIRST",
  LOAD_ALL_DATA: "LOAD_ALL_DATA",
  CHANGENAME: "CHANGENAME"
}

export const inGameMessages = {
  WELCOME: "WELCOME",
  SHIPSELECTED: "SHIPSELECTED",
  FIRSTSHIPSELECTED: "FIRSTSHIPSELECTED",
  SHIPPLACED: "SHIPPLACED",
  FIRSTSHIPPLACED: "FIRSTSHIPPLACED",
  ALLSHIPSPLACED: "ALLSHIPSPLACED",
  STARTGAMEFIRSTATTACK: "STARTGAMEFIRSTATTACK",
  STARTGAMESECONDATTACK: "STARTGAMESECONDATTACK",
  WAITINGONOPPONENTATTACK: "WAITINGONOPPONENTATTACK",
  ATTACKMISSED: "ATTACKMISSED",
  ATTACKHITSHIP: "ATTACKHITSHIP",
  ATTACKSUNKSHIP: "ATTACKSUNKSHIP",
  OPPONENTMISSED: "OPPONENTMISSED",
  OPPONENTHITSHIP: "OPPONENTHITSHIP",
  OPPONENTSUNKSHIP: "OPPONENTSUNKSHIP",
  CLEAR: "CLEAR"
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

export const playerListActions = {
  UPDATEPLAYERLIST: "UPDATEPLAYERLIST",
  SETWINNER: "SETWINNER"
}

export const dialogBoxTypes = {
  WAITINGFORJOIN: "WAITINGFORJOIN",
  WAITINGFORPLACEMENT: "WAITINGFORPLACEMENT",
  PLAYERLEFT: "PLAYERLEFT",
  LOADINGMODELS: "LOADINGMODELS"
}

export const shipStatsActions = {
  INCREMENTPLAYERSHIPPLACED: "INCREMENTPLAYERSHIPPLACED",
  INCREMENTPLAYERSHIPSUNK: "INCREMENTPLAYERSHIPSUNK",
  SETPLAYERSHIPSSUNK: "SETPLAYERSHIPSSUNK",
  SETPLAYERSHIPSPLACED: "SETPLAYERSHIPSPLACED",
  INCREMENTOPPONENTSHIPPLACED: "INCREMENTOPPONENTSHIPPLACED",
  INCREMENTOPPONENTSHIPSUNK: "INCREMENTOPPONENTSHIPSUNK",
  SETOPPONENTSHIPSUNK: "SETOPPONENTSHIPSUNK",
  SETOPPONENTSHIPSPLACED: "SETOPPONENTSHIPSPLACED",
  INCREMENTMODELSLOADED: "INCREMENTMODELSLOADED"
}