import ShipHealthContainer from "./ShipHealthContainer";
import './shiphealthpanel.css';
import { C } from "../../Constants";
import { useRef } from "react";

export default function ShipHealthPanel({shipsPlaced, shipStats}) {

  // useEffect(() => {
  //   shipHealthPanelRef.current.classList.add("slidein");
  // }, [])

  const shipHealthPanelRef = useRef(null);

  const healthContainers = shipsPlaced.map((ship) => {
    return <ShipHealthContainer key={ship.getId()} ship={ship} />
  });

  return (
      <div ref={shipHealthPanelRef} className="section-block left-panel ship-health-panel">
        <h3>Fleet Status</h3>
        <p><span className="ships-remaining">{C.totalShips - shipStats.playerShipsSunk}</span> of <span className="ships-total">{C.totalShips}</span> ships remaining.</p>
        <div className="fleet-health-container">
          {healthContainers}
        </div>
      </div>
  )
}