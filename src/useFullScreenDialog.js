import { useCallback, useMemo, useState } from "react";

export default function useFullScreenDialog(initialState = null) {

  const [shouldDisplay, SetShouldDisplay] = useState(Boolean(initialState));
  const [messageType, setMessageType] = useState(initialState);
  const [data, setData] = useState(null);

  const show = useCallback((type, data = null) => {
    setMessageType(type);
    setData(data);
    SetShouldDisplay(true);
  }, []);

  const hide = useCallback(() => {
    SetShouldDisplay(false);
  }, []);

  const fullScreenDialogObject = useMemo(() => {
    return {
      show,
      hide,
      shouldDisplay,
      type: messageType,
      data: data
    }
  }, [show, hide, shouldDisplay, messageType, data]);

  return fullScreenDialogObject;

}