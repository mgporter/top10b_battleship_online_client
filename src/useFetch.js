import { useCallback, useState } from "react";
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
    } catch (e) {
      setError(e.message || "Unexpected Error fetching data");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const updateData = useCallback((newData) => {
    if (!loading && !error) setData(newData);
  }, [error, loading]);

  return [
    request,
    updateData,
    {
      data,
      loading,
      error
    }
  ]

}