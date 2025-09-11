/**
 * Cloud object that moves slowly across the background.
 * Used to create a parallax effect in the game world.
 * @extends MovableObject
 */
class Cloud extends MovableObject {
    y = 20;
    width = 500;
    height = 250;   

    constructor() {
        super().loadImage('img/5_background/layers/4_clouds/1.png');
        this.x = Math.random() * 2500;
        this.animate();
        this.speed = 0.2 + Math.random() * 0.5; // between 0.2 and 0.7
    }

    /**
     * Continuously moves the cloud to the left.
     */
    animate() {
       setInterval(() => {
            this.moveLeft();
        }, 1000 / 60);
    }   
}
