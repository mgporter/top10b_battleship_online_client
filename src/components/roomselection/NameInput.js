import { useContext, useEffect, useRef, useState } from "react";
import { PlayerContext } from "../../PlayerProvider";
import useSocketSend from "../../useSocketSend";
import { MessageTypes } from "../../enums";

export default function NameInput() {

  const { playerName, setPlayerName } = useContext(PlayerContext); 
  const nameInputRef = useRef(null);
  const [localName, setLocalName] = useState(playerName);
  const sendPacket = useSocketSend();

  useEffect(() => {
    window.addEventListener("keydown", interceptEnter);
    return () => {
      window.removeEventListener("keydown", interceptEnter);
    }
  }, [])

  useEffect(() => {
    setLocalName(playerName);
  }, [playerName])

  function interceptEnter(e) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    nameInputRef.current.blur();
  }

  function handleNameChange(name) {
    localStorage.setItem("playerName", name);
    setLocalName(name);
  }

  function handleNameChangeOnBlur(e) {
    let name = e.target.value;
    if (name === "") name = "Player";
    setPlayerName(name);
    handleNameChange(name);
    sendPacket(MessageTypes.CHANGENAME, name);
  }

  return (
    <div id="room-selection-name-box">
      <p>My name:</p>
      <fieldset>
        <input 
          ref={nameInputRef}
          type="text"
          spellCheck="false" 
          required
          pattern="[0-9A-Za-z_\-#]+"
          id="player-name-input" 
          maxLength="24"
          value={localName || "Player"}
          onChange={(e) => handleNameChange(e.target.value)}
          onBlur={handleNameChangeOnBlur} />
        </fieldset>
    </div>
  )
}