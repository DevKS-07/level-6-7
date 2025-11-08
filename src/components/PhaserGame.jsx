import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";

const MergedPhaserGame = ({ onScoreUpdate }) => {
  const gameRef = useRef(null);
  const [glitching, setGlitching] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: "phaser-container",
      physics: {
        default: "arcade",
        arcade: { gravity: { y: 300 }, debug: false },
      },
      scene: { preload, create, update },
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    let player,
      cursors,
      platforms,
      movingPlatforms,
      spikes,
      coins,
      trickStar,
      score = 0,
      scoreText,
      gameOver = false,
      gameOverText,
      gravityTimer;

    // === PRELOAD ===
    function preload() {
      this.load.image(
        "platform",
        "https://labs.phaser.io/assets/sprites/platform.png"
      );
      this.load.image(
        "player",
        "https://labs.phaser.io/assets/sprites/phaser-dude.png"
      );
      this.load.image(
        "coin6",
        "https://labs.phaser.io/assets/sprites/blue_ball.png"
      );
      this.load.image(
        "coin7",
        "https://labs.phaser.io/assets/sprites/yellow_ball.png"
      );
      this.load.image("star", "https://labs.phaser.io/assets/sprites/star.png");
      this.load.image(
        "spike",
        "https://labs.phaser.io/assets/sprites/spike.png"
      );
    }

    // === CREATE ===
    function create() {
      createLevel.call(this);

      // Moving platforms
      movingPlatforms = this.physics.add.group({
        allowGravity: false,
        immovable: true,
      });
      const movingPlatform = movingPlatforms
        .create(400, 350, "platform")
        .setScale(0.5)
        .refreshBody();
      this.tweens.add({
        targets: movingPlatform,
        x: 600,
        ease: "Sine.easeInOut",
        duration: 3000,
        yoyo: true,
        repeat: -1,
      });

      // Spikes
      spikes = this.physics.add.staticGroup();
      spikes.create(300, 560, "spike").setScale(0.5).refreshBody();

      // Player
      player = this.physics.add.sprite(100, 450, "player");
      player.setBounce(0.2);
      player.setCollideWorldBounds(true);

      // Colliders
      this.physics.add.collider(player, platforms);
      this.physics.add.collider(player, movingPlatforms);
      this.physics.add.collider(movingPlatforms, platforms);

      this.physics.add.collider(player, spikes, () => {
        resetLevel.call(this);
      });

      cursors = this.input.keyboard.createCursorKeys();

      // Coins
      coins = this.physics.add.group();
      spawnCoins.call(this);
      this.physics.add.collider(coins, platforms);

      // Trick Star (Game Over trigger)
      trickStar = this.physics.add.group({
        key: "star",
        repeat: 0,
        setXY: { x: 400, y: 0 },
      });
      const STAR_SCALE = 0.35;
      trickStar.children.iterate((child) => {
        child.setScale(STAR_SCALE);
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

        // Disappear star after ~6.7s
        setTimeout(() => {
          trickStar.children.iterate((c) => c.disableBody(true, true));
        }, 6700);
      });
      this.physics.add.collider(trickStar, platforms);

      // Overlaps
      this.physics.add.overlap(player, coins, collectCoin, null, this);
      this.physics.add.overlap(player, trickStar, collectTrickStar, null, this);

      // Score text
      scoreText = this.add.text(16, 16, "Score: 0", {
        fontSize: "24px",
        fill: "#0f0",
      });

      // Random gravity variation timer
      gravityTimer = this.time.addEvent({
        delay: 3000,
        loop: true,
        callback: () => {
          const baseGravity = 300;
          const variation = Phaser.Math.FloatBetween(0.9, 1.1);
          this.physics.world.gravity.y = baseGravity * variation;
        },
      });
    }

    // === UPDATE ===
    function update() {
      if (gameOver || !cursors) return;

      if (cursors.left.isDown) player.setVelocityX(-300);
      else if (cursors.right.isDown) player.setVelocityX(300);
      else player.setVelocityX(0);

      if (cursors.up.isDown && player.body.touching.down)
        player.setVelocityY(-300);

      introduceRandomMovement();

      // Occasional random gravity glitch
      if (Phaser.Math.Between(0, 1000) < 3) {
        this.physics.world.gravity.y = Phaser.Math.Between(100, 600);
      }
    }

    // === HELPERS ===
    function createLevel() {
      if (platforms) platforms.clear(true, true);
      platforms = this.physics.add.staticGroup();
      const baseY = 580;
      for (let i = 0; i < 20; i++) {
        const x = 100 + i * 150 + Phaser.Math.Between(-40, 40);
        const y = baseY - i * 100 + Phaser.Math.Between(-25, 25);
        platforms.create(x, y, "platform").setScale(0.5).refreshBody();
      }
    }

    function spawnCoins() {
      if (coins) coins.clear(true, true);
      coins = this.physics.add.group();
      const noOfCoins = 80;
      for (let i = 0; i < noOfCoins; i++) {
        const coinType = Phaser.Math.Between(0, 7) === 0 ? "coin6" : "coin7";
        const x = Phaser.Math.Between(50, 750);
        const y = Phaser.Math.Between(50, 400);
        coins
          .create(x, y, coinType)
          .setBounceY(Phaser.Math.FloatBetween(0.3, 1));
      }
    }

    function collectCoin(player, coin) {
      coin.disableBody(true, true);
      const coinValue = Phaser.Math.Between(1, 3);
      score += coinValue;
      if (score > 67) {
        score = 67;
        triggerGlitch.call(this);
      }
      onScoreUpdate && onScoreUpdate(score);
      scoreText.setText("Score: " + score);
    }

    function collectTrickStar(player, star) {
      star.disableBody(true, true);
      gameOver = true;
      player.setVelocity(0, 0);
      player.body.allowGravity = false;
      this.physics.pause();

      // Game over visuals
      gameOverText = this.add.text(400, 300, "GAME OVER", {
        fontSize: "64px",
        fill: "#ff0000",
      });
      gameOverText.setOrigin(0.5);

      const finalScoreText = this.add.text(400, 350, `Final Score: ${score}`, {
        fontSize: "32px",
        fill: "#ffffff",
      });
      finalScoreText.setOrigin(0.5);
    }

    function introduceRandomMovement() {
      const chance = Phaser.Math.Between(1, 50);
      if (chance === 6) player.setVelocityX(800);
      if (chance === 7) player.setVelocityX(-800);
    }

    function triggerGlitch() {
      setGlitching(true);
      let flashes = 0;
      const maxFlashes = 10;
      const flashInterval = this.time.addEvent({
        delay: 150,
        loop: true,
        callback: () => {
          this.cameras.main.flash(150, 0, 255, 0);
          flashes++;
          if (flashes >= maxFlashes) {
            flashInterval.remove(false);
            resetLevel.call(this);
            setGlitching(false);
          }
        },
      });
    }

    function resetLevel() {
      if (gameOver) return;
      score = 0;
      onScoreUpdate && onScoreUpdate(score);
      createLevel.call(this);
      spawnCoins.call(this);
      player.setPosition(100, 450);
      this.physics.world.gravity.y = 300;
    }

    // Initialize audio and play looped spooky sound
    audioRef.current = new Audio("/sounds/spooky.mp3");
    audioRef.current.loop = true;
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
      game.destroy(true);
    };

    // return () =>
  }, [onScoreUpdate]);

  return (
    <div
      id="phaser-container"
      style={{
        filter: glitching ? "hue-rotate(90deg) saturate(2)" : "none",
      }}
    />
  );
};

export default MergedPhaserGame;
