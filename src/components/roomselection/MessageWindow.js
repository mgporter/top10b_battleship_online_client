import './messagewindow.css';

export default function MessageWindow({messages, transitionStatus}) {

  const messagesRendered = messages.map((message, i) => {
    return <p key={i} style={{color: message.color}}>{message.message}</p>
  });

  return (
    <div className={`message-window ${transitionStatus}`}>
      {messagesRendered}
    </div>
  )
}