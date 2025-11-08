import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";

const PhaserLevel = ({ onScoreUpdate }) => {
  const gameRef = useRef(null);
  const [glitching, setGlitching] = useState(false);

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
      scene: {
        preload,
        create,
        update,
      },
    };

    let game = new Phaser.Game(config);
    gameRef.current = game;

    let player,
      cursors,
      platforms,
      coins,
      movingPlatforms,
      spikes,
      scoreText,
      gravityTimer,
      score = 0;

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
      ); // "6" coin
      this.load.image(
        "coin7",
        "https://labs.phaser.io/assets/sprites/yellow_ball.png"
      ); // "7" coin
      this.load.image(
        "spike",
        "https://labs.phaser.io/assets/sprites/spike.png"
      );
    }

    function create() {
      createLevel.call(this);

      // Create moving platforms group
      movingPlatforms = this.physics.add.group({
        allowGravity: false,
        immovable: true,
      });
      let movingPlatform = movingPlatforms
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

      // Create spikes group
      spikes = this.physics.add.staticGroup();
      spikes.create(300, 560, "spike").setScale(0.5).refreshBody();

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

      coins = this.physics.add.group();
      spawnCoins.call(this);

      this.physics.add.collider(coins, platforms);

      this.physics.add.overlap(
        player,
        coins,
        (player, coin) => {
          let coinValue = Phaser.Math.Between(1, 3);
          score += coinValue;
          if (score > 67) {
            score = 67;
            triggerGlitch.call(this);
          }
          onScoreUpdate(score);
          scoreText.setText("Score: " + score);
          coin.disableBody(true, true);
        },
        null,
        this
      );

      scoreText = this.add.text(16, 16, "Score: 0", {
        fontSize: "24px",
        fill: "#0f0",
      });

      gravityTimer = this.time.addEvent({
        delay: 3000,
        loop: true,
        callback: () => {
          let baseGravity = 300;
          let variation = Phaser.Math.FloatBetween(0.9, 1.1);
          this.physics.world.gravity.y = baseGravity * variation;
        },
      });
    }

    function update() {
      if (!cursors) return;
      if (cursors.left.isDown) {
        player.setVelocityX(-300);
      } else if (cursors.right.isDown) {
        player.setVelocityX(300);
      } else player.setVelocityX(0);

      introduceRandomeMovement();

      if (cursors.up.isDown && player.body.touching.down)
        player.setVelocityY(-300);
    }

    function introduceRandomeMovement() {
      let randomChance = Phaser.Math.Between(1, 50);
      if (randomChance === 6) player.setVelocityX(800);
      if (randomChance === 7) player.setVelocityX(-800);
    }

    function createLevel() {
      if (platforms) {
        platforms.clear(true, true);
      }
      platforms = this.physics.add.staticGroup();

      let baseY = 580;
      for (let i = 0; i < 20; i++) {
        let x = 100 + i * 150 + Phaser.Math.Between(-40, 40);
        let y = baseY - i * 100 + Phaser.Math.Between(-25, 25);
        platforms.create(x, y, "platform").setScale(0.5).refreshBody();
      }
    }

    function spawnCoins() {
      if (coins) {
        coins.clear(true, true);
      }
      coins = this.physics.add.group();
      let noOfCoins = 80;

      for (let i = 0; i < noOfCoins; i++) {
        let coinType = Phaser.Math.Between(0, 7) === 0 ? "coin6" : "coin7";
        let x = Phaser.Math.Between(50, 750);
        let y = Phaser.Math.Between(50, 400);
        coins
          .create(x, y, coinType)
          .setBounceY(Phaser.Math.FloatBetween(0.3, 1));
      }
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
      score = 0;
      onScoreUpdate(score);
      createLevel.call(this);
      spawnCoins.call(this);

      player.setPosition(100, 450);
      this.physics.world.gravity.y = 300;
    }

    return () => {
      game.destroy(true);
    };
  }, [onScoreUpdate]);

  return (
    <div
      id="phaser-container"
      style={{ filter: glitching ? "hue-rotate(90deg) saturate(2)" : "none" }}
    />
  );
};

export default PhaserLevel;
