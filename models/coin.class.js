class Coin extends MovableObject {
    y = 100;
    height = 200;
    width = 200;

    IMAGES_COIN = [
        'img/8_coin/coin_1.png',
        'img/8_coin/coin_2.png',
    ];

    constructor() {
        super().loadImage('img/8_coin/coin_1.png');
        this.loadImages(this.IMAGES_COIN);
        this.x = 200 + Math.random() * 2200;
        this.y = 60 + Math.random() * 120; 
        this.animate();
    }

    animate() {
        setInterval(() => {
            this.playAnimation(this.IMAGES_COIN);
        }, 500);
    }
}