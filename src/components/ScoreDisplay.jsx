import React, { useEffect, useState } from "react";

const ScoreDisplay = ({ score }) => {
  const [flicker, setFlicker] = useState(false);

  useEffect(() => {
    if (score === 67) {
      // Flicker on max score
      const interval = setInterval(() => {
        setFlicker((f) => !f);
      }, 300);
      return () => clearInterval(interval);
    } else {
      setFlicker(false);
    }
  }, [score]);

  return (
    <div
      style={{
        fontSize: "28px",
        color: flicker ? "#f00" : "#0f0",
        fontFamily: "'Courier New', Courier, monospace",
        userSelect: "none",
        transition: "color 0.2s",
      }}
    >
      Score: {score}
    </div>
  );
};

export default ScoreDisplay;
