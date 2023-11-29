import './messagearea.css';
import { useContext } from 'react';
import { C } from '../../Constants';
import OpenWinnerScreenComponent from './OpenWinnerScreenComponent';
import { inGameMessagesContext } from '../../InGameMessageProvider';

export default function MessageArea({showEndGameButtons, winner, setShowEndGameDialog}) {

  const inGameMessages = useContext(inGameMessagesContext);

  if (inGameMessages.length == 0) return <div className="section-block message-area"></div>;

  const lastMessage = inGameMessages[inGameMessages.length - 1];

  
  if (showEndGameButtons) {
    return (
      <div className="section-block message-area">
        <OpenWinnerScreenComponent winner={winner} setShowEndGameDialog={setShowEndGameDialog} />
      </div>
    )
  }

  return (
    <div className="section-block message-area">
      <div className='sender-info'>
        <img src={C.avatars[lastMessage.avatar]} height="40" width="40" />
        <p>{lastMessage.sender}</p>
      </div>
      {lastMessage.text}
    </div>
  )
}