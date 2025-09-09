/**
 * Endboss that patrols the level end, chases the player when in aggro range,
 * and switches between walk / aggro / hurt / dead animations.
 * @extends MovableObject
 */
class Endboss extends MovableObject {
  height = 400;
  width = 250;
  y = 60;
  maxEnergy = 100;
  energy = this.maxEnergy;
  lastHit = 0;

  AGGRO_START = 520;
  AGGRO_STOP  = 640;
  MELEE_ZONE  = 60;
  WALK_SPEED  = 0.6;
  RUN_SPEED   = 1.6;

  IMAGES_WALKING = [
    'img/4_enemie_boss_chicken/1_walk/G1.png',
    'img/4_enemie_boss_chicken/1_walk/G2.png',
    'img/4_enemie_boss_chicken/1_walk/G3.png',
    'img/4_enemie_boss_chicken/1_walk/G4.png',
  ];

  IMAGES_HURT = [
    'img/4_enemie_boss_chicken/4_hurt/G21.png',
    'img/4_enemie_boss_chicken/4_hurt/G22.png',
    'img/4_enemie_boss_chicken/4_hurt/G23.png'
  ];

  IMAGES_DEAD = [
    'img/4_enemie_boss_chicken/5_dead/G26.png',
  ];

  IMAGES_AGGRO = [
    'img/4_enemie_boss_chicken/3_attack/G13.png',
    'img/4_enemie_boss_chicken/3_attack/G14.png',
    'img/4_enemie_boss_chicken/3_attack/G15.png',
    'img/4_enemie_boss_chicken/3_attack/G16.png',
    'img/4_enemie_boss_chicken/3_attack/G17.png',
    'img/4_enemie_boss_chicken/3_attack/G18.png',
    'img/4_enemie_boss_chicken/3_attack/G19.png',
    'img/4_enemie_boss_chicken/3_attack/G20.png',
  ];

  /** Preloads images, sets initial position and starts behavior loops. */
  constructor() {
    super().loadImage('img/4_enemie_boss_chicken/2_alert/G5.png');
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_DEAD);
    this.loadImages(this.IMAGES_AGGRO);
    this.x = 2800;
    this.animate();
  }

  /** Starts movement and animation loops. */
  animate() {
    this.startWalkLoop();
    this.startAnimLoop();
  }

  /** Movement loop: updates aggro, speed, and direction. */
  startWalkLoop() {
    this.walkInterval = setInterval(() => {
      if (this.isDead() || !this.world || this.world.paused) return;
      const { dx, adx } = this.distanceToPlayer();
      this.updateAggro(adx);
      this.updateSpeed();
      this.moveTowardPlayer(dx, adx);
    }, 1000 / 60);
  }

  /** Animation loop: switches between walking/aggro/hurt/dead frames. */
  startAnimLoop() {
    this.animationInterval = setInterval(() => {
      if (this.isDead()) return this.playAnimation(this.IMAGES_DEAD);
      if (this.isHurt()) return this.playAnimation(this.IMAGES_HURT);
      if (this._aggro && this.IMAGES_AGGRO.length)
        return this.playAnimation(this.IMAGES_AGGRO);
      return this.playAnimation(this.IMAGES_WALKING);
    }, 160);
  }

  /** Calculates distance to the player. */
  distanceToPlayer() {
    const c  = this.world.character;
    const cx = c.x + c.width  / 2;
    const bx = this.x + this.width / 2;
    const dx = cx - bx;
    const adx = Math.abs(dx);
    return { dx, adx };
  }

  /** Updates aggro state with hysteresis. */
  updateAggro(adx) {
    this._aggro = this._aggro
      ? (adx > this.AGGRO_STOP ? false : true)
      : (adx < this.AGGRO_START ? true  : false);
  }

  /** Updates speed depending on aggro. */
  updateSpeed() {
    this.speed = this._aggro ? this.RUN_SPEED : this.WALK_SPEED;
  }

  /** Moves horizontally toward the player unless in melee zone. */
  moveTowardPlayer(dx, adx) {
    if (adx <= this.MELEE_ZONE) return;
    if (dx < 0) { this.moveLeft();  this.otherDirection = false; }
    else        { this.moveRight(); this.otherDirection = true;  }
  }

  /** Stops all running intervals. */
  stop() {
    clearInterval(this.walkInterval);
    clearInterval(this.animationInterval);
  }
}



