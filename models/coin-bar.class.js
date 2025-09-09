/**
 * Coin bar: tracks and displays collected coins in steps of 20%.
 * Extends DrawableObject to render images from cache.
 * @extends DrawableObject
 */
class CoinBar extends DrawableObject {
    percentage = 0;

    IMAGES_COINSBAR = [
        'img/7_statusbars/1_statusbar/1_statusbar_coin/green/0.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/green/20.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/green/40.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/green/60.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/green/80.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/green/100.png'
    ];

    /**
     * Loads coin bar images and sets initial percentage to 0.
     */
    constructor() {
        super();
        this.loadImages(this.IMAGES_COINSBAR);
        this.width = 200;
        this.height = 50;
        this.setPercentage(0);
    }

    /**
     * Updates bar position, percentage and displayed image.
     */
    setPercentage(percentage) {
        this.x = 40;
        this.y = 40;
        this.percentage = percentage;
        const path = this.IMAGES_COINSBAR[this.resolveImageIndex()];
        this.img = this.imageCache[path];
    }

    /**
     * Resolves index of image based on current percentage.
     * @returns {number} Index of image in IMAGES_COINSBAR
     */
    resolveImageIndex() {
        if (this.percentage == 100) return 5;
        if (this.percentage >= 80) return 4;
        if (this.percentage >= 60) return 3;
        if (this.percentage >= 40) return 2;
        if (this.percentage >= 20) return 1;
        return 0;
    }
}
