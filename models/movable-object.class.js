/**
 * Base class for moving entities (player/enemies/projectiles).
 * Handles gravity, collisions, damage and simple animations.
 * @extends DrawableObject
 */
class MovableObject extends DrawableObject {
  speed = 0.15;
  otherDirection = false;
  speedY = 0;
  acceleration = 2.1;
  energy = 100;
  lastHit = 0;
  prevY = this.y;
  hitboxLeft = 0; hitboxRight = 0; hitboxTop = 0; hitboxBottom = 0;
  _gravTimer = null;

  /** Starts simple gravity loop (60 FPS). */
  applyGravity() {
    if (this._gravTimer) clearInterval(this._gravTimer);
    this._gravTimer = setInterval(() => {
      if (this.isAboveGround() || this.speedY > 0) {
        this.prevY = this.y;
        this.y -= this.speedY;
        this.speedY -= this.acceleration;
      }
    }, 1000 / 60);
  }

  /** Returns the (optionally reduced) hitbox. */
  getHitbox() {
    const x = this.x + this.hitboxLeft;
    const y = this.y + this.hitboxTop;
    const w = this.width - this.hitboxLeft - this.hitboxRight;
    const h = this.height - this.hitboxTop - this.hitboxBottom;
    return { x, y, w, h };
  }

  /** True if object is above ground (bottles always true). */
  isAboveGround() {
    if (this instanceof ThrowableObject) return true;
    return this.y < 140;
  }

  /** Axis-aligned bounding box collision using each object's hitbox. */
  isColliding(mo) {
    const a = this.getHitbox ? this.getHitbox() : { x: this.x, y: this.y, w: this.width, h: this.height };
    const b = mo.getHitbox ? mo.getHitbox() : { x: mo.x, y: mo.y, w: mo.width, h: mo.height };
    return a.x < b.x + b.w &&
           a.x + a.w > b.x &&
           a.y < b.y + b.h &&
           a.y + a.h > b.y;
  }

  /** Applies damage and stores last hit time. */
  hit() {
    this.energy -= 20;
    if (this.energy < 0) this.energy = 0;
    else this.lastHit = Date.now();
  }

  /** Temporary invulnerability after a hit (< 1s). */
  isHurt() {
    const seconds = (Date.now() - this.lastHit) / 1000;
    return seconds < 1;
  }

  /** True if energy is zero. */
  isDead() {
    return this.energy === 0;
  }

  /** Move right by current speed. */
  moveRight() { this.x += this.speed; }

  /** Move left by current speed. */
  moveLeft() { this.x -= this.speed; }

  /** Starts a jump by setting vertical speed. */
  jump() { this.speedY = 30; }

  /** Cycles through provided animation frames. */
  playAnimation(images) {
    const i = this.currentImage % images.length;
    this.img = this.imageCache[images[i]];
    this.currentImage++;
  }

  /** Stops internal timers owned by MovableObject. */
  stop() {
    if (this._gravTimer) { clearInterval(this._gravTimer); this._gravTimer = null; }
  }
}

