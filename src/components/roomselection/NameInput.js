import { useContext } from "react";
import { PlayerNameContext, SetPlayerNameContext } from "../../PlayerProvider";

export default function NameInput({updateNameOnServer}) {

  const setPlayerName = useContext(SetPlayerNameContext);
  const playerName = useContext(PlayerNameContext);

  function handleNameChange(e) {
    localStorage.setItem("playerName", e.target.value);
    setPlayerName(e.target.value);
  }

  return (
    <div id="room-selection-name-box">
      <p>My name:</p>
      <textarea 
        spellCheck="false" 
        required
        pattern="[0-9A-Za-z]"
        rows="1" 
        id="player-name-input" 
        maxLength="24"
        value={playerName || "Player"}
        onChange={handleNameChange}
        onBlur={updateNameOnServer}></textarea>
    </div>
  )
}