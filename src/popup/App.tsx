import { useEffect, useState } from "react";
import { getHint } from "../services/ai";
import type { ProblemData } from "../shared/types";
import "./App.css";

function App() {
  const [problem, setProblem] = useState<ProblemData | null>(null);
  const [hint, setHint] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    chrome.storage.local.get("problemData", (result) => {
      console.log("Popup received:", result.problemData);

      if (result.problemData) {
        const problemData = result.problemData as ProblemData;
        setProblem(problemData);
      }
    });
  }, []);

  const handleGetHint = async () => {
    if (!problem) return;

    setLoading(true);
    setHint("");

    try {
      const result = await getHint(problem);
      setHint(result);
    } catch (error) {
      console.error("Hint generation failed:", error);

  setHint(
    error instanceof Error
      ? error.message
      : "Failed to generate hint."
  );
  
    } finally {
      setLoading(false);
    }
  };

  if (!problem) {
    return <div>No problem data found.</div>;
  }

  return (
    <div className="popup-container">

      <button onClick={handleGetHint} disabled={loading}>
        {loading ? "Thinking..." : "💡 Get Hint"}
      </button>

      {hint && (
        <div>
          <h2>💡 Hint</h2>
          <p>{hint}</p>
        </div>
      )}

    </div>
  );
}

export default App;
