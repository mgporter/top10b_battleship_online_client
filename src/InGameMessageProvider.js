import { createContext, useContext, useState } from "react"
import { inGameMessages as types, Avatars } from "./enums"
import { C } from "./Constants";
import { PlayerNameContext } from "./PlayerProvider";

export const setInGameMessagesContext = createContext(null);
export const inGameMessagesContext = createContext(null);

export default function InGameMessageProvider({children}) {

  const [inGameMessages, setInGameMessages] = useState([]);
  const playerName = useContext(PlayerNameContext);

  function createMessage(inGameMessageType, shipType = null) {
    let shipName;
    if (shipType) {
      shipName = C.ships[shipType].displayName;
    }

    const message = {
      avatar: Avatars.PLAYERCAPTAIN,
      sender: "Oliver Perry",
    }

    switch(inGameMessageType) {

      case types.WELCOME: {
        message.text = <div className='message-text'>Welcome to Battleship, General <span className="green">{playerName}</span>! I am Lieutenant Commander <span className="yellow">Oliver Hazard Perry</span>. Click on a ship to deploy it to the <span className="lightblue">board</span>.</div>
        break;
      }

      case types.FIRSTSHIPSELECTED: {
        message.text = <div className='message-text'>Now, place our <span className="yellow">{shipName}</span> somewhere the enemy will never think to look. You can rotate the ship's position with the <span className="lightblue">mousewheel</span> and <span className="lightblue">arrowkeys</span>.</div>
        break;
      }

      case types.SHIPSELECTED: {
        message.text = <div className='message-text'>Our <span className="yellow">{shipName}</span> is ready to deploy.</div>
        break;
      }

      case types.FIRSTSHIPPLACED: {
        message.text = <div className='message-text'>Our <span className="yellow">{shipName}</span> is in position, sir. You can also re-position it as necessary.</div>
        break;
      }

      case types.SHIPPLACED: {
        message.text = <div className='message-text'>Our <span className="yellow">{shipName}</span> has been positioned successfully, sir.</div>
        break;
      }

      case types.ALLSHIPSPLACED: {
        message.text = <div className='message-text'>Our <span className="yellow">{shipName}</span> has been deployed. All ships are now position, sir. You may <span className="lightblue">start the game</span> when ready.</div>
        break;
      }

      case types.STARTGAMEFIRSTATTACK: {
        message.text = <div className='message-text'>We have the <span className="green">first attack</span>. Click on the <span className="lightblue">small board</span> to fire our guns.</div>
        break;
      }

      case types.STARTGAMESECONDATTACK: {
        message.text = <div className='message-text'>It has begun. It looks like the enemy will strike first.</div>
        break;
      }

      case types.WAITINGONOPPONENTATTACK: {
        message.text = <div className='message-text'>Waiting on the enemy to strike, sir.</div>
        break;
      }

      case types.ATTACKMISSED: {
        message.text = <div className='message-text'>Our attack missed.</div>
        break;
      }

      case types.ATTACKHITSHIP: {
        message.text = <div className='message-text'>Good job, sir! We got a hit!</div>
        break;
      }

      case types.ATTACKSUNKSHIP: {
        message.text = <div className='message-text'>The enemy's <span className="red">{shipName}</span> has been sunk.</div>
        break;
      }

      case types.OPPONENTMISSED: {
        message.text = <div className='message-text'>They missed. We were lucky that time.</div>
        break;
      }

      case types.OPPONENTHITSHIP: {
        message.text = <div className='message-text'>All hands on deck, sir! Our <span className="yellow">{shipName}</span> has been hit.</div>
        break;
      }

      case types.OPPONENTSUNKSHIP: {
        message.text = <div className='message-text'>I'm sorry, sir. Our <span className="yellow">{shipName}</span> has been sunk.</div>
        break;
      }

    }

    setInGameMessages((prev) => [...prev, message]);

  }

  return (
    <setInGameMessagesContext.Provider value={createMessage}>
      <inGameMessagesContext.Provider value={inGameMessages}>
        {children}
      </inGameMessagesContext.Provider>
    </setInGameMessagesContext.Provider>

  )
}