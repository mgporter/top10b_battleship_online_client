import { useState } from "react";
import { C } from "./Constants";

export default function useFetch(endpoint) {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const request = async function getRequest() {
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
  };

  function updateData(newData) {
    console.log(loading, error)
    if (!loading && !error) setData(newData);
  }

  return {
    request,
    data,
    loading,
    error,
    updateData
  }

}