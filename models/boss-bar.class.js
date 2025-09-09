/**
 * Boss health bar: shows boss HP in steps of 20%.
 * Extends DrawableObject to render images from cache.
 * @extends DrawableObject
 */
class BossBar extends DrawableObject {
    percentage = 100;

    IMAGES_HEALTH = [
        'img/7_statusbars/2_statusbar_endboss/blue/blue0.png',
        'img/7_statusbars/2_statusbar_endboss/blue/blue20.png',
        'img/7_statusbars/2_statusbar_endboss/blue/blue40.png',
        'img/7_statusbars/2_statusbar_endboss/blue/blue60.png',
        'img/7_statusbars/2_statusbar_endboss/blue/blue80.png',
        'img/7_statusbars/2_statusbar_endboss/blue/blue100.png'
    ];

    IMAGES_DEATH = [
        'img/4_enemie_boss_chicken/5_dead/G24.png',
        'img/4_enemie_boss_chicken/5_dead/G25.png',
        'img/4_enemie_boss_chicken/5_dead/G26.png',
    ];

    /**
     * Loads health bar images and sets initial percentage.
     */
    constructor() {
        super();
        this.loadImages(this.IMAGES_HEALTH);
        this.width = 200;
        this.height = 50;
        this.setPercentage(this.percentage);
    }

    /**
     * Updates bar position, percentage and image.
     */
    setPercentage(p) {
        this.x = 1000;
        this.y = 40;
        this.percentage = p;
        const idx = this.resolveImageIndex();
        const path = this.IMAGES_HEALTH[idx];
        this.img = this.imageCache[path];
    }

    /**
     * Resolves index of image based on current percentage.
     * @returns {number} Index of image in IMAGES_HEALTH
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
