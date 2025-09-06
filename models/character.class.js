/**
 * Spieler-Charakter (Pepe): Bewegung, Animationen, Sounds.
 * Tasten: LEFT, RIGHT, SPACE. Nutzt world.keyboard und world.paused.
 * @extends MovableObject
 */
class Character extends MovableObject {
    world;
    height = 280;
    y = 60;
    speed = 20;
    sfxJump = new Audio('audio/jump.mp3');
    sfxHurt = new Audio('audio/hurt.mp3');
    sfxDead = new Audio('audio/dead.mp3');
    sfxWalk = new Audio('audio/walking.mp3');
    deadPlayed = false;
    lastInputTs = Date.now();

    IMAGES_WALKING = [
        'img/2_character_pepe/2_walk/W-21.png',
        'img/2_character_pepe/2_walk/W-22.png',
        'img/2_character_pepe/2_walk/W-23.png',
        'img/2_character_pepe/2_walk/W-24.png',
        'img/2_character_pepe/2_walk/W-25.png',
        'img/2_character_pepe/2_walk/W-26.png',
    ];

    IMAGES_JUMPING = [
        'img/2_character_pepe/3_jump/J-31.png',
        'img/2_character_pepe/3_jump/J-32.png',
        'img/2_character_pepe/3_jump/J-33.png',
        'img/2_character_pepe/3_jump/J-34.png',
        'img/2_character_pepe/3_jump/J-35.png',
        'img/2_character_pepe/3_jump/J-36.png',
        'img/2_character_pepe/3_jump/J-37.png',
        'img/2_character_pepe/3_jump/J-38.png',
        'img/2_character_pepe/3_jump/J-39.png',
    ];

    IMAGES_DEAD = [
        'img/2_character_pepe/5_dead/D-51.png',
        'img/2_character_pepe/5_dead/D-52.png',
        'img/2_character_pepe/5_dead/D-53.png',
        'img/2_character_pepe/5_dead/D-54.png',
        'img/2_character_pepe/5_dead/D-55.png',
        'img/2_character_pepe/5_dead/D-56.png',
        'img/2_character_pepe/5_dead/D-57.png',
    ];

    IMAGES_HURT = [
        'img/2_character_pepe/4_hurt/H-41.png',
        'img/2_character_pepe/4_hurt/H-42.png',
        'img/2_character_pepe/4_hurt/H-43.png',
    ];

    IMAGES_IDLE = [
        'img/2_character_pepe/1_idle/idle/I-1.png',
        'img/2_character_pepe/1_idle/idle/I-2.png',
        'img/2_character_pepe/1_idle/idle/I-3.png',
        'img/2_character_pepe/1_idle/idle/I-4.png',
        'img/2_character_pepe/1_idle/idle/I-5.png',
        'img/2_character_pepe/1_idle/idle/I-6.png',
        'img/2_character_pepe/1_idle/idle/I-7.png',
        'img/2_character_pepe/1_idle/idle/I-8.png',
        'img/2_character_pepe/1_idle/idle/I-9.png',
        'img/2_character_pepe/1_idle/idle/I-10.png',
    ];

    IMAGES_SLEEP = [
        'img/2_character_pepe/1_idle/long_idle/I-11.png',
        'img/2_character_pepe/1_idle/long_idle/I-12.png',
        'img/2_character_pepe/1_idle/long_idle/I-13.png',
        'img/2_character_pepe/1_idle/long_idle/I-14.png',
        'img/2_character_pepe/1_idle/long_idle/I-15.png',
        'img/2_character_pepe/1_idle/long_idle/I-16.png',
        'img/2_character_pepe/1_idle/long_idle/I-17.png',
        'img/2_character_pepe/1_idle/long_idle/I-18.png',
        'img/2_character_pepe/1_idle/long_idle/I-19.png',
        'img/2_character_pepe/1_idle/long_idle/I-20.png',
    ];

    /**
     * Audio sicher abspielen (setzt currentTime zurück).
     * @param {HTMLAudioElement} a
     */
    playSfx(a) {
        if (this.world?.muted || !this.world?.audioReady) return; // <— Guard
        try {
            a.currentTime = 0;
            a.play().catch(() => { }); // <— Promise abfangen, kein Console-Error
        } catch (e) { }
    }

    /** Mute-Status vom World-Flag auf alle Character-Sounds spiegeln. */
    syncMute() {
        const m = !!this.world?.muted;
        [this.sfxJump, this.sfxHurt, this.sfxDead, this.sfxWalk].forEach(a => {
            if (!a) return;
            a.muted = m;
            if (m) { try { a.pause(); } catch (e) { } }
        });
    }

    /** Lädt Assets, startet Physik & Loops. */
    constructor() {
        super().loadImage('img/2_character_pepe/1_idle/idle/I-1.png');
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_SLEEP);
        this.applyGravity();
        this.animate();
         this.sfxHurt.volume = 0.05;
         this.sfxJump.volume = 0.15;
         this.sfxDead.volume = 0.15;
        this.hitboxLeft = 10;
        this.hitboxRight = 10;
        this.hitboxTop = 100;
        this.hitboxBottom = 10;
    }

    /** Startet die Animations-/Bewegungs-Loops. */
    animate() {
        this.startLoops();
    }

    /** Timer für Bewegung (40 FPS) und Animation (20 FPS) setzen. */
    startLoops() {
        this.stopLoops();
        this._moveTimer = setInterval(() => this.tickMove(), 1000 / 25);
        this._animTimer = setInterval(() => this.tickAnim(), 60);
    }

    /** Timer stoppen. */
    stopLoops() {
        if (this._moveTimer) { clearInterval(this._moveTimer); this._moveTimer = null; }
        if (this._animTimer) { clearInterval(this._animTimer); this._animTimer = null; }
    }

    /**
     * Input & Bewegung (RIGHT/LEFT/SPACE) + Kamera-Offset.
     * Wird ca. 40x pro Sekunde ausgeführt.
     */
    tickMove() {
        if (this.world?.paused) return;
        const kb = this.world.keyboard || {};
        let moved = false;

        if (kb.RIGHT && this.x < this.world.level.level_ende_x) {
            this.moveRight(); this.otherDirection = false; moved = true;
        }
        if (kb.LEFT && this.x > 0) {
            this.moveLeft(); this.otherDirection = true; moved = true;
        }
        if (kb.SPACE && !this.isAboveGround()) {
            this.jump(); this.playSfx(this.sfxJump); moved = true;
        }
        if (moved) this.lastInputTs = Date.now();
        this.world.camera_x = -this.x + 100;
    }

    /**
     * Wählt und spielt passende Animations-Sequenz (dead/hurt/jump/walk).
     * Wird ca. 20x pro Sekunde ausgeführt.
     */
    tickAnim() {
        if (this.world?.paused) return;
        if (this.isDead()) {
            if (!this.deadPlayed) { this.deadPlayed = true; this.playSfx(this.sfxDead); }
            return this.playAnimation(this.IMAGES_DEAD);
        }
        if (this.isHurt()) return this.playAnimation(this.IMAGES_HURT);
        if (this.isAboveGround()) return this.playAnimation(this.IMAGES_JUMPING);

        const moving = this.world.keyboard.RIGHT || this.world.keyboard.LEFT;
        if (moving) return this.playAnimation(this.IMAGES_WALKING);

        const idleFor = (Date.now() - this.lastInputTs) / 1000;
        if (idleFor > 8 && this.IMAGES_SLEEP?.length) {
            return this.playAnimation(this.IMAGES_SLEEP);   // Sleep
        }
        return this.playAnimation(this.IMAGES_IDLE?.length ? this.IMAGES_IDLE : this.IMAGES_WALKING); // Idle
    }

    /** Schaden anwenden; spielt Hurt-Sound, wenn nicht tot. */
    hit() {
        super.hit();
        if (!this.isDead()) this.playSfx(this.sfxHurt);
    }
}