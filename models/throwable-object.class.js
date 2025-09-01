class ThrowableObject extends MovableObject {
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

    isBroken = false;
    rotationInterval;
    moveInterval;

    constructor(x, y) {
        super();
        this.loadImage(this.ROTATION_IMAGES[0]);
        this.loadImages(this.ROTATION_IMAGES);
        this.loadImages(this.SPLASH_IMAGES);
        this.x = x;
        this.y = y;
        this.height = 80;
        this.width = 75;
        this.throw();
    }

    throw() {
        this.speedY = 20;
        this.applyGravity();
        this.animateRotation();
        this.moveInterval = setInterval(() => {
            this.x += 10;            
            if (this.y >= 260 && !this.isBroken) {
                this.breakBottle();
            }
        }, 20);
    }

    animateRotation() {
        let i = 0;
        this.rotationInterval = setInterval(() => {
            this.img = this.imageCache[this.ROTATION_IMAGES[i]];
            i = (i + 1) % this.ROTATION_IMAGES.length;
        }, 20);
    }

    breakBottle() {
        this.isBroken = true;
        clearInterval(this.moveInterval);
        clearInterval(this.rotationInterval);
        this.animateSplash();
    }   

    animateSplash() {
        let i = 0;
        let splashAnimation = setInterval(() => {
            this.img = this.imageCache[this.SPLASH_IMAGES[i]];
            if (i >= this.SPLASH_IMAGES.length) {
                clearInterval(splashAnimation);                
                setTimeout(() => {
                    let index = world.throwableObjects.indexOf(this);
                    if (index > -1) {
                        world.throwableObjects.splice(index, 1);
                    }
                }, 1000);
            }
        }, 50);
    }
}
