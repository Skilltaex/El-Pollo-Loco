class Cloud extends MovableObject {
    y = 20;
    width = 500;
    height = 250;   

    constructor() {
        super().loadImage('img/5_background/layers/4_clouds/1.png');
        this.x = Math.random() * 2500;
        this.animate();
        this.speed = 0.2 + Math.random() * 0.5; // Geschwindigkeit zwischen 0.2 und 0.7
    }

    animate() {
       setInterval(() => {
            this.moveLeft();
        }, 1000 / 60);
    }   
}