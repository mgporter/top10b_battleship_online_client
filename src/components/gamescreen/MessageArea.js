import avatar1 from '../../images/avatar_1.png';
import './messagearea.css';
import { useEffect } from 'react';
import { C } from '../../Constants';

export default function MessageArea({mainMessages, setMainMessages}) {

  useEffect(() => {
    
    if (mainMessages.length == 0) return;

    const timeout = setTimeout(() => {
      setMainMessages((prev) => prev.slice(1));
    }, C.messageDuration);
    
    return () => {
      clearTimeout(timeout);
    }

  }, [mainMessages]);

  if (mainMessages.length == 0) return <div className="section-block message-area"></div>;

  const nextMessage = mainMessages[0];

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