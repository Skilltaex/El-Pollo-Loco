/**
 * Bewegliches Objekt: Basis für Charaktere/Feinde/Projektile.
 * Enthält Physik (Schwerkraft), Kollision, Treffer/Schaden und Animation.
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

    /**
     * Startet einfache Schwerkraft (60 FPS).
     * Aktualisiert y/speedY und merkt sich prevY.
     * Hinweis: Interval wird nicht gecleart – ggf. Timer merken & clearen.
     */
    applyGravity() {
        setInterval(() => {
            if (this.isAboveGround() || this.speedY > 0) {
                this.prevY = this.y;
                this.y -= this.speedY;
                this.speedY -= this.acceleration;
            }
        }, 1000 / 60);
    }

    /**
     * Liefert die (optional verkleinerte) Hitbox.
     * @returns {{x:number,y:number,w:number,h:number}}
     */
    getHitbox() {
        const x = this.x + this.hitboxLeft;
        const y = this.y + this.hitboxTop;
        const w = this.width - this.hitboxLeft - this.hitboxRight;
        const h = this.height - this.hitboxTop - this.hitboxBottom;
        return { x, y, w, h };
    }

    /**
     * Objekte über dem Boden? (Sonderfall: Wurfobjekte immer true)
     * @returns {boolean}
     */
    isAboveGround() {
        if (this instanceof ThrowableObject) {
            return true;
        } else
            return this.y < 140;
    }

    /**
     * Achsen-parallele Bounding-Box-Kollision (AABB) mit voller Sprite-Größe.
     * Nutzt NICHT die Hitbox-Offsets.
     * @param {MovableObject} mo
     * @returns {boolean}
     */
    isColliding(mo) {
        const a = this.getHitbox ? this.getHitbox() : { x: this.x, y: this.y, w: this.width, h: this.height };
        const b = mo.getHitbox ? mo.getHitbox() : { x: mo.x, y: mo.y, w: mo.width, h: mo.height };
        return a.x < b.x + b.w &&
            a.x + a.w > b.x &&
            a.y < b.y + b.h &&
            a.y + a.h > b.y;
    }

    /**
     * Verursacht Schaden (20). Merkt Zeitpunkt des Treffers.
     * @returns {void}
     */
    hit() {
        this.energy -= 20;
        if (this.energy < 0) {
            this.energy = 0;
        } else {
            this.lastHit = new Date().getTime();
        }
    }

    /**
     * Kurzer Unverwundbarkeits-/Hurt-Zustand nach Treffer (< 1s).
     * @returns {boolean}
     */
    isHurt() {
        let timePassed = new Date().getTime() - this.lastHit;
        timePassed = timePassed / 1000;
        return timePassed < 1;
    }

    /**
     * Lebenspunkte auf 0?
     * @returns {boolean}
     */
    isDead() {
        return this.energy == 0;
    }

    /** Bewegt nach rechts um `speed`. */
    moveRight() {
        this.x += this.speed;
    }

    /** Bewegt nach links um `speed`. */
    moveLeft() {
        this.x -= this.speed;
    }

    /** Startet Sprung (setzt vertikale Geschwindigkeit). */
    jump() {
        this.speedY = 30;
    }

    /**
     * Spielt zyklisch die übergebenen Frame-Pfade ab.
     * @param {string[]} images
     * @returns {void}
     */
    playAnimation(images) {
        let i = this.currentImage % images.length;
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }
}
