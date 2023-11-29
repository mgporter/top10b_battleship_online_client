import { ApplicationState, PacketType, ShipType, Events } from '../../enums';
import { C } from '../../Constants';
import './leftpanel.css';
import './shipplacementpanel.css';
import { AppStateContext } from '../../AppStateProvider';
import { useContext, useRef } from 'react';
import EventEmitter from '../../EventEmitter';

export default function ShipPlacementPanel({
  setShipClicked, 
  leftPanelFlash, 
  shipsPlaced, 
  sendPacket
}) {

  const appState = useContext(AppStateContext);
  const shipPlacementPanelRef = useRef(null);
  const showShipPlacementPanel = 
    appState === ApplicationState.SHIP_PLACEMENT ||
    appState === ApplicationState.SHIPS_PLACED_AND_STARTED;

  function handleShipClick(shipType) {
    setShipClicked(shipType);
  }

  const shipIcons = Object.values(ShipType).map((shiptype) => {
    const placed = shipsPlaced.current.filter(ship => ship.getType() === shiptype).map(s => s.isPlaced())[0];
    return (
      <label 
        key={shiptype}
        className={placed ? "ship-placed" : ""} 
        htmlFor={shiptype} 
        onClick={() => handleShipClick(shiptype)}>
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
    sendPacket(PacketType.PLACED_COMPLETE, shipsPlaced.current);
    EventEmitter.dispatch(Events.PLACEMENTSSUBMITTED);
  }

  const allPlaced = shipsPlaced.current.length === Object.values(ShipType).length;
  const flash = (appState === ApplicationState.SHIP_PLACEMENT) && leftPanelFlash ? true : false;

  return (
      <div ref={shipPlacementPanelRef} 
        className={`section-block left-panel placement-panel 
          ${flash ? "boardflash" : ""} 
          ${showShipPlacementPanel ? "slidein" : ""}`}>
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