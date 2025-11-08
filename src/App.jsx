import React, { useState } from "react";
import StartScreen from "./components/StartScreen.jsx";
import PhaserGame from "./components/PhaserGame.jsx";
import Level68Void from "./components/Level68Void.jsx";

const App = () => {
  const [started, setStarted] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const handleScoreUpdate = (score) => {
    if (score >= 67) setShowExitModal(true);
  };

  const handleEscape = () => {
    setShowExitModal(false);
    setStarted(false);
  };

  return (
    <div
      style={{
        textAlign: "center",
        backgroundColor: "#000",
        color: "#0f0",
        height: "100vh",
        userSelect: "none",
        paddingTop: 20,
      }}
    >
      {!started ? (
        <StartScreen onStart={() => setStarted(true)} />
      ) : (
        <>
          <h1 style={{ fontFamily: "'Courier New', monospace" }}>LEVEL 6-7</h1>
          {!showExitModal && <PhaserGame onScoreUpdate={handleScoreUpdate} />}

          {showExitModal && (
            <Level68Void
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(5,5,5,0.9)",
                zIndex: 1000,
              }}
              onEscape={handleEscape}
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;
