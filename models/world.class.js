/**
 * Game world: canvas/context wiring, entities, loops, overlays and audio.
 * Uses a simple, stable audio model (muted + audioReady) with pointer unlock.
 */
class World {
  character = new Character();
  endboss = new Endboss();
  level = level1;
  canvas; ctx; keyboard;
  camera_x = 0;
  statusBar = new StatusBar();
  coinBar = new CoinBar();
  bottleBar = new BottleBar();
  bossBar = new BossBar();
  throwableObjects = [];
  canThrow = true;
  paused = false;
  victoryScheduled = false;
  defeatScheduled = false;

  // Audio state (simple & robust)
  music = new Audio('audio/background-music.mp3');
  sfxBossDead = new Audio('audio/win.mp3');
  muted = false;
  audioReady = false;

  loop = null;
  raf = null;

  /**
   * Builds the world, prepares audio/overlays, then starts loops.
   */
  constructor(canvas, keyboard) {
    this.ctx = canvas.getContext('2d');
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.setupAudio();
    this.ensureVictoryOverlay();    
    this.setWorld();
    this.draw();
    this.run();
  }

  /**
   * Prepares background music and win SFX, restores mute, and unlocks audio on first user gesture.
   */
  setupAudio() {
    this.music.loop = true;
    this.music.volume = 0.05;
    this.sfxBossDead.volume = 0.2;
    this.muted = localStorage.getItem('muted') === '1';
    this.applyMuteUI();
    this.music.muted = this.muted;
    this.sfxBossDead.muted = this.muted;
    this.character?.syncMute?.();
    const unlock = () => {
      this.audioReady = true;
      if (!this.muted) { try { this.music.play().catch(() => { }); } catch { } }
      window.removeEventListener('pointerdown', unlock, { capture: true });
    };
    window.addEventListener('pointerdown', unlock, { capture: true, once: true });
  }

  /**
   * Toggles the global mute state and syncs all audio/UI.
   */
  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('muted', this.muted ? '1' : '0');
    this.applyMuteUI();
    this.music.muted = this.muted;
    this.sfxBossDead.muted = this.muted;
    this.character?.syncMute?.();
    if (this.muted) {
      try { this.music.pause(); } catch { }
    } else if (this.audioReady) {
      try { this.music.play().catch(() => { }); } catch { }
    }
  }

  /**
   * Reflects the mute state on the button icon.
   */
  applyMuteUI() {
    const btn = document.querySelector('.btn-mute');
    if (btn) btn.classList.toggle('is-muted', this.muted);
  }

  /**
   * Ensures that the victory overlay element exists in the DOM.
   */
  ensureVictoryOverlay() {
    const wrapper = document.getElementById('game') || this.canvas?.parentElement;
    if (!wrapper) return;
    let el = document.getElementById('victory-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'victory-overlay';
      el.className = 'overlay overlay--win';
      wrapper.appendChild(el);
    } else {
      el.classList.add('overlay', 'overlay--win');
    }
    this.victoryEl = el;
  }

  /**
   * Wires references between world and entities and resets counters.
   */
  setWorld() {
    this.character.world = this;
    this.endboss.world = this;
    this.collectedCoins = 0;
    this.totalCoins = this.level.coins.length;
    this.collectedBottles = 0;
    this.totalBottles = this.level.bottles.length;
  }

  /**
   * Starts the fixed-step game logic loop.
   */
  run() {
    if (this.loop) clearInterval(this.loop);
    this.loop = setInterval(() => {
      if (this.paused) return;
      this.checkCollisions();
      this.checkBossCollision();
      this.checkThrowObjects();
      this.checkCoinCollection();
      this.checkBottleCollection();
      const kb = this.keyboard || window.keyboard || {};
      if (!kb.D) this.canThrow = true;
      if (this.character.isDead()) this.onPlayerKilled();
    }, 1000 / 60);
  }

  /**
   * Detects side collision with the endboss and applies damage to the player.
   */
  checkBossCollision() {
    if (!this.endboss || this.endboss.isDead()) return;
    if (this.character.isDead()) return;
    if (this.character.isColliding(this.endboss) && !this.character.isHurt()) {
      this.applySideHit();
    }
  }

  /**
   * Adds or removes a class that hides mobile controls while overlays are shown.
   */
  setOverlay(active) {
    const g = this.canvas && this.canvas.parentElement;
    if (g) g.classList.toggle('has-overlay', !!active);
  }

  /**
   * Shows the lose screen, pauses the world, and stops background music immediately.
   */
  onPlayerKilled() {
    if (this.defeatScheduled) return;
    this.defeatScheduled = true;
    try { this.music.pause(); } catch { }
    const frames = this.character.IMAGES_DEAD?.length || 1;
    setTimeout(() => {
      const el = document.querySelector('.overlay--lose');
      if (el) {
        el.classList.add('show');
        this.setOverlay(true);
        const btn = el.querySelector('.restart-btn');
        if (btn) btn.onclick = () => this.resetGame();
      }
      this.paused = true;
    }, frames * 50);
  }

  /**
   * Shows the win screen, pauses the world, stops music, and plays the win sound.
   */
  onBossKilled() {
    if (this.victoryScheduled) return;
    this.victoryScheduled = true;
    try { this.music.pause(); } catch { }
    const delay = (this.endboss.IMAGES_DEAD?.length || 1) * 200;
    setTimeout(() => {
      if (!this.muted) {
        try { this.sfxBossDead.currentTime = 0; this.sfxBossDead.play().catch(() => { }); } catch { }
      }
      const el = this.victoryEl || document.getElementById('victory-overlay');
      if (el) {
        el.classList.add('show');
        this.setOverlay(true);
        el.onclick = () => this.resetGame();
      }
      this.paused = true;
    }, delay);
  }

  /**
   * Performs a hard reset by reloading the page.
   */
  resetGame() {
    this.setOverlay(false);
    window.location.reload();
  }

  /**
   * Handles enemy collisions (stomp/side) and delegates boss hits to bottles.
   */
  checkCollisions() {
    for (let i = this.level.enemies.length - 1; i >= 0; i--) {
      const enemy = this.level.enemies[i];
      if (enemy.isDead() || !this.character.isColliding(enemy)) continue;
      if (this.isHeadStomp(enemy)) {
        enemy.die();
        setTimeout(() => this.removeEnemy(i), 3000);
      } else if (!this.character.isHurt()) {
        this.applySideHit();
      }
    }
    this.endbossHit();
  }

  /**
   * Applies bottle hits to the endboss and updates the boss bar.
   */
  endbossHit() {
    for (let i = this.throwableObjects.length - 1; i >= 0; i--) {
      const b = this.throwableObjects[i];
      if (!b.isColliding(this.endboss) || this.endboss.isDead()) continue;
      this.throwableObjects.splice(i, 1);
      this.endboss.hit(20);
      this.updateBossBar();
      if (this.endboss.isDead()) this.onBossKilled();
    }
  }

  /**
   * Updates the boss health bar percentage.
   */
  updateBossBar() {
    const pct = (this.endboss.energy / this.endboss.maxEnergy) * 100;
    this.bossBar.setPercentage(pct);
  }

  /**
   * True when the player collides from above while falling.
   */
  isHeadStomp(enemy) {
    const prevBottom = this.character.prevY + this.character.height;
    const currBottom = this.character.y + this.character.height;
    return enemy instanceof Chicken &&
      this.character.speedY < 0 &&
      prevBottom <= enemy.y &&
      currBottom >= enemy.y;
  }

  /**
   * Removes an enemy from the level by array index.
   */
  removeEnemy(idx) {
    this.level.enemies.splice(idx, 1);
  }

  /**
   * Applies side damage to the player and updates the health bar.
   */
  applySideHit() {
    this.character.hit();
    this.statusBar.setPercentage(this.character.energy);
  }

  /**
   * Collects coins on contact and updates the coin bar.
   */
  checkCoinCollection() {
    this.level.coins.forEach((coin, index) => {
      if (this.character.isColliding(coin)) {
        this.level.coins.splice(index, 1);
        this.collectedCoins++;
        const percentage = (this.collectedCoins / this.totalCoins) * 100;
        this.coinBar.setPercentage(percentage);
      }
    });
  }

  /**
   * Collects bottles on contact and updates the bottle bar.
   */
  checkBottleCollection() {
    this.level.bottles.forEach((bottle, index) => {
      if (this.character.isColliding(bottle)) {
        this.level.bottles.splice(index, 1);
        this.collectedBottles++;
        const percentage = (this.collectedBottles / this.totalBottles) * 100;
        this.bottleBar.setPercentage(percentage);
      }
    });
  }

  /**
   * Spawns a throwable bottle when input is pressed and stock > 0.
   */
  checkThrowObjects() {
    const kb = this.keyboard || window.keyboard || {};
    if (kb.D && this.canThrow && this.collectedBottles > 0) {
      this.throwBottle();
      this.canThrow = false;
    }
  }

  /**
   * Creates a new bottle instance and decreases the bottle count.
   */
  throwBottle() {
    const c = this.character;
    const dir = c.otherDirection ? -1 : 1;
    const x = c.x + (dir > 0 ? c.width - 70 : 20);
    const y = c.y + c.height * 0.50;
    const b = new ThrowableObject(x, y, dir);
    this.throwableObjects.push(b);
    this.collectedBottles--;
    const pct = (this.collectedBottles / this.totalBottles) * 100;
    this.bottleBar.setPercentage(pct);
  }

  /**
   * Draw loop using requestAnimationFrame; respects pause state.
   */
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.translate(this.camera_x, 0);
    this.addObjectsInToWorld();
    this.ctx.translate(-this.camera_x, 0);
    if (this.paused) return;
    this.raf = requestAnimationFrame(() => this.draw());
  }

  /**
   * Establishes drawing order: background, player, HUD, objects.
   */
  addObjectsInToWorld() {
    this.addObjectToMap(this.level.backgroundObjects);
    this.addObjectToMap(this.level.clouds);
    this.addToMap(this.character);
    this.addToBoss();
    this.ctx.translate(-this.camera_x, 0);
    this.addToMap(this.statusBar);
    this.addToMap(this.coinBar);
    this.addToMap(this.bottleBar);
    this.ctx.translate(this.camera_x, 0);
    this.addObjectToMap(this.level.enemies);
    this.addObjectToMap(this.level.coins);
    this.addObjectToMap(this.level.bottles);
    this.addObjectToMap(this.throwableObjects);
  }

  /**
   * Draws the boss and anchors the boss health bar above it.
   */
  addToBoss() {
    this.addToMap(this.endboss);
    this.bossBar.x = this.endboss.x + (this.endboss.width - this.bossBar.width) / 2;
    this.bossBar.y = this.endboss.y - 60;
    this.addToMap(this.bossBar);
  }

  /**
   * Draws an array of drawables to the canvas.
   */
  addObjectToMap(objects) {
    if (!objects || !objects.forEach) return;
    objects.forEach(o => this.addToMap(o));
  }

  /**
   * Draws a single object, handling left-right flipping.
   */
  addToMap(mo) {
    if (!mo) return;
    if (mo.otherDirection) this.flipCharacter(mo);
    mo.draw(this.ctx);
    mo.drawFrame?.(this.ctx);
    if (mo.otherDirection) this.flipCharacterBack(mo);
  }

  /**
   * Flips the context horizontally to draw left-facing sprites.
   */
  flipCharacter(mo) {
    this.ctx.save();
    this.ctx.translate(mo.width, 0);
    this.ctx.scale(-1, 1);
    mo.x = mo.x * -1;
  }

  /**
   * Restores the context and local position after flipping.
   */
  flipCharacterBack(mo) {
    mo.x = mo.x * -1;
    this.ctx.restore();
  }
}