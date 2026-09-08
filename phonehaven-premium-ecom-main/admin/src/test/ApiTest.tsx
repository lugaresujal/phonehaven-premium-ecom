import { useEffect, useState } from "react";
import { orderAPI } from "../services/api";

export function ApiTest() {
  const [message, setMessage] = useState("Testing API...");
  const [error, setError] = useState("");

  useEffect(() => {
    const testAPI = async () => {
      try {
        const data = await orderAPI.test();

        setMessage(data.message);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "API connection failed"
        );
      }
    };

    testAPI();
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h1>API Service Test</h1>

      {error ? (
        <p style={{ color: "red" }}>❌ {error}</p>
      ) : (
        <p style={{ color: "green" }}>✅ {message}</p>
      )}
    </div>
  );
}