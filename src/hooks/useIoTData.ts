import { useState } from "react";

const useIoTData = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const sendData = async (payload: any) => {
    try {
      setLoading(true);
      console.log("Sending data to IoT device:", payload);
      // Simulate a delay for sending data
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      throw err;
    }
  };

  const fetchDustbinStatus = async () => {
    try {
      setLoading(true);
      console.log("Fetching dustbin status...");
      // Simulate a delay for fetching status
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const status = "Dustbin is operational and ready.";
      setLoading(false);
      return status;
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      throw err;
    }
  };

  return { data, error, loading, sendData, fetchDustbinStatus };
};

export default useIoTData;