/**
 * Activates a key in the global keyboard state and highlights the button.
 * @param {'LEFT'|'RIGHT'|'SPACE'|'D'} key - The key to activate.
 * @param {HTMLElement} [btn] - Optional button element to highlight.
 */
function pressKey(key, btn) {
    if (!window.keyboard) return;
    window.keyboard[key] = true;
    if (btn) btn.classList.add('on');
}

/**
 * Deactivates a key in the global keyboard state and removes button highlight.
 * @param {'LEFT'|'RIGHT'|'SPACE'|'D'} key - The key to deactivate.
 * @param {HTMLElement} [btn] - Optional button element to un-highlight.
 */
function releaseKey(key, btn) {
    if (!window.keyboard) return;
    window.keyboard[key] = false;
    if (btn) btn.classList.remove('on');
}

/**
 * Binds pointer events to a control button.
 * Ensures multi-touch support and avoids duplicate triggers.
 * @param {HTMLElement} btn - Button with a `data-key` attribute.
 */
function bindControl(btn) {
    const key = btn.dataset.key;
    if (!key) return;

    let downCount = 0;

    /** @param {PointerEvent} e */
    function onDown(e) {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        e.preventDefault();
        if (downCount === 0) {
            pressKey(key, btn);
            btn.classList.add('on');
        }
        downCount++;
        if (btn.setPointerCapture) btn.setPointerCapture(e.pointerId);
    }

    function onUp() {
        if (downCount > 0) downCount--;
        if (downCount === 0) {
            releaseKey(key, btn);
            btn.classList.remove('on');
        }
    }

    btn.addEventListener('pointerdown', onDown, { passive: false });
    btn.addEventListener('pointerup', onUp);
    btn.addEventListener('pointercancel', onUp);
    btn.addEventListener('pointerleave', onUp);
    btn.addEventListener('contextmenu', e => e.preventDefault());
}

/**
 * Prevents scrolling inside the wrapper on touch devices.
 * @param {HTMLElement} wrap - The wrapper element, e.g. `.mobile-ctrls`.
 */
function blockTouchScroll(wrap) {
    if (!wrap) return;
    wrap.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
}

/**
 * Resets all inputs when the tab or viewport loses focus.
 * @param {HTMLElement} wrap - Wrapper containing the buttons.
 */
function addBlurFailsafe(wrap) {
    const clear = () => {
        if (!window.keyboard) return;
        ['LEFT', 'RIGHT', 'SPACE', 'D'].forEach(k => window.keyboard[k] = false);
        wrap.querySelectorAll('.on').forEach(b => b.classList.remove('on'));
    };
    window.addEventListener('blur', clear);
    document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); });
}

/**
 * Initializes mobile controls below the root element.
 * Binds all buttons with `data-key` and sets up scroll/blur safety.
 * @param {string} [root='.mobile-ctrls'] - Selector for the control wrapper.
 */
function setupMobileControls(root = '.mobile-ctrls') {
    const wrap = document.querySelector(root);
    if (!wrap) return;
    wrap.querySelectorAll('[data-key]').forEach(bindControl);
    blockTouchScroll(wrap);
    addBlurFailsafe(wrap);
}

/**
 * Detects if the environment is a mobile/tablet device.
 * @returns {boolean} True if coarse pointer or small viewport is detected.
 */
function isHandy() {
    const coarse = window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const small = Math.min(window.innerWidth, window.innerHeight) <= 900;
    return coarse || small;
}

/**
 * Updates the rotate overlay and toggles `.landscape` mode.
 * Only active on mobile; desktop view remains unchanged.
 * Called on load, resize, and orientationchange.
 */
function updateRotateOverlay() {
    const rotate = document.getElementById('rotate-lock');
    const game = document.querySelector('.game');
    if (!rotate || !game) return;

    const landscape = window.innerWidth > window.innerHeight;

    if (isHandy()) {
        if (landscape) {
            rotate.classList.remove('show');
            game.classList.add('landscape');
        } else {
            rotate.classList.add('show');
            game.classList.remove('landscape');
        }
    } else {
        rotate.classList.remove('show');
        game.classList.remove('landscape');
    }
}

window.addEventListener('load', updateRotateOverlay);
window.addEventListener('resize', updateRotateOverlay);
window.addEventListener('orientationchange', updateRotateOverlay);






