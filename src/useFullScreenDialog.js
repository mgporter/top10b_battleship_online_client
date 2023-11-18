import { useState } from "react";

export default function useFullScreenDialog() {

  const [shouldDisplay, SetShouldDisplay] = useState(false);
  const [messageType, setMessageType] = useState(null);
  const [data, setData] = useState(null);

  function show(type, data = null) {
    setMessageType(type);
    setData(data);
    SetShouldDisplay(true);
  }

  function hide() {
    SetShouldDisplay(false);
  }

  return {
    show,
    hide,
    shouldDisplay,
    type: messageType,
    data: data
  }

}