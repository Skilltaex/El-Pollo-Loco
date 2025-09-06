class DrawableObject {
    x = 120;
    y = 280;
    img;
    height = 150;
    width = 100;
    imageCache = {};
    currentImage = 0;

    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    loadImages(arr) {
        arr.forEach((path) => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }

    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    drawFrame(ctx) {
        if (this instanceof Character) {
            let w = this.width * (this.hitboxScaleX || 1);
            let h = this.height * (this.hitboxScaleY || 1);
            let x = this.x + (this.hitboxOffsetX || 0);
            let y = this.y + (this.hitboxOffsetY || 0);
        }
    }
}