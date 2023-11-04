import { ApplicationState, PacketType, ShipType } from '../../enums';
import { C } from '../../Constants';
import './leftpanel.css';
import './shipplacementpanel.css';
import { AppStateContext, SetAppStateContext } from '../../AppStateProvider';
import { useContext } from 'react';

export default function ShipPlacementPanel({setShipClicked, leftPanelFlash, shipsPlaced, sendPacket}) {

  const appState = useContext(AppStateContext);
  const setAppState = useContext(SetAppStateContext);

  const shipIcons = Object.values(ShipType).map((shiptype) => {
    const placed = shipsPlaced.filter(ship => ship.getType() === shiptype).map(s => s.isPlaced())[0];
    return (
      <label 
        key={shiptype}
        className={placed ? "ship-placed" : ""} 
        htmlFor={shiptype} 
        onClick={() => setShipClicked(shiptype)}>
        <input type="radio" id={shiptype} name="addship" value={shiptype} />
        <img 
          src={C.ships[shiptype].sideimg} 
          className='ship-placement-image' 
          alt={C.ships[shiptype].displayName} 
          style={{width: `${C.ships[shiptype].size * 20}%`}} />
        {placed && <div className='ship-placed'>✓</div>}
      </label>
    )
  })

  function handleGameStart() {
    sendPacket(PacketType.PLACED_COMPLETE, shipsPlaced)
    setAppState(ApplicationState.SHIPS_PLACED_AND_STARTED)
    // setAppState(ApplicationState.ATTACK_PHASE)
  }

  const allPlaced = shipsPlaced.length === Object.values(ShipType).length;
  const flash = (appState === ApplicationState.SHIP_PLACEMENT) && leftPanelFlash ? true : false;

  return (
      <div className={`section-block left-panel placement-panel ${flash && "boardflash"}`}>
        <h3>Add your ships</h3>
        <p>Select a ship, then click on a cell to add it to the board. Use the mousewheel or arrowkeys to rotate.</p>
        <fieldset id="addShipSelection">
          {shipIcons}
        </fieldset>
        {allPlaced && 
          <button 
            onClick={handleGameStart} 
            className={`start-game-button hidden ${appState !== ApplicationState.SHIPS_PLACED_AND_STARTED && "start-button-strobe"}`}>Start!
          </button>}
      </div>
  )
}