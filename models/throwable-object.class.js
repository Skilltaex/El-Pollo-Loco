/**
 * Wurfobjekt (Flasche): rotiert beim Flug, fällt zu Boden,
 * zerschellt und spielt Splash-Frames ab. Entfernt sich danach aus der Welt.
 * @extends MovableObject
 */
class ThrowableObject extends MovableObject {
  isBroken = false;
  rotationInterval;
  moveInterval;
  static FLOOR_Y = 360;

  SPLASH_IMAGES = [
    'img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png',
    'img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png',
    'img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png',
    'img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png',
    'img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png',
    'img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png',
  ];

  ROTATION_IMAGES = [
    'img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png',
    'img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png',
    'img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png',
    'img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png',
  ];

  /**
   * @param {number} x Start-X
   * @param {number} y Start-Y
   */
  constructor(x, y, dir = 1) {
    super();
    this.loadImage(this.ROTATION_IMAGES[0]);
    this.loadImages(this.ROTATION_IMAGES);
    this.loadImages(this.SPLASH_IMAGES);
    this.x = x;
    this.y = y;
    this.height = 80;
    this.width  = 75;
    this.dir = dir;
    this.throw();
  }

  throw() {
    this.speedY = 22;
    this.applyGravity();
    this.animateRotation();
    const vx = 12 * (this.dir || 1);
    this.moveInterval = setInterval(() => {
      this.x += vx;      
      if (!this.isBroken && this.speedY <= 0 && this.y >= ThrowableObject.FLOOR_Y) {
        this.breakBottle();
      }
    }, 20);
  }

  /** Dreht die Flasche zyklisch während des Flugs. */
  animateRotation() {
    let i = 0;
    this.rotationInterval = setInterval(() => {
      this.img = this.imageCache[this.ROTATION_IMAGES[i]];
      i = (i + 1) % this.ROTATION_IMAGES.length;
    }, 20);
  }

  /** Markiert als zerbrochen, stoppt Bewegung/Rotation und startet Splash. */
    breakBottle() {
    if (this.isBroken) return;
    this.isBroken = true;
    this.stop();
    this.animateSplash();
  }

  stop() {
    clearInterval(this.moveInterval);
    clearInterval(this.rotationInterval);
  }

  /** Splash-Frames abspielen und Objekt danach aus der Welt entfernen. */
  animateSplash() {
    let i = 0;
    const len = this.SPLASH_IMAGES.length;
    const splashAnimation = setInterval(() => {
      this.img = this.imageCache[this.SPLASH_IMAGES[i]];
      i++;
      if (i >= len) {
        clearInterval(splashAnimation);
        setTimeout(() => {
          const index = world.throwableObjects.indexOf(this);
          if (index > -1) world.throwableObjects.splice(index, 1);
        }, 300);
      }
    }, 50);
  }

  /** Hilfsfunktion: stoppt alle laufenden Intervalle. */
  stop() {
    clearInterval(this.moveInterval);
    clearInterval(this.rotationInterval);
  }
}

