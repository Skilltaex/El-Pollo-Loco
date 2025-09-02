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
    sfxBossDead = new Audio('audio/win.mp3');
    muted = false;
    music = new Audio('audio/background-music.mp3');

    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.setupAudio();
        this.ensureVictoryOverlay();
        this.draw();
        this.setWorld();
        this.run();
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('muted', this.muted ? '1' : '0');
        this.applyMuteUI();
        if (this.muted) {
            this.music.pause();
        } else {
            this.music.play().catch(() => { });
        }
    }

    applyMuteUI() {
        let btn = document.querySelector('.btn-mute');
        if (btn) btn.classList.toggle('is-muted', this.muted);
    }

    setupAudio() {
        this.music.loop = true;
        this.music.volume = 0.01;
        this.muted = localStorage.getItem('muted') === '1';
        this.applyMuteUI();
        const startOnce = () => {
            if (!this.muted) this.music.play().catch(() => { });
            window.removeEventListener('pointerdown', startOnce, { capture: true });
        };
        window.addEventListener('pointerdown', startOnce, { capture: true, once: true });
    }

    ensureVictoryOverlay() {
    const wrapper = document.getElementById('game') || this.canvas?.parentElement;
    if (!wrapper) return;

    let el = document.getElementById('victory-overlay');
    if (!el) {
        el = document.createElement('div');
        el.id = 'victory-overlay';
        el.className = 'overlay overlay--win'; // ← WICHTIG
        wrapper.appendChild(el);
    } else {
        // Falls im HTML nur id gesetzt war, Klassen nachrüsten
        el.classList.add('overlay', 'overlay--win');
    }
    this.victoryEl = el;
}

    setWorld() {
        this.character.world = this;
        this.endboss.world = this;
        this.collectedCoins = 0;
        this.totalCoins = this.level.coins.length;
        this.collectedBottles = 0;
        this.totalBottles = this.level.bottles.length;
    }

    run() {
        setInterval(() => {
            if (this.paused) return;
            this.checkCollisions();
            this.checkBossCollision();
            this.checkThrowObjects();
            this.checkCoinCollection();
            this.checkBottleCollection();
            if (!this.keyboard.D) this.canThrow = true;
            if (this.character.isDead()) this.onPlayerKilled();
        }, 1000 / 60);
    }

    checkBossCollision() {
        if (!this.endboss || this.endboss.isDead()) return;
        if (this.character.isDead()) return;
        if (this.character.isColliding(this.endboss) && !this.character.isHurt()) {
            this.applySideHit();
        }
    }

    onPlayerKilled() {
        if (this.defeatScheduled) return;
        this.defeatScheduled = true;

        let frames = this.character.IMAGES_DEAD?.length || 1;
        setTimeout(() => {
            let el = document.querySelector('.overlay--lose');
            if (el) {
                el.classList.add('show');
                let btn = el.querySelector('.restart-btn');
                if (btn) btn.onclick = () => this.resetGame();
            }
            this.paused = true;
        }, frames * 50);
    }

    resetGame() {
        location.replace(location.pathname + '?t=' + Date.now());
        location.reload();
    }

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

    endbossHit() {
        for (let i = this.throwableObjects.length - 1; i >= 0; i--) {
            let b = this.throwableObjects[i];
            if (!b.isColliding(this.endboss) || this.endboss.isDead()) {
                continue;
            }
            this.throwableObjects.splice(i, 1);
            this.endboss.hit(20);
            this.updateBossBar();
            if (this.endboss.isDead()) {
                this.onBossKilled();
            }
        }
    }

    updateBossBar() {
        let pct = (this.endboss.energy / this.endboss.maxEnergy) * 100;
        this.bossBar.setPercentage(pct);
    }

   onBossKilled() {
    if (this.victoryScheduled) return;
    this.victoryScheduled = true;

    try { this.sfxBossDead.currentTime = 0; this.sfxBossDead.play(); } catch(e) {}

    const delay = (this.endboss.IMAGES_DEAD?.length || 1) * 200;

    setTimeout(() => {
        const el = this.victoryEl || document.getElementById('victory-overlay');
        if (el) {
            el.classList.add('show');
            el.onclick = () => this.resetGame();
        }
        this.paused = true; // NACH dem Anzeigen
    }, delay);
}


    resetGame() {
        this.paused = true;
        window.location.reload();
    }


    isHeadStomp(enemy) {
        let prevBottom = this.character.prevY + this.character.height;
        let currBottom = this.character.y + this.character.height;
        return enemy instanceof Chicken &&
            this.character.speedY < 0 &&
            prevBottom <= enemy.y &&
            currBottom >= enemy.y;
    }

    removeEnemy(idx) {
        this.level.enemies.splice(idx, 1);
    }

    applySideHit() {
        this.character.hit();
        this.statusBar.setPercentage(this.character.energy);
    }

    handleStomp(enemy, array) {
        let prevBottom = this.character.prevY + this.character.height;
        let currBottom = this.character.y + this.character.height;
        let enemyTop = enemy.y;
        if (this.character.speedY < 0 &&
            prevBottom <= enemyTop &&
            currBottom >= enemyTop) {
            let idx = array.indexOf(enemy);
            if (idx !== -1) {
                array.splice(idx, 1);
            }
        }
        return false;
    }

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

    checkThrowObjects() {
        if (this.keyboard.D &&
            this.canThrow &&
            this.collectedBottles > 0) {
            this.throwBottle();
            this.canThrow = false;
        }
    }

    throwBottle() {
        let b = new ThrowableObject(this.character.x + 100, this.character.y + 100);
        this.throwableObjects.push(b);
        this.collectedBottles--;
        let pct = (this.collectedBottles / this.totalBottles) * 100;
        this.bottleBar.setPercentage(pct);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.translate(this.camera_x, 0);
        this.addObjectsInToWorld();
        this.ctx.translate(-this.camera_x, 0);
        let self = this;
        if (this.paused) return;
        requestAnimationFrame(function () {
            self.draw();
        });
    }

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

    addToBoss() {
        this.addToMap(this.endboss);
        this.bossBar.x = this.endboss.x
            + (this.endboss.width - this.bossBar.width) / 2;
        this.bossBar.y = this.endboss.y - 60;
        this.addToMap(this.bossBar);
    }


    addObjectToMap(objects) {
        objects.forEach(o => {
            this.addToMap(o)
        });
    };

    addToMap(mo) {
        if (mo.otherDirection) {
            this.flipCharacter(mo);
        }
        mo.draw(this.ctx);
        mo.drawFrame(this.ctx);
        if (mo.otherDirection) {
            this.flipCharacterBack(mo);
        }
    }

    flipCharacter(mo) {
        this.ctx.save();
        this.ctx.translate(mo.width, 0);
        this.ctx.scale(-1, 1);
        mo.x = mo.x * -1;
    }

    flipCharacterBack(mo) {
        mo.x = mo.x * -1;
        this.ctx.restore();
    }
}
