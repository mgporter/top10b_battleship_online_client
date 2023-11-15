import { useEffect, useRef } from 'react';
import './messagewindow.css';

export default function MessageWindow({messages}) {

  const messageWindowRef = useRef(null);

  useEffect(() => {
    messageWindowRef.current.classList.add("slidein");
  }, [])

  const messagesRendered = messages.map((message, i) => {
    return <p key={i} style={{color: message.color}}>{message.message}</p>
  });

  return (
    <div ref={messageWindowRef} className="message-window">
      {messagesRendered}
    </div>
  )
}