import React, { useEffect } from "react";
import Phaser from "phaser";

const PhaserGame = () => {
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

    let game = new Phaser.Game(config);

    let player,
      cursors,
      platforms,
      score = 0,
      scoreText;

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
        "coin",
        "https://labs.phaser.io/assets/sprites/yellow_ball.png"
      );
    }

    function create() {
      platforms = this.physics.add.staticGroup();
      platforms.create(400, 580, "platform").setScale(2).refreshBody();

      player = this.physics.add.sprite(100, 450, "player");
      player.setBounce(0.2);
      player.setCollideWorldBounds(true);
      this.physics.add.collider(player, platforms);

      cursors = this.input.keyboard.createCursorKeys();

      // Coins
      const coins = this.physics.add.group({
        key: "coin",
        repeat: 10,
        setXY: { x: 12, y: 0, stepX: 70 },
      });

      coins.children.iterate((child) => {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      });

      this.physics.add.collider(coins, platforms);
      this.physics.add.overlap(player, coins, collectCoin, null, this);

      scoreText = this.add.text(16, 16, "score: 0", {
        fontSize: "24px",
        fill: "#fff",
      });
    }

    function collectCoin(player, coin) {
      coin.disableBody(true, true);
      score += Phaser.Math.Between(6, 7); // "6" and "7" coins
      if (score > 67) score = 67;
      scoreText.setText("score: " + score);
    }

    function update() {
      if (cursors.left.isDown) player.setVelocityX(-160);
      else if (cursors.right.isDown) player.setVelocityX(160);
      else player.setVelocityX(0);

      if (cursors.up.isDown && player.body.touching.down)
        player.setVelocityY(-330);

      // Random glitch: flip gravity slightly
      if (Phaser.Math.Between(0, 1000) < 3) {
        this.physics.world.gravity.y = Phaser.Math.Between(100, 600);
      }
    }

    return () => game.destroy(true);
  }, []);

  return <div id="phaser-container" />;
};

export default PhaserGame;
