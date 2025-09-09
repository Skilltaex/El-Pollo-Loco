/**
 * Status bar: displays the player's health in steps of 20%.
 * Extends DrawableObject to render images from cache.
 * @extends DrawableObject
 */
class StatusBar extends DrawableObject {
    percentage = 100;

    IMAGES_STATUSBAR = [
        'img/7_statusbars/1_statusbar/2_statusbar_health/blue/0.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/blue/20.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/blue/40.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/blue/60.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/blue/80.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/blue/100.png'
    ];

    /**
     * Loads health bar images and sets initial percentage to 100.
     */
    constructor() {
        super();
        this.loadImages(this.IMAGES_STATUSBAR);
        this.width = 200;
        this.height = 50;
        this.setPercentage(100);
    }

    /**
     * Updates bar position, percentage and displayed image.
     */
    setPercentage(percentage) {
        this.x = 40;
        this.y = 0;
        this.percentage = percentage;
        const path = this.IMAGES_STATUSBAR[this.resolveImageIndex()];
        this.img = this.imageCache[path];
    }

    /**
     * Resolves index of image based on current percentage.
     * @returns {number} Index of image in IMAGES_STATUSBAR
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
