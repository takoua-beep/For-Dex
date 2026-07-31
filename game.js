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
     If your new image has a different size, things will still mostly work,
     since the code sizes collision boxes relative to the image itself.
============================================================================ */


/* ============================================================================
   1. EASY-TO-EDIT SETTINGS
============================================================================ */

// Size of the room1 (outdoor) world. Bigger than the screen so the camera
// scrolls/follows the player around.
const ROOM1_WIDTH = 1600;
const ROOM1_HEIGHT = 1200;

// The screen/game resolution (this is the "window" the camera shows).
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

// Player movement speed (pixels per second).
const PLAYER_SPEED = 220;

// ----------------------------------------------------------------------------
// COLLECTIBLES
// Each one has: the image key (must match a loaded texture), a spot on the
// map, and the message shown in the popup window when the player grabs it.
// Add/remove entries here to change how many collectibles exist -- the
// counter and "TOTAL_COLLECTIBLES" update automatically from this list.
// ----------------------------------------------------------------------------
const COLLECTIBLES = [
  { type: "penguin", x: 200, y: 200, message: "You are my penguin, hihi." },
  { type: "bunny", x: 520, y: 150, message: "I'm your lil bunny." },
  { type: "pillow", x: 900, y: 230, message: "I love the nights where I sleep on your soft voice." },
  { type: "pizza", x: 1300, y: 180, message: "I love our pizza dates a lot." },
  { type: "pomme", x: 250, y: 700, message: "I never liked the flavor of apples in drinks, but here I am, it's my favorite now because of you." },
  { type: "icecream", x: 700, y: 900, message: "I never liked ice cream that much, but you really changed me." },
  { type: "lego", x: 1100, y: 1000, message: "Lego dates with you heal my inner child." },
  { type: "strawberry", x: 1450, y: 850, message: "I remember the random day we found the smallest strawberry on the streets, hh, and you got me a batch before I went home." },
  { type: "bowling", x: 850, y: 600, message: "You were so good at bowling!" },
  { type: "minute", x: 1500, y: 550, message: "I grew to love the 'minute' nickname." },
];
const TOTAL_COLLECTIBLES = COLLECTIBLES.length;

// Decoration positions in Room 1. `type` must match a loaded image key.
// These are purely visual (no collision) EXCEPT trees and rocks, which
// the player will bump into (see OBSTACLE_TYPES below).
const DECORATIONS = [
  // ---- Trees (solid) ----
  { type: "tree", x: 100, y: 100 },
  { type: "tree", x: 600, y: 500 },
  { type: "tree", x: 1500, y: 120 },
  { type: "tree", x: 1500, y: 1100 },
  { type: "tree", x: 80, y: 1100 },
  { type: "tree", x: 350, y: 300 },
  { type: "tree", x: 1200, y: 900 },
  { type: "tree", x: 800, y: 120 },
  { type: "tree", x: 1400, y: 500 },
  { type: "tree", x: 50, y: 650 },
  { type: "tree", x: 1000, y: 1100 },
  { type: "tree", x: 650, y: 1050 },

  // ---- Rocks (solid) ----
  { type: "rock", x: 400, y: 600 },
  { type: "rock", x: 1200, y: 400 },
  { type: "rock", x: 900, y: 900 },

  // ---- Bushes (decorative only) ----
  { type: "bush", x: 300, y: 900 },
  { type: "bush", x: 1000, y: 200 },
  { type: "bush", x: 1300, y: 700 },
  { type: "bush", x: 550, y: 750 },

  // ---- Flowers, several different colors scattered around (decorative only) ----
  { type: "flower_pink", x: 220, y: 400 },
  { type: "flower_yellow", x: 480, y: 850 },
  { type: "flower_purple", x: 800, y: 650 },
  { type: "flower_white", x: 1100, y: 300 },
  { type: "flower_orange", x: 1350, y: 1000 },
  { type: "flower_pink", x: 1250, y: 250 },
  { type: "flower_yellow", x: 150, y: 850 },
  { type: "flower_purple", x: 620, y: 1100 },
  { type: "flower_white", x: 950, y: 750 },
  { type: "flower_orange", x: 1450, y: 400 },
  { type: "flower_pink", x: 700, y: 350 },
  { type: "flower_yellow", x: 1050, y: 950 },
  { type: "flower_purple", x: 380, y: 1000 },
  { type: "flower_white", x: 180, y: 250 },
  { type: "flower_orange", x: 1150, y: 600 },
];

// Which decoration "types" the player should collide with (solid objects).
const OBSTACLE_TYPES = ["tree", "rock"];

// Text the NPC says when the player walks close enough, in Room 2.
const NPC_DIALOGUE =
  "ik i am a lil crazy but can we unbreakup my love? I love you and I'd rather have our time apart being your gf than single, so will you be mine again?";

// How close (in pixels) the player must be to the NPC for the speech
// (and floating hearts) to show.
const NPC_TALK_DISTANCE = 130;


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
    // inside the assets/ folders.
    this.load.image("player", "assets/player/player.png");
    this.load.image("grass", "assets/backgrounds/grass_tile.png");
    this.load.image("tree", "assets/decorations/tree.png");
    this.load.image("bush", "assets/decorations/bush.png");
    this.load.image("rock", "assets/decorations/rock.png");
    this.load.image("flower_pink", "assets/decorations/flower_pink.png");
    this.load.image("flower_yellow", "assets/decorations/flower_yellow.png");
    this.load.image("flower_purple", "assets/decorations/flower_purple.png");
    this.load.image("flower_white", "assets/decorations/flower_white.png");
    this.load.image("flower_orange", "assets/decorations/flower_orange.png");
    this.load.image("door", "assets/objects/door.png");

    // Load one texture per collectible type (Phaser automatically dedupes if
    // the same type appears more than once in the COLLECTIBLES list above).
    COLLECTIBLES.forEach((c) => {
      this.load.image(c.type, `assets/collectibles/${c.type}.png`);
    });
  }

  create() {
    // Reset collected count each time this scene starts.
    this.collected = 0;
    this.popupOpen = false; // true while a "you collected X" popup is showing

    // ---- Background (tiled grass covering the whole world) ----
    this.add.tileSprite(0, 0, ROOM1_WIDTH, ROOM1_HEIGHT, "grass").setOrigin(0, 0);

    // ---- World + camera bounds ----
    this.physics.world.setBounds(0, 0, ROOM1_WIDTH, ROOM1_HEIGHT);
    this.cameras.main.setBounds(0, 0, ROOM1_WIDTH, ROOM1_HEIGHT);

    // ---- Obstacles group (solid decorations: trees & rocks) ----
    this.obstacles = this.physics.add.staticGroup();

    // ---- Decorations (visual only, non-solid, EXCEPT trees/rocks) ----
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
    COLLECTIBLES.forEach((c) => {
      const item = this.collectiblesGroup.create(c.x, c.y, c.type);
      item.collectMessage = c.message; // stash the message on the sprite itself
      // Gentle floating animation so they feel alive (simple, no spritesheet needed).
      this.tweens.add({
        targets: item,
        y: c.y - 8,
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

    // Build the (initially hidden) popup window used when collecting items.
    this.createCollectPopup();
  }

  // ----------------------------------------------------------------------
  // Builds a simple "you collected X!" popup window with a close (X) button.
  // It's a normal Phaser Container, fixed to the screen (scrollFactor 0),
  // hidden by default, and reused for every collectible.
  // ----------------------------------------------------------------------
  createCollectPopup() {
    const boxW = 420;
    const boxH = 160;
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;

    const bg = this.add.rectangle(0, 0, boxW, boxH, 0xffffff, 0.97);
    bg.setStrokeStyle(3, 0x333333);

    this.popupText = this.add
      .text(0, 0, "", {
        fontSize: "18px",
        fontFamily: "Arial",
        color: "#222222",
        align: "center",
        wordWrap: { width: boxW - 60 },
      })
      .setOrigin(0.5);

    // No close button anymore -- the popup just auto-dismisses the moment
    // the player presses a movement key/button (see update() below).
    this.popupContainer = this.add
      .container(centerX, centerY, [bg, this.popupText])
      .setScrollFactor(0)
      .setDepth(200)
      .setVisible(false);
  }

  showCollectPopup(message) {
    this.popupOpen = true;
    this.popupText.setText(message);
    this.popupContainer.setVisible(true);
  }

  closeCollectPopup() {
    this.popupOpen = false;
    this.popupContainer.setVisible(false);
  }

  collectItem(player, item) {
    if (this.popupOpen) return; // ignore overlaps while a popup is already open

    const message = item.collectMessage;
    item.destroy();
    this.collected += 1;
    this.counterText.setText(`Collected: ${this.collected} / ${TOTAL_COLLECTIBLES}`);

    // Unlock the door once everything has been collected.
    if (this.collected >= TOTAL_COLLECTIBLES) {
      this.door.clearTint(); // remove grey tint = now "unlocked"
      this.hintText.setText("All collected! Walk into the door to continue →");
    }

    // Show the popup with this specific item's message. It disappears as
    // soon as the player moves again (see update() below).
    this.showCollectPopup(message);
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

    // As soon as the player presses any movement direction, dismiss the
    // collect popup (if one is showing).
    if (this.popupOpen && (left || right || up || down)) {
      this.closeCollectPopup();
    }

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
   4. ROOM 2 SCENE - NPC room with floating speech text + popping hearts
============================================================================ */

class Room2Scene extends Phaser.Scene {
  constructor() {
    super("Room2");
  }

  preload() {
    this.load.image("player", "assets/player/player.png");
    this.load.image("npc", "assets/npc/npc.png");
    this.load.image("room2_bg", "assets/backgrounds/room2_full.png");
    this.load.image("door", "assets/objects/door.png");
    this.load.image("heart", "assets/decorations/heart.png");
  }

  create() {
    // ---- Background: one full-size illustrated room image ----
    this.add.image(0, 0, "room2_bg").setOrigin(0, 0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    // This room is small enough to fit on one screen, so world = screen size.
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.cameras.main.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // ---- Invisible "door back to Room 1" zone near the entrance ----
    // (The room artwork already has a drawn door, so instead of stamping a
    // placeholder sprite over it, we use an invisible trigger zone here.)
    this.doorBack = this.physics.add.staticImage(70, 260, "door").setVisible(false);
    this.doorBack.body.setSize(60, 90);

    // ---- NPC ----
    this.npc = this.physics.add.staticSprite(430, 430, "npc");

    // Speech text that floats above the NPC's head. Hidden until player is near.
    this.speechText = this.add
      .text(this.npc.x, this.npc.y - this.npc.height - 30, NPC_DIALOGUE, {
        fontSize: "14px",
        fontFamily: "Arial",
        color: "#000000",
        backgroundColor: "#ffffffdd",
        padding: { x: 10, y: 8 },
        align: "center",
        wordWrap: { width: 280 },
      })
      .setOrigin(0.5)
      .setDepth(100)
      .setAlpha(0); // start invisible

    // ---- Player (re-spawn near the entrance door) ----
    this.player = this.physics.add.sprite(110, 260, "player");
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

    // ---- Popping hearts effect while player is near the NPC ----
    // Every 450ms, if the player is close enough, spawn one small heart that
    // floats up and fades out (a simple "they're vibing" effect).
    this.time.addEvent({
      delay: 450,
      loop: true,
      callback: this.maybeSpawnHeart,
      callbackScope: this,
    });
  }

  maybeSpawnHeart() {
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.npc.x,
      this.npc.y
    );
    if (distance > NPC_TALK_DISTANCE) return;

    // Spawn roughly between the player and the NPC, with a little randomness.
    const midX = (this.player.x + this.npc.x) / 2 + Phaser.Math.Between(-20, 20);
    const midY = (this.player.y + this.npc.y) / 2 - 30 + Phaser.Math.Between(-10, 10);

    const heart = this.add.image(midX, midY, "heart").setDepth(90).setScale(0.8);

    this.tweens.add({
      targets: heart,
      y: midY - 50,
      alpha: 0,
      scale: 1.2,
      duration: 900,
      ease: "Sine.easeOut",
      onComplete: () => heart.destroy(),
    });
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

    this.speechText.setAlpha(distance <= NPC_TALK_DISTANCE ? 1 : 0);
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
  pixelArt: true, // keeps pixel-art sprites crisp instead of blurry when scaled
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
