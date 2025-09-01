class Bottle extends MovableObject {
    y = 250;
    height = 100;
    width = 100;

    constructor() {
        super().loadImage('img/6_salsa_bottle/salsa_bottle.png');        
        this.x = 200 + Math.random() * 2200;                 
    }    
}