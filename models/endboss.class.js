/**
 * Endboss: läuft nach links und wechselt zwischen Walk/Hurt/Dead-Animationen.
 * Positioniert sich am Levelende. Nutzt Energie-/Hurt-/Dead-Logik aus MovableObject.
 * @extends MovableObject
 */
class Endboss extends MovableObject {
    height = 400;
    width = 250;
    y = 60;
    maxEnergy = 100;
    energy = this.maxEnergy;
    lastHit = 0;

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

    /** Lädt Assets, setzt Startposition und startet Loops. */
    constructor() {
        super().loadImage('img/4_enemie_boss_chicken/2_alert/G5.png');
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_AGGRO);
        this.x = 2800;
        this.animate();
    }

    /** Startet Bewegungs- und Animationsintervalle. */
    animate() {
        const AGGRO_START = 520;
        const AGGRO_STOP = 640;
        const MELEE_ZONE = 60;
        const WALK = 0.6;
        const RUN = 1.6;
        this.walkInterval = setInterval(() => {
            if (this.isDead() || !this.world || this.world.paused) return;

            const c = this.world.character;
            const cx = c.x + c.width / 2;
            const bx = this.x + this.width / 2;
            const dx = cx - bx;
            const adx = Math.abs(dx);


            this._aggro = this._aggro
                ? (adx > AGGRO_STOP ? false : true)
                : (adx < AGGRO_START ? true : false);


            this.speed = this._aggro ? RUN : WALK;


            if (adx > MELEE_ZONE) {
                if (dx < 0) { this.moveLeft(); this.otherDirection = false; }
                else { this.moveRight(); this.otherDirection = true; }
            }
        }, 1000 / 60);

        this.animationInterval = setInterval(() => {
            if (this.isDead()) return this.playAnimation(this.IMAGES_DEAD);
            if (this.isHurt()) return this.playAnimation(this.IMAGES_HURT);
            if (this._aggro && this.IMAGES_AGGRO.length)
                return this.playAnimation(this.IMAGES_AGGRO);
            return this.playAnimation(this.IMAGES_WALKING);
        }, 160);
    }

    /** Stoppt beide Intervalle. */
    stop() {
        clearInterval(this.walkInterval);
        clearInterval(this.animationInterval);
    }
}


