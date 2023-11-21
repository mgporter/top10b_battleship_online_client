import { useState, useEffect, useContext, useRef, useReducer, useCallback, useMemo } from "react";
import { ApplicationState, PacketType, dialogBoxTypes, inGameMessages, playerListActions, shipStatsActions, MessageTypes, Events } from '../enums';
import { PlayerContext, PlayerIdContext } from "../PlayerProvider";
import "./gamecontainer.css";
import './gamescreen/winnerscreen.css';
import FullScreenInfoDialog from "./FullScreenInfoDialog.js";
import { updatePlayerList } from "./helperfunctions.js";
import BottomRightPanel from "./gamescreen/BottomRightPanel";
import CreditsBlock from "./gamescreen/CreditsBlock";
import MessageArea from "./gamescreen/MessageArea";
import OpponentBoard from "./gamescreen/OpponentBoard";
import RoomPanel from "./gamescreen/RoomPanel";
import MainboardAndPanel from "./gamescreen/MainboardAndPanel";
import WinnerScreen from "./gamescreen/WinnerScreen.js";
import ModelCredits from "./gamescreen/ModelCredits.js";
import { AppStateContext, SetAppStateContext } from "../AppStateProvider";
import { battleStatsReducer, playerReducer, shipStatsReducer } from './logic/boardhelperfunctions';
import useSocketSend from "../useSocketSend.js";
import useSubscription from "../useSubscription";
import { setInGameMessagesContext } from "../InGameMessageProvider.js";
import useFullScreenDialog from "../useFullScreenDialog";
import OpponentShipsPlacedMinidialog from "./gamescreen/OpponentShipsPlacedMinidialog";
import { C } from "../Constants";
import getSocket from "../getSocket";
import useWebSocketStatus from "../useWebSocketStatus";
import EventEmitter from "../EventEmitter";

/**
 * GAME CONTAINER LAYOUT
 * 
 * |-----------------------------GAME CONTAINER ------------------------------|
 * |----ROOM CONTAINER------|------MESSAGE AREA--------|---CREDITS BLOCK-----||
 * ||                       |                          |                     ||
 * ||                       |                          |                     ||
 * ||-----------------------|--------------------------|---------------------||
 * |----------------MAINBOARD AND PANEL----------------|---OPPONENT BOARD----||
 * ||                                                  |                     ||
 * ||---SHIP PLACEMENT---||-------MAINBOARD-----------||                     ||  
 * |||       PANEL       ||                           ||                     ||
 * |||     ** OR **      ||                           ||                     ||
 * |||   SHIP HEALTH     ||  Note: Model Container    ||                     ||
 * |||       PANEL       ||  creates a canvas that    ||                     ||
 * |||                   || is absolutely positioned  ||--BOTTOMRIGHT PANEL--||
 * |||                   ||   above the mainboard     ||                     ||
 * |||                   ||                           ||                     ||
 * |||                   ||                           ||                     ||
 * |||-------------------||---------------------------||                     ||
 * |---------------------------------------------------|---------------------||
 * |--------------------------------------------------------------------------|
 *  
 * */


/**
 * GAME STATES:
 * 1. GAME_INITIALIZED: after the server accepts the joingame request, it sends a packet
 *  and a function in the lobby moves the game to this state. In this state, the gameboard
 *  is displayed and we load the models. If there is a saved gameState, then we jump
 *  directly to the ATTACK_PHASE after loading.
 * 2. SHIP_PLACEMENT: after the models have been loaded and there are at least two players
 *  in the room, then we move to the SHIP_PLACEMENT state, where players place their ships
 *  on the board. No information is saved until the player places all their ships and
 *  presses the start button. 
 * 3. SHIPS_PLACED_AND_STARTED: After the user presses the start button, the game moves to
 *  this state. The ship placement data is sent to the server, and the player cannot change
 *  their placements.
 * 4. ATTACK_PHASE: Once both players have pressed the start button and entered the 
 *  SHIPS_PLACED_AND_STARTED state, the game moves to the ATTACK_PHASE. This is where
 *  players start attacking each other.
 * 5. GAME_END: once a player's ships have all been sunk, then we move to the GAME_END state,
 *  where players can no longer attack each other and the end game screen is displayed.
 *  */


export default function GameContainer({
  roomNumberRef
}) {

  console.log("GameContainer");

  const gameContainerRef = useRef(null);

  const fullScreenDialog = useFullScreenDialog(dialogBoxTypes.LOADINGMODELS);
  const [gameLoaded, setGameLoaded] = useState(false);
  const [gameData, setGameData] = useState(null);

  const [attackResultPlayer, setAttackResultPlayer] = useState(null);
  const [attackResultOpponent, setAttackResultOpponent] = useState(null);
  const [showEndGameDialog, setShowEndGameDialog] = useState(true);  // change this, or move messagearea endgame to main endgame container
  const [showModelCredits, setShowModelCredits] = useState(false);
  const [readyToAttackOpponent, setReadyToAttackOpponent] = useState(false);
  const [showOpponentPanels, setShowOpponentPanels] = useState(false);

  const [shipStats, dispatchShipStats] = useReducer(shipStatsReducer, {
    playerShipsPlaced: 0,
    playerShipsSunk: 0,
    opponentShipsPlaced: 0,
    opponentShipsSunk: 0
  });

  const [players, dispatchPlayers] = useReducer(playerReducer, {
    playerOne: null,
    playerTwo: null,
    atLeastTwoPlayers: false,
    observerList: [],
    idToNames: {},
    winner: null,
    room: roomNumberRef.current
  });

  const [battleStats, dispatchBattleStats] = useReducer(battleStatsReducer, {
    myShotsFired: 0, 
    opponentShotsFired: 0, 
    myShotsHit: 0, 
    opponentShotsHit: 0,
    streak: [0,0,0],
    myHitRate: 0,
    opponentHitRate: 0,
    score: 0
  });

  // load contexts
  const {playerId} = useContext(PlayerContext);
  const appState = useContext(AppStateContext);
  const setAppState = useContext(SetAppStateContext);
  const setInGameMessages = useContext(setInGameMessagesContext);
  const gameTimeSecondsFinal = useRef(0);
  const sendPacket = useSocketSend();



  const handlePlayerListChange = useCallback((message) => {
    
    dispatchPlayers({
      type: playerListActions.UPDATEPLAYERLIST,
      data: message
    })

    if (message.playerOneId && message.playerTwoId) {

      console.log("hide dialog")
      fullScreenDialog.hide();

    } else {

      if (appState === ApplicationState.SHIPS_PLACED_AND_STARTED ||
        appState === ApplicationState.SHIP_PLACEMENT) {
        dispatchShipStats({type: shipStatsActions.SETOPPONENTSHIPSPLACED, data: 0});
      }
      if (appState >= ApplicationState.SHIP_PLACEMENT &&
        appState != ApplicationState.GAME_END) {
          fullScreenDialog.show(dialogBoxTypes.PLAYERLEFT);
          sendPacket(PacketType.SAVESTATE);
        }      

    }

  }, [appState, fullScreenDialog, sendPacket]);

  const handleGameRoomLoaded = useCallback(() => {
    sendPacket(PacketType.GAMEROOMLOADED);
    setGameLoaded(true);
  }, [sendPacket]);

  const handleStartPlacement = useCallback(() => {
    fullScreenDialog.hide();
    setAppState(ApplicationState.SHIP_PLACEMENT);
    setInGameMessages(inGameMessages.WELCOME);
  }, [fullScreenDialog, setAppState, setInGameMessages]);

  const handleOpponentPlacedShip = useCallback((shipcount) => {
    dispatchShipStats({type: shipStatsActions.SETOPPONENTSHIPSPLACED, data: shipcount});
  }, []);

  const handlePlacementsSubmitted = useCallback(() => {
    setAppState(ApplicationState.SHIPS_PLACED_AND_STARTED);
    fullScreenDialog.show(dialogBoxTypes.WAITINGFORPLACEMENT, shipStats.opponentShipsPlaced);
  }, [setAppState, fullScreenDialog, shipStats]);

  const handleOpponentAttackReceived = useCallback(() => {
    setReadyToAttackOpponent(true);
  }, []);

  const handleTellServerToLoadData = useCallback(() => {
    sendPacket(PacketType.LOAD_ALL_DATA);
  }, [sendPacket]);

  const handleStartAttackPhase = useCallback(() => {
    setAppState(ApplicationState.ATTACK_PHASE);
    fullScreenDialog.hide();
    if (playerId === players.playerOne) {
      setInGameMessages(inGameMessages.STARTGAMEFIRSTATTACK);
      setReadyToAttackOpponent(true);
    } else {
      setInGameMessages(inGameMessages.STARTGAMESECONDATTACK);
    }
    setTimeout(() => {
      setShowOpponentPanels(true);
    }, 100)
  }, [setAppState, fullScreenDialog, setInGameMessages, playerId, players]);

  const handleSetWinnerScreen = useCallback((winnerId) => {
    dispatchPlayers({type: playerListActions.SETWINNER, data: winnerId});
    setReadyToAttackOpponent(false);

    // Give a slight delay in order to let the final boardping animation play
    setTimeout(() => {        
      setAppState(ApplicationState.GAME_END);
    }, 1200)
  }, [setAppState]);

  const handleLoadSavedGame = useCallback((message) => {

    // If all of the opponent's ships are already sunk
    if (message.opponentSunkShips.length === C.totalShips) {

      handleSetWinnerScreen(playerId);
      setShowOpponentPanels(true);

    // If all of the current player's ships are already sunk
    } else if (message.myShips.filter(ship => ship.sunk === true).length === C.totalShips) {

      handleSetWinnerScreen(playerId === players.playerOne ? players.playerTwo : players.playerOne);
      setShowOpponentPanels(true);

    // If the opponent has not yet placed their ships    
    } else if (!message.opponentHasPlaced) {

      handlePlacementsSubmitted();
    
    // All other situations, i.e., the opponent has placed their ships and nobody
    // has won yet.
    } else {

      setAppState(ApplicationState.ATTACK_PHASE);
      fullScreenDialog.hide();
      if (message.goFirst) {
        setReadyToAttackOpponent(true);
        setInGameMessages(inGameMessages.STARTGAMEFIRSTATTACK);
      } else {
        setReadyToAttackOpponent(false);
        setInGameMessages(inGameMessages.STARTGAMESECONDATTACK);
      }
      setTimeout(() => {
        setShowOpponentPanels(true);
      }, 100) 

    }

  }, [
    setAppState, 
    setInGameMessages, 
    fullScreenDialog, 
    handlePlacementsSubmitted,
    handleSetWinnerScreen,
    playerId,
    players
  ]);

  
  useEffect(() => {
    EventEmitter.subscribe(Events.PLAYERLISTCHANGE, "GameCon", handlePlayerListChange);
    return () => {
      EventEmitter.unsubscribe(Events.PLAYERLISTCHANGE, "GameCon");
    }
  }, [handlePlayerListChange])

  useEffect(() => {
    EventEmitter.subscribe(Events.GAMEROOMLOADED, "GameCon", handleGameRoomLoaded);
    return () => {
      EventEmitter.unsubscribe(Events.GAMEROOMLOADED, "GameCon");
    }
  }, [handleGameRoomLoaded])

  useEffect(() => {
    EventEmitter.subscribe(Events.STARTPLACEMENT, "GameCon", handleStartPlacement);
    return () => {
      EventEmitter.unsubscribe(Events.STARTPLACEMENT, "GameCon");
    }
  }, [handleStartPlacement])

  useEffect(() => {
    EventEmitter.subscribe(Events.OPPONENTPLACEDSHIP, "GameCon", handleOpponentPlacedShip);
    return () => {
      EventEmitter.unsubscribe(Events.OPPONENTPLACEDSHIP, "GameCon");
    }
  }, [handleOpponentPlacedShip])

  useEffect(() => {
    EventEmitter.subscribe(Events.PLACEMENTSSUBMITTED, "GameCon", handlePlacementsSubmitted);
    return () => {
      EventEmitter.unsubscribe(Events.PLACEMENTSSUBMITTED, "GameCon");
    }
  }, [handlePlacementsSubmitted])

  useEffect(() => {
    EventEmitter.subscribe(Events.OPPONENTATTACKRECEIVED, "GameCon", handleOpponentAttackReceived);
    return () => {
      EventEmitter.unsubscribe(Events.OPPONENTATTACKRECEIVED, "GameCon");
    }
  }, [handleOpponentAttackReceived])

  useEffect(() => {
    EventEmitter.subscribe(Events.TELLSERVERTOLOADDATA, "GameCon", handleTellServerToLoadData);
    return () => {
      EventEmitter.unsubscribe(Events.TELLSERVERTOLOADDATA, "GameCon");
    }
  }, [handleTellServerToLoadData])

  useEffect(() => {
    EventEmitter.subscribe(Events.STARTATTACKPHASE, "GameCon", handleStartAttackPhase);
    return () => {
      EventEmitter.unsubscribe(Events.STARTATTACKPHASE, "GameCon");
    }
  }, [handleStartAttackPhase])

  useEffect(() => {
    EventEmitter.subscribe(Events.SETWINNERSCREEN, "GameCon", handleSetWinnerScreen);
    return () => {
      EventEmitter.unsubscribe(Events.SETWINNERSCREEN, "GameCon");
    }
  }, [handleSetWinnerScreen])

  useEffect(() => {
    EventEmitter.subscribe(Events.LOADSAVEDGAME, "GameCon", handleLoadSavedGame);
    return () => {
      EventEmitter.unsubscribe(Events.LOADSAVEDGAME, "GameCon");
    }
  }, [handleLoadSavedGame])



  
  const onPublicMessageReceived = useCallback((payload) => {
    const message = JSON.parse(payload.body);
    const fromCurrentPlayer = message.playerId === playerId;

    switch(message.type) {

      case PacketType.ATTACK: {
        if (fromCurrentPlayer)
          EventEmitter.dispatch(Events.MYATTACKRESULTSRECEIVED, message);
        else EventEmitter.dispatch(Events.OPPONENTATTACKRECEIVED, message);
        break;
      }

      case PacketType.PLACED_SHIP: {
        if (!fromCurrentPlayer) 
          EventEmitter.dispatch(Events.OPPONENTPLACEDSHIP, message.shipsPlacedCount);
        break;
      }

      case PacketType.GAME_START: {
        EventEmitter.dispatch(Events.STARTPLACEMENT);
        break;
      }

      case PacketType.PLACED_COMPLETE: {
        EventEmitter.dispatch(Events.TELLSERVERTOLOADDATA);
        break;
      }

      case PacketType.GAME_ATTACK_PHASE_START: {
        EventEmitter.dispatch(Events.STARTATTACKPHASE);
        break;
      }

      case PacketType.ATTACK_ALLSUNK: {
        EventEmitter.dispatch(Events.SETWINNERSCREEN, message.playerId);
        break;
      }

    }
  }, [playerId]);


  useSubscription(`/game/public/${roomNumberRef.current}`, onPublicMessageReceived, `game-public-${roomNumberRef.current}`);


  const onPrivateMessageReceived = useCallback((payload) => {
    const message = JSON.parse(payload.body);

    switch(message.type) {

      case MessageTypes.LOAD_ALL_DATA: {
        EventEmitter.dispatch(Events.LOADSAVEDGAME, message);
        break;
      }
      
    }

  }, [])

  useSubscription("/user/queue/game", onPrivateMessageReceived, "game-private-msg");

  const showWinnerScreen = appState === ApplicationState.GAME_END ? true : false;
  const showOpponentShipsMinidialog = appState === ApplicationState.SHIP_PLACEMENT && !fullScreenDialog.shouldDisplay;



  return (
    <div id="game-container" ref={gameContainerRef}>
      {fullScreenDialog.shouldDisplay && <FullScreenInfoDialog 
        fullScreenDialog={fullScreenDialog} 
        setGameLoaded={setGameLoaded}
        shipStats={shipStats} />}
      <MainboardAndPanel 
          sendPacket={sendPacket} 
          dispatchBattleStats={dispatchBattleStats}
          attackResultOpponent={attackResultOpponent}
          readyToAttackOpponent={readyToAttackOpponent}
          shipStats={shipStats}
          dispatchShipStats={dispatchShipStats}
          gameContainerRef={gameContainerRef}
        />
      {gameLoaded && <RoomPanel 
        players={players}
        dispatchPlayers={dispatchPlayers}
       />}
      {showOpponentShipsMinidialog && <OpponentShipsPlacedMinidialog shipStats={shipStats} />}
        <MessageArea 
          showEndGameButtons={!showEndGameDialog && showWinnerScreen}
          winner={players.winner}
          setShowEndGameDialog={setShowEndGameDialog} />
        <CreditsBlock setShowModelCredits={setShowModelCredits} />
        <OpponentBoard 
          dispatchBattleStats={dispatchBattleStats}
          readyToAttackOpponent={readyToAttackOpponent}
          setReadyToAttackOpponent={setReadyToAttackOpponent}
          sendPacket={sendPacket}
          attackResultPlayer={attackResultPlayer}
          shipStats={shipStats}
          dispatchShipStats={dispatchShipStats}
          showOpponentPanels={showOpponentPanels}
        />
        <BottomRightPanel 
          battleStats={battleStats} 
          players={players}
          gameTimeSecondsFinal={gameTimeSecondsFinal}
          showOpponentPanels={showOpponentPanels}
          />
        {(showWinnerScreen && showEndGameDialog) && <WinnerScreen 
          winner={players.winner} 
          battleStats={battleStats}
          shipStats={shipStats}
          gameTimeSecondsFinal={gameTimeSecondsFinal}
          setShowEndGameDialog={setShowEndGameDialog}
        />}
        {showModelCredits && <ModelCredits setShowModelCredits={setShowModelCredits} />}

    </div>
  ) 

}