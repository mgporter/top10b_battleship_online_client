import { useState, useEffect, useContext, useRef, useReducer, useCallback, useMemo } from "react";
import { ApplicationState, PacketType, dialogBoxTypes, inGameMessages, playerListActions, shipStatsActions, MessageTypes } from '../enums';
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
import useSubscription from "../useSubscription.js";
import { setInGameMessagesContext } from "../InGameMessageProvider.js";
import useFullScreenDialog from "../useFullScreenDialog";
import OpponentShipsPlacedMinidialog from "./gamescreen/OpponentShipsPlacedMinidialog";

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



export default function GameContainer({
  roomNumberRef, 
  readyToAttackOpponent, 
  setReadyToAttackOpponent,
  gameStateData,
  setGameStateData,
  showOpponentPanels,
  setShowOpponentPanels
}) {


  const fullScreenDialog = useFullScreenDialog();
  // const [showNotEnoughPlayersDialog, setShowNotEnoughPlayersDialog] = useState(false);

  // const [playerShipsSunk, setPlayerShipsSunk] = useState(0);
  // const [opponentShipsSunk, setOpponentShipsSunk] = useState(0);

  const [attackResultPlayer, setAttackResultPlayer] = useState(null);
  const [attackResultOpponent, setAttackResultOpponent] = useState(null);
  const [showEndGameDialog, setShowEndGameDialog] = useState(true);
  const [showModelCredits, setShowModelCredits] = useState(false);

  const [shipStats, dispatchShipStats] = useReducer(shipStatsReducer, {
    playerShipsPlaced: 0,
    playerShipsSunk: 0,
    opponentShipsPlaced: 0,
    opponentShipsSunk: 0
  });

  const [players, dispatchPlayers] = useReducer(playerReducer, {
    playerOne: null,
    playerTwo: null,
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
  const gameContainerRef = useRef(null);


  const sendTo = useSocketSend();

  console.log("GAMECONTAINER RENDERED");

  const sendPacket = useCallback((type, data = null) => {

    const packet = {
      type: type
    }

    switch(type) {

      case PacketType.PLACED_SHIP: {
        packet["shipsPlacedCount"] = data;
        sendTo("/app/game/placeShip", packet);
        break;
      }

      case PacketType.PLACED_COMPLETE: {
        const packetizedShips = data.map((ship) => {
          const coordinates = ship.getLocation().map((coord) => {
            return {row: coord[0], col: coord[1]}
          })

          return {
            shipId: ship.getId(),
            type: ship.getType(),
            location: coordinates,
            direction: ship.getDirection()
          }
        })

        packet["placementList"] = packetizedShips;
        sendTo("/app/game/placementComplete", packet);
        fullScreenDialog.show(dialogBoxTypes.WAITINGFORPLACEMENT, shipStats.opponentShipsPlaced);
        break;
      }

      case PacketType.ATTACK: {
        packet["row"] = data[0];
        packet["col"] = data[1];
        sendTo("/app/game/attack", packet);
        break;
      }

      case PacketType.LOAD_ALL_DATA: {
        sendTo("/app/game/loadGameData", packet);
        break;
      }

      case PacketType.SAVESTATE: {
        sendTo("/app/game/saveState", packet);
        break;
      }
      
    }
  }, [sendTo, fullScreenDialog, shipStats]);
  
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
        if (!fromCurrentPlayer) {
          dispatchShipStats({type: shipStatsActions.SETOPPONENTSHIPSPLACED, data: message.shipsPlacedCount});
          // fullScreenDialog.show(dialogBoxTypes.WAITINGFORPLACEMENT, message.shipsPlacedCount);
          // setOpponentShipsPlaced(message.shipsPlacedCount);
        }
        break;
      }

      case PacketType.GAME_START: {
        console.log("GAME STARTING")
        fullScreenDialog.hide();
        setAppState(ApplicationState.SHIP_PLACEMENT);
        setInGameMessages(inGameMessages.WELCOME);
        break;
      }

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


  const updatePublicCallback = useSubscription(
    `/game/public/${roomNumberRef.current}`, 
    onPublicMessageReceived, 
    `game-public-${roomNumberRef.current}`);

  useEffect(() => {
    updatePublicCallback(onPublicMessageReceived)
  }, [updatePublicCallback, onPublicMessageReceived])


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


  const updatePrivateCallback = useSubscription(
    "/user/queue/game", 
    onPrivateMessageReceived, 
    "game-private-msg");

  useEffect(() => {
    updatePrivateCallback(onPrivateMessageReceived)
  }, [updatePrivateCallback, onPrivateMessageReceived])

  console.log("Player Stats")
  console.log(players);


  const showWinnerScreen = appState === ApplicationState.GAME_END ? true : false;
  const showOpponentShipsMinidialog = appState === ApplicationState.SHIP_PLACEMENT && !fullScreenDialog.shouldDisplay

  return (
    <div id="game-container" ref={gameContainerRef}>
      <RoomPanel 
        fullScreenDialog={fullScreenDialog} 
        sendPacket={sendPacket}
        players={players}
        dispatchPlayers={dispatchPlayers}
        dispatchShipStats={dispatchShipStats} />
      {fullScreenDialog.shouldDisplay && <FullScreenInfoDialog fullScreenDialog={fullScreenDialog} shipStats={shipStats} />}
      {showOpponentShipsMinidialog && <OpponentShipsPlacedMinidialog shipStats={shipStats}/>}
      <MessageArea 
        showEndGameButtons={!showEndGameDialog && showWinnerScreen}
        winner={players.winner}
        setShowEndGameDialog={setShowEndGameDialog} />
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