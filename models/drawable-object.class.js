/**
 * Base renderable object: defines position, size and image handling.
 * Other game entities (character, enemies, projectiles) extend this class.
 */
class DrawableObject {
  x = 120;
  y = 280;
  img;
  height = 150;
  width = 100;
  imageCache = {};
  currentImage = 0;

  /** Loads a single image and sets it as the current sprite. */
  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }

  /** Preloads a list of images into the cache for fast access. */
  loadImages(arr) {
    arr.forEach((path) => {
      const img = new Image();
      img.src = path;
      this.imageCache[path] = img;
    });
  }

  /** Draws the current sprite on the given canvas context. */
  draw(ctx) {
    if (!this.img) return;
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }
}
