import React, { useState, useEffect, useRef } from "react";

const glitchTexts = [
  "Level 68 loading... ???",
  "Error 0x6-0x7: Reality not found.",
  "Congrats! You've reached the pinnacle of confusion. Your reality is unstable. Press 6 or 7 to stabilize... or stay trapped forever",
];

const Level68Void = ({ onEscape }) => {
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);

  const audioRef = useRef(null);

  // const audioRef2 = useRef(null);

  // useEffect(() => {
  //   // Initialize audio and play looped spooky sound
  //   audioRef2.current = new Audio("/sounds/error.mp3");
  //   audioRef2.current.loop = true;
  //   audioRef2.current.volume = 0.8;
  //   audioRef2.current.play().catch(() => {
  //     // Autoplay might be blocked, ignore error
  //   });

  //   return () => {
  //     // Stop audio on unmount
  //     if (audioRef2.current) {
  //       audioRef2.current.pause();
  //       audioRef2.current = null;
  //     }
  //   };
  // }, []);

  // const audioRef3 = useRef(null);

  // useEffect(() => {
  //   // Initialize audio and play looped spooky sound
  //   audioRef3.current = new Audio("/sounds/error.mp3");
  //   audioRef3.current.loop = true;
  //   audioRef3.current.volume = 0.8;
  //   audioRef3.current.play().catch(() => {
  //     // Autoplay might be blocked, ignore error
  //   });

  //   return () => {
  //     // Stop audio on unmount
  //     if (audioRef3.current) {
  //       audioRef3.current.pause();
  //       audioRef3.current = null;
  //     }
  //   };
  // }, []);

  useEffect(() => {
    // Initialize audio and play looped spooky sound
    audioRef.current = new Audio("/sounds/cat-laugh.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
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
    const interval = setInterval(() => {
      setDisplayText((prev) =>
        prev.length < glitchTexts[index].length
          ? glitchTexts[index].slice(0, prev.length + 1)
          : prev
      );

      // Initialize audio and play looped spooky sound
      audioRef2.current = new Audio("/sounds/error.mp3");
      audioRef2.current.loop = true;
      audioRef2.current.volume = 0.8;
      audioRef2.current.play().catch(() => {
        // Autoplay might be blocked, ignore error
      });

      if (displayText === glitchTexts[index]) {
        clearInterval(interval);
        setTimeout(() => {
          setIndex((i) => (i + 1) % glitchTexts.length);
          setDisplayText("");
        }, 1500);
      }
      return () => {
        // Stop audio on unmount
        if (audioRef2.current) {
          audioRef2.current.pause();
          audioRef2.current = null;
        }
      };
    }, 50);

    return () => clearInterval(interval);
  }, [displayText, index]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "6" || e.key === "7") {
        onEscape();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onEscape]);

  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: "#050005",
        color: "#0f0",
        fontFamily: "'Courier New', monospace",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "2rem",
        userSelect: "none",
        textAlign: "center",
        padding: "20px",
        filter: "drop-shadow(0 0 10px #0f0)",
      }}
    >
      <p style={{ maxWidth: 600, whiteSpace: "pre-line" }}>{displayText}</p>
    </div>
  );
};

export default Level68Void;
