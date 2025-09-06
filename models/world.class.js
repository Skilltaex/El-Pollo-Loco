/**
 * Spielwelt: hält Canvas/Context, Entities, Loop/Collision,
 * Overlays (Win/Lose) und Audio/Mute-State.
 */
class World {
    character = new Character();
    endboss = new Endboss();
    level = level1;
    canvas;
    ctx;
    keyboard;
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
    sfxBossDead = new Audio('audio/win.mp3');
    muted = false;
    music = new Audio('audio/background-music.mp3');
    audioReady = false;

    /**
     * @param {HTMLCanvasElement} canvas
     * @param {Record<string, boolean>} keyboard
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

    /** Mute umschalten und UI/Audio anpassen. */
    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('muted', this.muted ? '1' : '0');
        this.applyMuteUI();
        const m = this.muted;
        if (this.music) this.music.muted = m;
        if (this.sfxBossDead) this.sfxBossDead.muted = m;
        this.character?.syncMute?.();
        if (!m && this.audioReady) this.music.play().catch(() => { });
        if (m) this.music.pause();
    }

    /** Mute-Button visuell updaten. */
    applyMuteUI() {
        let btn = document.querySelector('.btn-mute');
        if (btn) btn.classList.toggle('is-muted', this.muted);
    }

    /** Hintergrundmusik vorbereiten (Autoplay nach erstem Pointerdown). */
    setupAudio() {
        this.music.loop = true;
        this.music.volume = 0.010;
        this.sfxBossDead.volume = 0.15;
        this.muted = localStorage.getItem('muted') === '1';
        this.applyMuteUI();
        const m = this.muted;
        if (this.music) this.music.muted = m;
        if (this.sfxBossDead) this.sfxBossDead.muted = m;
        this.character?.syncMute?.();
        const unlock = () => {
            this.audioReady = true;
            if (!this.muted) this.music.play().catch(() => { });
            window.removeEventListener('pointerdown', unlock, { capture: true });
        };
        window.addEventListener('pointerdown', unlock, { capture: true, once: true });
    }

    /** Sieges-Overlay sicherstellen (falls im DOM nicht vorhanden). */
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

    /** Referenzen setzen & Zähler initialisieren. */
    setWorld() {
        this.character.world = this;
        this.endboss.world = this;
        this.collectedCoins = 0;
        this.totalCoins = this.level.coins.length;
        this.collectedBottles = 0;
        this.totalBottles = this.level.bottles.length;
    }

    /** Game-Loop für Logik (60 Hz). */
    run() {
        if (this._loop) clearInterval(this._loop);
        this._loop = setInterval(() => {
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


    /** Seitentreffer gegen Boss prüfen. */
    checkBossCollision() {
        if (!this.endboss || this.endboss.isDead()) return;
        if (this.character.isDead()) return;
        if (this.character.isColliding(this.endboss) && !this.character.isHurt()) {
            this.applySideHit();
        }
    }

    /**
     * Klasse zum Ausblenden der Mobile-Buttons setzen,
     * wenn Win/Lose-Overlay aktiv ist.
     * @param {boolean} active
     */
    setOverlay(active) {
        const g = this.canvas && this.canvas.parentElement;
        if (g) g.classList.toggle('has-overlay', !!active);
    }

    /** Lose-Screen zeigen und pausieren. */
    onPlayerKilled() {
        if (this.defeatScheduled) return;
        this.defeatScheduled = true;
        let frames = this.character.IMAGES_DEAD?.length || 1;
        setTimeout(() => {
            let el = document.querySelector('.overlay--lose');
            if (el) {
                el.classList.add('show');
                this.setOverlay(true);
                let btn = el.querySelector('.restart-btn');
                if (btn) btn.onclick = () => this.resetGame();
            }
            this.paused = true;
        }, frames * 50);
    }

    /** Win-Screen nach Boss-Tod zeigen und pausieren. */
    onBossKilled() {
        if (this.victoryScheduled) return;
        this.victoryScheduled = true;
        const delay = (this.endboss.IMAGES_DEAD?.length || 1) * 200;
        setTimeout(() => {
            if (!this.muted && this.sfxBossDead) {
                try { this.sfxBossDead.currentTime = 0; this.sfxBossDead.play(); } catch (e) { }
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

    /** Neustart der Seite (UI-Klasse zurücksetzen). */
    resetGame() {
        this.setOverlay(false);
        window.location.reload();
    }

    /** Kollisionen mit Gegnern prüfen (Stomp/Seitentreffer) + Boss-Treffer. */
    checkCollisions() {
        for (let i = this.level.enemies.length - 1; i >= 0; i--) {
            let enemy = this.level.enemies[i];
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

    /** Flaschen-Treffer gegen Boss verarbeiten. */
    endbossHit() {
        for (let i = this.throwableObjects.length - 1; i >= 0; i--) {
            let b = this.throwableObjects[i];
            if (!b.isColliding(this.endboss) || this.endboss.isDead()) continue;
            this.throwableObjects.splice(i, 1);
            this.endboss.hit(20);
            this.updateBossBar();
            if (this.endboss.isDead()) {
                this.onBossKilled();
            }
        }
    }

    /** Boss-Lebensbalken aktualisieren. */
    updateBossBar() {
        let pct = (this.endboss.energy / this.endboss.maxEnergy) * 100;
        this.bossBar.setPercentage(pct);
    }

    /**
     * Kopfstoß-Erkennung: Spieler fällt von oben auf den Gegner.
     * @param {any} enemy
     * @returns {boolean}
     */
    isHeadStomp(enemy) {
        let prevBottom = this.character.prevY + this.character.height;
        let currBottom = this.character.y + this.character.height;
        return enemy instanceof Chicken &&
            this.character.speedY < 0 &&
            prevBottom <= enemy.y &&
            currBottom >= enemy.y;
    }

    /** Gegner aus dem Level-Array entfernen. */
    removeEnemy(idx) {
        this.level.enemies.splice(idx, 1);
    }

    /** Seitentreffer auf Spieler anwenden + Lebensbalken updaten. */
    applySideHit() {
        this.character.hit();
        this.statusBar.setPercentage(this.character.energy);
    }

    /** Münzen einsammeln und Anzeige updaten. */
    checkCoinCollection() {
        this.level.coins.forEach((coin, index) => {
            if (this.character.isColliding(coin)) {
                this.level.coins.splice(index, 1);
                this.collectedCoins++;
                let percentage = (this.collectedCoins / this.totalCoins) * 100;
                this.coinBar.setPercentage(percentage);
            }
        });
    }

    /** Flaschen einsammeln und Anzeige updaten. */
    checkBottleCollection() {
        this.level.bottles.forEach((bottle, index) => {
            if (this.character.isColliding(bottle)) {
                this.level.bottles.splice(index, 1);
                this.collectedBottles++;
                let percentage = (this.collectedBottles / this.totalBottles) * 100;
                this.bottleBar.setPercentage(percentage);
            }
        });
    }

    /** Wurf-Eingabe prüfen und ggf. Flasche erzeugen. */
    checkThrowObjects() {
        const kb = this.keyboard || window.keyboard || {};
        if (kb.D && this.canThrow && this.collectedBottles > 0) {
            this.throwBottle();
            this.canThrow = false;
        }
    }

    /** Neue Flasche werfen und Anzeige anpassen. */
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

    /** Render-Loop (requestAnimationFrame), respektiert Pause. */
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.translate(this.camera_x, 0);
        this.addObjectsInToWorld();
        this.ctx.translate(-this.camera_x, 0);
        if (this.paused) return;
        this._raf = requestAnimationFrame(() => this.draw());
    }


    /** Zeichen-Reihenfolge festlegen (Hintergrund, Spieler, UI, Objekte). */
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

    /** Boss + Boss-Lebensbalken zeichnen (über dem Boss positioniert). */
    addToBoss() {
        this.addToMap(this.endboss);
        this.bossBar.x = this.endboss.x + (this.endboss.width - this.bossBar.width) / 2;
        this.bossBar.y = this.endboss.y - 60;
        this.addToMap(this.bossBar);
    }

    /**
     * Array von Objekten zeichnen.
     * @param {any[]} objects
     */
    addObjectToMap(objects) {
        if (!objects || !objects.forEach) return;
        objects.forEach(o => this.addToMap(o));
    }

    /**
     * Einzelnes Objekt (mit evtl. Flip) zeichnen.
     * @param {any} mo
     */
    addToMap(mo) {
        if (!mo) return;
        if (mo.otherDirection) this.flipCharacter(mo);
        mo.draw(this.ctx);
        mo.drawFrame?.(this.ctx);
        if (mo.otherDirection) this.flipCharacterBack(mo);
    }

    /** Kontext spiegeln, um nach links dargestellte Sprites zu zeichnen. */
    flipCharacter(mo) {
        this.ctx.save();
        this.ctx.translate(mo.width, 0);
        this.ctx.scale(-1, 1);
        mo.x = mo.x * -1;
    }

    /** Spiegelung zurücksetzen. */
    flipCharacterBack(mo) {
        mo.x = mo.x * -1;
        this.ctx.restore();
    }
}

