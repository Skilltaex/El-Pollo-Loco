class Chicken extends MovableObject {
    y = 360;
    height = 70;
    width = 70;

    IMAGES_WALKING = [
        'img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
        'img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
        'img/3_enemies_chicken/chicken_normal/1_walk/3_w.png',
    ];

    IMAGES_DEAD = [
        'img/3_enemies_chicken/chicken_normal/2_dead/dead.png'
    ];

    constructor() {
        super().loadImage('img/3_enemies_chicken/chicken_normal/1_walk/1_w.png');
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_DEAD);
        this.x = 500 + Math.random() * 1500;
        this.speed = 0.15 + Math.random() * 0.5;
        this.animate();
    }

    animate() {
        this.walkInterval = setInterval(() => {
            if (!this.isDead()) this.moveLeft();
        }, 1000 / 60);
        this.animationInterval = setInterval(() => {
            if (this.isDead()) {                
                this.img = this.imageCache[this.IMAGES_DEAD[0]];
            } else {
                this.playAnimation(this.IMAGES_WALKING);
            }
        }, 200);
    }

    die() {
        this.energy = 0;
        clearInterval(this.walkInterval);
    }
}
