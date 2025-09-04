class MovableObject extends DrawableObject {
    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 2.1;
    energy = 100;
    lastHit = 0;
    prevY = this.y;
    hitboxLeft = 0; hitboxRight = 0; hitboxTop = 0; hitboxBottom = 0;

    applyGravity() {
        setInterval(() => {
            if (this.isAboveGround() || this.speedY > 0) {
                this.prevY = this.y;
                this.y -= this.speedY;
                this.speedY -= this.acceleration;
            }
        }, 1000 / 60);
    }    

    getHitbox() {
        const x = this.x + this.hitboxLeft;
        const y = this.y + this.hitboxTop;
        const w = this.width - this.hitboxLeft - this.hitboxRight;
        const h = this.height - this.hitboxTop - this.hitboxBottom;
        return { x, y, w, h };
    }

    isAboveGround() {
        if (this instanceof ThrowableObject) {
            return true;
        } else
            return this.y < 140;
    }

    isColliding(mo) {
        return this.x < mo.x + mo.width &&
            this.x + this.width > mo.x &&
            this.y < mo.y + mo.height &&
            this.y + this.height > mo.y;
    }

    hit() {
        this.energy -= 20;
        if (this.energy < 0) {
            this.energy = 0;
        } else {
            this.lastHit = new Date().getTime();
        }
    }

    isHurt() {
        let timePassed = new Date().getTime() - this.lastHit;
        timePassed = timePassed / 1000;
        return timePassed < 1;
    }

    isDead() {
        return this.energy == 0;
    }

    moveRight() {
        this.x += this.speed;
    }

    moveLeft() {
        this.x -= this.speed;
    }

    jump() {
        this.speedY = 30;
    }

    playAnimation(images) {
        let i = this.currentImage % images.length;
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }
}