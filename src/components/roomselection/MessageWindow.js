import { useContext, useEffect, useRef } from 'react';
import './messagewindow.css';
import { PlayerContext } from '../../PlayerProvider';
import { LobbyColors } from '../../enums';

export default function MessageWindow({messages, setMessages}) {

  const { playerName } = useContext(PlayerContext);

  const messageWindowRef = useRef(null);

  useEffect(() => {
    messageWindowRef.current.classList.add("slidein");
  }, [])

  useEffect(() => {
    if (!playerName) return;
    const changeNameMessage = {
      message: `You are now known as ${playerName}.`,
      color: LobbyColors.playerJoin,
    }
    setMessages(prev => [...prev, changeNameMessage])
  }, [playerName, setMessages])

  const messagesRendered = messages.map((message, i) => {
    return <p key={i} style={{color: message.color}}>{message.message}</p>
  });

  return (
    <div ref={messageWindowRef} className="message-window">
      {messagesRendered}
    </div>
  )
}