import { useCallback, useMemo, useState } from "react";
import { C } from "./Constants";

export default function useFetch(endpoint) {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const request = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(C.serverPrefix + endpoint);
      const resultParsed = await response.json();
      setData(resultParsed);
      console.log("UseFetch " + endpoint)
    } catch (e) {
      setError(e.message || "Unexpected Error fetching data");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const info = useMemo(() => {
    return {
      data,
      loading,
      error
    }
  }, [data, loading, error])

  return [
    request,
    setData,
    info
  ]

}