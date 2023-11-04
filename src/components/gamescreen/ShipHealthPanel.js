import ShipHealthContainer from "./ShipHealthContainer";
import './shiphealthpanel.css';
import { C } from "../../Constants";

export default function ShipHealthPanel({shipsPlaced, playerShipsSunk}) {

  const healthContainers = shipsPlaced.map((ship) => {
    return <ShipHealthContainer key={ship.getId()} ship={ship} />
  });

  return (
      <div className="section-block left-panel ship-health-panel">
        <h3>Fleet Status</h3>
        <p><span className="ships-remaining">{C.totalShips - playerShipsSunk}</span> of <span className="ships-total">{C.totalShips}</span> ships remaining.</p>
        <div className="fleet-health-container">
          {healthContainers}
        </div>
      </div>
  )
}