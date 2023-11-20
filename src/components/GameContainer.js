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
  roomNumberRef, 
  gameStateData,
  setGameStateData,
}) {

  console.log("GameContainer");

  const gameContainerRef = useRef(null);

  const fullScreenDialog = useFullScreenDialog(dialogBoxTypes.LOADINGMODELS);
  const [gameLoaded, setGameLoaded] = useState(false);

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


  // /**
  //  * Listen for updates to the players in the room and the appropriate
  //  * dialog if there are not enough players. Otherwise, if there are
  //  * two players, move the game to the SHIP_PLACEMENT state. */

  useEffect(() => {
    EventEmitter.subscribe(Events.NOTENOUGHPLAYERS, "GameCon", handleNotEnoughPlayers);
    EventEmitter.subscribe(Events.GAMEROOMLOADED, "GameCon", handleGameRoomLoaded);
    EventEmitter.subscribe(Events.PLACEMENTSSUBMITTED, "GameCon", handlePlacementsSubmitted);

    return () => {
      EventEmitter.unsubscribe(Events.NOTENOUGHPLAYERS, "GameCon");
      EventEmitter.unsubscribe(Events.GAMEROOMLOADED, "GameCon");
      EventEmitter.unsubscribe(Events.PLACEMENTSSUBMITTED, "GameCon");
    }
  }, [handleNotEnoughPlayers, handleGameRoomLoaded, handlePlacementsSubmitted])

  function handleNotEnoughPlayers() {
    if (appState === ApplicationState.SHIPS_PLACED_AND_STARTED ||
      appState === ApplicationState.SHIP_PLACEMENT) {
      dispatchShipStats({type: shipStatsActions.SETOPPONENTSHIPSPLACED, data: 0});
    }
    if (appState >= ApplicationState.SHIP_PLACEMENT &&
      appState != ApplicationState.GAME_END) {
        fullScreenDialog.show(dialogBoxTypes.PLAYERLEFT);
      }
  }

  function handleGameRoomLoaded() {
    sendPacket(PacketType.GAMEROOMLOADED);
    setGameLoaded(true);
  }

  function handlePlacementsSubmitted() {
    setAppState(ApplicationState.SHIPS_PLACED_AND_STARTED);
    fullScreenDialog.show(dialogBoxTypes.WAITINGFORPLACEMENT, shipStats.opponentShipsPlaced);
  }



  // useEffect(() => {
    
  //   if (!players.atLeastTwoPlayers &&
  //     appState >= ApplicationState.SHIP_PLACEMENT &&
  //     appState != ApplicationState.GAME_END) {
  //       fullScreenDialog.show(dialogBoxTypes.PLAYERLEFT);
  //   }

  // }, [appState, players, fullScreenDialog, setAppState])

  // useEffect(() => {
  //   if (appState === ApplicationState.GAME_INITIALIZED && gameLoaded) 
  //     sendPacket(PacketType.GAMEROOMLOADED);
  // }, [gameLoaded, sendPacket, appState])

  // useEffect(() => {
  //   if (appState === ApplicationState.SHIPS_PLACED_AND_STARTED) {
  //     fullScreenDialog.show(dialogBoxTypes.WAITINGFORPLACEMENT, shipStats.opponentShipsPlaced);
  //   }
  // }, [appState, fullScreenDialog, shipStats])


// When the placed_complete packet is sent, do this also!
  //         fullScreenDialog.show(dialogBoxTypes.WAITINGFORPLACEMENT, shipStats.opponentShipsPlaced);
  
  const onPublicMessageReceived = useCallback((payload) => {
    const message = JSON.parse(payload.body);
    const fromCurrentPlayer = message.playerId === playerId;


    switch(message.type) {

      case PacketType.ATTACK: {
        if (fromCurrentPlayer) {
          setAttackResultPlayer(message);
        } else {
          setAttackResultOpponent(message);
          setReadyToAttackOpponent(true);
        }
        break;
      }

      case PacketType.PLACED_SHIP: {
        if (!fromCurrentPlayer) 
          dispatchShipStats({type: shipStatsActions.SETOPPONENTSHIPSPLACED, data: message.shipsPlacedCount});
        break;
      }

      /**
       * When there are two players in the room and all models have been loaded,
       * The game moves to the SHIP_PLACEMENT state.*/

      case PacketType.GAME_START: {
        fullScreenDialog.hide();
        setAppState(ApplicationState.SHIP_PLACEMENT);
        setInGameMessages(inGameMessages.WELCOME);
        break;
      }

      /*  */

      case PacketType.PLACED_COMPLETE: {
        sendPacket(PacketType.LOAD_ALL_DATA);
        break;
      }

      case PacketType.GAME_ATTACK_PHASE_START: {
        setAppState(ApplicationState.ATTACK_PHASE);
        fullScreenDialog.hide();
        console.log("current player id: " + playerId);
        console.log(playerId === players.playerOne)
        if (playerId === players.playerOne) {
          setInGameMessages(inGameMessages.STARTGAMEFIRSTATTACK);
          setReadyToAttackOpponent(true);
        } else {
          setInGameMessages(inGameMessages.STARTGAMESECONDATTACK);
        }
        setTimeout(() => {
          setShowOpponentPanels(true);
        }, 400)
        break;
      }

      case PacketType.ATTACK_ALLSUNK: {
        dispatchPlayers({type: playerListActions.SETWINNER, data: message.playerId});
        setReadyToAttackOpponent(false);
        setTimeout(() => {        // Give a slight delay in order to let the final boardping animation play
          setAppState(ApplicationState.GAME_END);
        }, 1200)
        break;
      }

    }
  }, [
    players, 
    sendPacket, 
    playerId, 
    setAppState, 
    setInGameMessages, 
    setReadyToAttackOpponent, 
    setShowOpponentPanels, 
    fullScreenDialog
  ]);


  useSubscription(`/game/public/${roomNumberRef.current}`, onPublicMessageReceived, `game-public-${roomNumberRef.current}`);


  const onPrivateMessageReceived = useCallback((payload) => {
    const message = JSON.parse(payload.body);

    switch(message.type) {

      case MessageTypes.LOAD_ALL_DATA: {
        window.addEventListener("all_models_loaded", () => {
          console.log("All models loaded event received")

          setGameStateData(message);
          setAppState(ApplicationState.ATTACK_PHASE);
          if (message.goFirst) {
            setReadyToAttackOpponent(true);
            setInGameMessages(inGameMessages.STARTGAMEFIRSTATTACK);
          } else {
            setReadyToAttackOpponent(false);
            setInGameMessages(inGameMessages.STARTGAMESECONDATTACK);
          }
          setShowOpponentPanels(true);

        }, {once: true})
        break;
      }
    }
  }, [setAppState, setGameStateData, setReadyToAttackOpponent, setInGameMessages, setShowOpponentPanels])

  useSubscription("/user/queue/game", onPrivateMessageReceived, "game-private-msg");

  const showWinnerScreen = appState === ApplicationState.GAME_END ? true : false;
  const showOpponentShipsMinidialog = appState === ApplicationState.SHIP_PLACEMENT && !fullScreenDialog.shouldDisplay;



  return (
    <div id="game-container" ref={gameContainerRef}>
      {/* <button onClick={() => {SETTEST(!TEST)}}>PRESS ME</button> */}
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
          gameStateData={gameStateData}
        />
      {gameLoaded && <RoomPanel 
        fullScreenDialog={fullScreenDialog} 
        sendPacket={sendPacket}
        players={players}
        dispatchPlayers={dispatchPlayers}
        dispatchShipStats={dispatchShipStats}
        gameLoaded={gameLoaded} />}
      {showOpponentShipsMinidialog && <OpponentShipsPlacedMinidialog shipStats={shipStats} />}
        <MessageArea 
          showEndGameButtons={!showEndGameDialog && showWinnerScreen}
          winner={players.winner}
          setShowEndGameDialog={setShowEndGameDialog} />
        <CreditsBlock setShowModelCredits={setShowModelCredits} />
        {showOpponentPanels && (
          <>
            <OpponentBoard 
              dispatchBattleStats={dispatchBattleStats}
              readyToAttackOpponent={readyToAttackOpponent}
              setReadyToAttackOpponent={setReadyToAttackOpponent}
              sendPacket={sendPacket}
              attackResultPlayer={attackResultPlayer}
              shipStats={shipStats}
              dispatchShipStats={dispatchShipStats}
              gameStateData={gameStateData}
            />
            <BottomRightPanel 
              battleStats={battleStats} 
              gameTimeSecondsFinal={gameTimeSecondsFinal}
              />
          </>
        )}
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