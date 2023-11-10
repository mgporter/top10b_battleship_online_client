import avatar1 from '../../images/avatar_1.png';
import './messagearea.css';
import { useEffect } from 'react';
import { C } from '../../Constants';
import OpenWinnerScreenComponent from './OpenWinnerScreenComponent';

export default function MessageArea({mainMessages, setMainMessages, showEndGameButtons, winner, setShowEndGameDialog}) {

  useEffect(() => {
    
    if (mainMessages.length == 0) return;

    const timeout = setTimeout(() => {
      setMainMessages((prev) => prev.slice(1));
    }, C.messageDuration);
    
    return () => {
      clearTimeout(timeout);
    }

  }, [mainMessages]);

  const nextMessage = mainMessages[0];
  
  if (showEndGameButtons) {
    return (
      <div className="section-block message-area">
        <OpenWinnerScreenComponent winner={winner} setShowEndGameDialog={setShowEndGameDialog} />
      </div>
    )
  }

  if (mainMessages.length == 0) return <div className="section-block message-area"></div>;

  // senders: your own commander (to report result of enemy attack on you), the system (player join/leave), enemy (report your result on them)

  return (
    <div className="section-block message-area">
      <div className='sender-info'>
        <img src={C.avatars[nextMessage.avatar]} height="40" width="40" />
        <p>{nextMessage.sender}</p>
      </div>
      <div className='message-text' style={{color: nextMessage.color}}>{nextMessage.text}</div>
    </div>
  )
}