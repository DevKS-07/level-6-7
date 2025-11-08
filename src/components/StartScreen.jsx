import React, { useEffect, useState, useRef } from "react";

const StartScreen = ({ onStart }) => {
  const [flicker, setFlicker] = useState(false);
  const [message, setMessage] = useState("Press 6 or 7 to continue.");

  const audioRef2 = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // Initialize audio and play looped spooky sound
    audioRef.current = new Audio("/sounds/vsauce.mp3");
    audioRef.current.loop = false;
    audioRef.current.volume = 0.8;
    audioRef.current.play().catch(() => {
      // Autoplay might be blocked, ignore error
    });

    return () => {
      // Stop audio on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Initialize audio and play looped spooky sound
    audioRef2.current = new Audio("/sounds/startBg.mp3");
    audioRef2.current.loop = true;
    audioRef2.current.volume = 0.8;
    audioRef2.current.play().catch(() => {
      // Autoplay might be blocked, ignore error
    });

    return () => {
      // Stop audio on unmount
      if (audioRef2.current) {
        audioRef2.current.pause();
        audioRef2.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const flickerInterval = setInterval(() => {
      setFlicker((f) => !f);
    }, 500);

    const handleKeyDown = (e) => {
      if (e.key === "6" || e.key === "7") {
        onStart();
      } else {
        setMessage("Nope! Press 6 or 7 to continue...");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearInterval(flickerInterval);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onStart]);

  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: "#000",
        color: flicker ? "#0f0" : "#080",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Courier New', Courier, monospace",
        userSelect: "none",
        textAlign: "center",
        padding: "0 20px",
      }}
    >
      <h1
        style={{
          fontSize: "5rem",
          marginBottom: "1rem",
          textShadow: flicker ? "0 0 10px #0f0, 0 0 20px #0f0" : "none",
          transition: "color 0.3s",
        }}
      >
        LEVEL 6-7
      </h1>

      <p style={{ fontSize: "1.5rem", maxWidth: 600, marginBottom: 40 }}>
        You wake up mid-game on <i>Level 6-7.</i>
      </p>
      <p style={{ fontSize: "1.2rem", maxWidth: 600, marginBottom: 40 }}>
        Everything feels wrong — physics glitch, text flickers, and a distorted
        voice occasionally whispers: <b>“six-seven.”</b>
      </p>

      <p style={{ fontSize: "1.3rem", opacity: 0.8, fontWeight: "bold" }}>
        {message}
      </p>
    </div>
  );
};

export default StartScreen;
