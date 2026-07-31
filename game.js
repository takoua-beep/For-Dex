/* ============================================================================
   CUTE ADVENTURE - STARTER GAME
   Built with Phaser 3.

   HOW THIS FILE IS ORGANIZED:
     1. EASY-TO-EDIT SETTINGS   <- change numbers/text/positions here
     2. INPUT HANDLING          <- D-pad + keyboard, shared by all scenes
     3. ROOM 1 SCENE            <- outdoor map with collectibles
     4. ROOM 2 SCENE            <- NPC room
     5. GAME CONFIG + LAUNCH

   TO REPLACE ART LATER:
     Just overwrite the PNG files inside the assets/ folders with your own
     images using the SAME file names (e.g. assets/player/player.png).
     If your new image has a different size, update the matching
     "width/height" or "setDisplaySize()" call below.
============================================================================ */


/* ============================================================================
   1. EASY-TO-EDIT SETTINGS
============================================================================ */

// How many collectibles must be picked up before the door to Room 2 opens.
const TOTAL_COLLECTIBLES = 8;

// Size of the room1 (outdoor) world. Bigger than the screen so the camera
// scrolls/follows the player around.
const ROOM1_WIDTH = 1600;
const ROOM1_HEIGHT = 1200;

// The screen/game resolution (this is the "window" the camera shows).
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

// Player movement speed (pixels per second).
const PLAYER_SPEED = 220;

// Positions of collectibles in Room 1 (x, y). Add/remove entries here to
// change how many collectibles exist -- just keep TOTAL_COLLECTIBLES in sync.
const COLLECTIBLE_POSITIONS = [
  { x: 200, y: 200 },
  { x: 500, y: 150 },
  { x: 900, y: 250 },
  { x: 1300, y: 180 },
  { x: 250, y: 700 },
  { x: 700, y: 900 },
  { x: 1100, y: 1000 },
  { x: 1450, y: 850 },
];

// Decoration positions in Room 1. type must match a loaded image key.
// These are purely visual (no collision) EXCEPT trees and rocks, which
// the player will bump into (see OBSTACLE_TYPES below).
const DECORATIONS = [
  { type: "tree", x: 100, y: 100 },
  { type: "tree", x: 600, y: 500 },
  { type: "tree", x: 1500, y: 120 },
  { type: "tree", x: 1500, y: 1100 },
  { type: "tree", x: 80, y: 1100 },
  { type: "rock", x: 400, y: 600 },
  { type: "rock", x: 1200, y: 400 },
  { type: "rock", x: 900, y: 900 },
  { type: "bush", x: 300, y: 900 },
  { type: "bush", x: 1000, y: 200 },
  { type: "bush", x: 1300, y: 700 },
  { type: "flower", x: 220, y: 400 },
  { type: "flower", x: 480, y: 850 },
  { type: "flower", x: 800, y: 650 },
  { type: "flower", x: 1100, y: 300 },
  { type: "flower", x: 1350, y: 1000 },
];

// Which decoration "types" the player should collide with (solid objects).
const OBSTACLE_TYPES = ["tree", "rock"];

// Text the NPC says when the player walks close enough, in Room 2.
const NPC_DIALOGUE = "Hi there! Welcome to my room. Nice to meet you!";

// How close (in pixels) the player must be to the NPC for the speech to show.
const NPC_TALK_DISTANCE = 120;


/* ============================================================================
   2. INPUT HANDLING (shared across all scenes)
   This object just tracks which directions are currently "held down",
   whether from the on-screen D-pad buttons or the keyboard.
============================================================================ */

const controls = {
  up: false,
  down: false,
  left: false,
  right: false,
};

// Wire up the on-screen D-pad buttons (works with touch AND mouse).
function setupDpadButton(buttonId, direction) {
  const btn = document.getElementById(buttonId);

  const press = (e) => {
    e.preventDefault();
    controls[direction] = true;
  };
  const release = (e) => {
    e.preventDefault();
    controls[direction] = false;
  };

  btn.addEventListener("touchstart", press, { passive: false });
  btn.addEventListener("touchend", release, { passive: false });
  btn.addEventListener("touchcancel", release, { passive: false });
  btn.addEventListener("mousedown", press);
  btn.addEventListener("mouseup", release);
  btn.addEventListener("mouseleave", release);
}

setupDpadButton("btn-up", "up");
setupDpadButton("btn-down", "down");
setupDpadButton("btn-left", "left");
setupDpadButton("btn-right", "right");

// Keyboard support is set up per-scene below using Phaser's built-in cursor
// keys, then merged into the same `controls` object so movement code only
// has to check one place.


/* ============================================================================
   3. ROOM 1 SCENE - outdoor map with collectibles
============================================================================ */

class Room1Scene extends Phaser.Scene {
  constructor() {
    super("Room1");
  }

  preload() {
    // ---- Load all images used in this scene ----
    // To use your own art, just replace these PNG files (same file names)
    // inside the assets/ folders. If your image dimensions differ a lot,
    // you may want to adjust setDisplaySize() calls further down.
    this.load.image("player", "assets/player/player.png");
    this.load.image("collectible", "assets/collectibles/collectible.png");
    this.load.image("grass", "assets/backgrounds/grass_tile.png");
    this.load.image("tree", "assets/decorations/tree.png");
    this.load.image("bush", "assets/decorations/bush.png");
    this.load.image("rock", "assets/decorations/rock.png");
    this.load.image("flower", "assets/decorations/flower.png");
    this.load.image("door", "assets/objects/door.png");
  }

  create() {
    // Reset collected count each time this scene starts.
    this.collected = 0;

    // ---- Background (tiled grass covering the whole world) ----
    this.add.tileSprite(0, 0, ROOM1_WIDTH, ROOM1_HEIGHT, "grass").setOrigin(0, 0);

    // ---- World + camera bounds ----
    this.physics.world.setBounds(0, 0, ROOM1_WIDTH, ROOM1_HEIGHT);
    this.cameras.main.setBounds(0, 0, ROOM1_WIDTH, ROOM1_HEIGHT);

    // ---- Obstacles group (solid decorations: trees & rocks) ----
    this.obstacles = this.physics.add.staticGroup();

    // ---- Decorations (visual only, non-solid) go in a plain array ----
    DECORATIONS.forEach((deco) => {
      const isSolid = OBSTACLE_TYPES.includes(deco.type);
      if (isSolid) {
        const obj = this.obstacles.create(deco.x, deco.y, deco.type);
        obj.setOrigin(0.5, 1); // base of object sits at (x,y)
        // Shrink the collision box a bit so it feels fair (only the "trunk"
        // area blocks the player, not the whole leafy top).
        obj.body.setSize(obj.width * 0.5, obj.height * 0.3);
        obj.body.setOffset(obj.width * 0.25, obj.height * 0.7);
        obj.refreshBody();
      } else {
        this.add.image(deco.x, deco.y, deco.type).setOrigin(0.5, 1);
      }
    });

    // ---- Door to Room 2 (locked until all collectibles are gathered) ----
    this.door = this.physics.add.staticSprite(ROOM1_WIDTH - 60, ROOM1_HEIGHT / 2, "door");
    this.door.setTint(0x888888); // greyed out = locked

    // ---- Player ----
    this.player = this.physics.add.sprite(100, ROOM1_HEIGHT / 2, "player");
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(this.player.width * 0.6, this.player.height * 0.5);
    this.player.body.setOffset(this.player.width * 0.2, this.player.height * 0.45);

    // Camera follows the player around the big map.
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // ---- Collectibles ----
    this.collectiblesGroup = this.physics.add.group();
    COLLECTIBLE_POSITIONS.forEach((pos) => {
      const item = this.collectiblesGroup.create(pos.x, pos.y, "collectible");
      // Gentle floating animation so they feel alive (simple, no spritesheet needed).
      this.tweens.add({
        targets: item,
        y: pos.y - 8,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });

    // ---- Collisions / overlaps ----
    this.physics.add.collider(this.player, this.obstacles);
    this.physics.add.overlap(
      this.player,
      this.collectiblesGroup,
      this.collectItem,
      null,
      this
    );
    this.physics.add.overlap(this.player, this.door, this.tryEnterRoom2, null, this);

    // ---- UI: "Collected: X / Y" text fixed to the screen (not the world) ----
    this.counterText = this.add
      .text(16, 16, `Collected: ${this.collected} / ${TOTAL_COLLECTIBLES}`, {
        fontSize: "24px",
        fontFamily: "Arial",
        color: "#ffffff",
        backgroundColor: "#00000088",
        padding: { x: 10, y: 6 },
      })
      .setScrollFactor(0) // stays fixed on screen while camera scrolls
      .setDepth(100);

    // Small hint text about the locked door.
    this.hintText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 30, "", {
        fontSize: "18px",
        fontFamily: "Arial",
        color: "#ffffff",
        backgroundColor: "#00000088",
        padding: { x: 8, y: 4 },
      })
      .setScrollFactor(0)
      .setOrigin(0.5)
      .setDepth(100);

    // ---- Keyboard input (arrow keys) ----
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  collectItem(player, item) {
    item.destroy();
    this.collected += 1;
    this.counterText.setText(`Collected: ${this.collected} / ${TOTAL_COLLECTIBLES}`);

    // Unlock the door once everything has been collected.
    if (this.collected >= TOTAL_COLLECTIBLES) {
      this.door.clearTint(); // remove grey tint = now "unlocked"
      this.hintText.setText("All collected! Walk into the door to continue →");
    }
  }

  tryEnterRoom2() {
    if (this.collected >= TOTAL_COLLECTIBLES) {
      this.scene.start("Room2");
    } else {
      const remaining = TOTAL_COLLECTIBLES - this.collected;
      this.hintText.setText(`Find ${remaining} more collectible(s) to open the door!`);
    }
  }

  update() {
    // Merge keyboard state into the shared `controls` object.
    const left = controls.left || this.cursors.left.isDown;
    const right = controls.right || this.cursors.right.isDown;
    const up = controls.up || this.cursors.up.isDown;
    const down = controls.down || this.cursors.down.isDown;

    // Reset velocity each frame, then apply based on held directions.
    this.player.setVelocity(0);

    let vx = 0;
    let vy = 0;
    if (left) vx -= 1;
    if (right) vx += 1;
    if (up) vy -= 1;
    if (down) vy += 1;

    // Normalize diagonal movement so it isn't faster than straight movement.
    const vec = new Phaser.Math.Vector2(vx, vy);
    if (vec.length() > 0) {
      vec.normalize().scale(PLAYER_SPEED);
      this.player.setVelocity(vec.x, vec.y);
    }

    // Flip the sprite to face the direction of travel (simple, no animation).
    if (vx < 0) this.player.setFlipX(true);
    if (vx > 0) this.player.setFlipX(false);
  }
}


/* ============================================================================
   4. ROOM 2 SCENE - NPC room with floating speech text
============================================================================ */

class Room2Scene extends Phaser.Scene {
  constructor() {
    super("Room2");
  }

  preload() {
    this.load.image("player", "assets/player/player.png");
    this.load.image("npc", "assets/npc/npc.png");
    this.load.image("floor2", "assets/backgrounds/room2_floor.png");
    this.load.image("door", "assets/objects/door.png");
  }

  create() {
    // ---- Background ----
    this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, "floor2").setOrigin(0, 0);

    // This room is small enough to fit on one screen, so world = screen size.
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.cameras.main.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // ---- Door back to Room 1 (handy for testing) ----
    this.doorBack = this.physics.add.staticSprite(40, GAME_HEIGHT / 2, "door");

    // ---- NPC ----
    this.npc = this.physics.add.staticSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, "npc");

    // Speech text that floats above the NPC's head. Hidden until player is near.
    this.speechText = this.add
      .text(this.npc.x, this.npc.y - 70, NPC_DIALOGUE, {
        fontSize: "16px",
        fontFamily: "Arial",
        color: "#000000",
        backgroundColor: "#ffffffdd",
        padding: { x: 8, y: 6 },
        align: "center",
        wordWrap: { width: 220 },
      })
      .setOrigin(0.5)
      .setDepth(100)
      .setAlpha(0); // start invisible

    // ---- Player (re-spawn near the entrance door) ----
    this.player = this.physics.add.sprite(90, GAME_HEIGHT / 2, "player");
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(this.player.width * 0.6, this.player.height * 0.5);
    this.player.body.setOffset(this.player.width * 0.2, this.player.height * 0.45);

    // ---- Collisions ----
    this.physics.add.collider(this.player, this.npc);
    this.physics.add.overlap(this.player, this.doorBack, () => {
      this.scene.start("Room1");
    });

    // ---- Keyboard input ----
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    const left = controls.left || this.cursors.left.isDown;
    const right = controls.right || this.cursors.right.isDown;
    const up = controls.up || this.cursors.up.isDown;
    const down = controls.down || this.cursors.down.isDown;

    this.player.setVelocity(0);
    let vx = 0;
    let vy = 0;
    if (left) vx -= 1;
    if (right) vx += 1;
    if (up) vy -= 1;
    if (down) vy += 1;

    const vec = new Phaser.Math.Vector2(vx, vy);
    if (vec.length() > 0) {
      vec.normalize().scale(PLAYER_SPEED);
      this.player.setVelocity(vec.x, vec.y);
    }

    if (vx < 0) this.player.setFlipX(true);
    if (vx > 0) this.player.setFlipX(false);

    // ---- Show/hide NPC speech based on distance to player ----
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.npc.x,
      this.npc.y
    );

    if (distance <= NPC_TALK_DISTANCE) {
      this.speechText.setAlpha(1);
    } else {
      this.speechText.setAlpha(0);
    }
  }
}


/* ============================================================================
   5. GAME CONFIG + LAUNCH
============================================================================ */

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: "game-container",
  backgroundColor: "#87ceeb",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 }, // top-down game, no gravity
      debug: false, // set to true to see collision boxes while developing
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [Room1Scene, Room2Scene],
};

new Phaser.Game(config);
