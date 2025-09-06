/**
 * Setzt eine Taste aktiv und markiert den Button.
 * Erwartet ein globales `window.keyboard`-Objekt.
 * @param {'LEFT'|'RIGHT'|'SPACE'|'D'} key
 * @param {HTMLElement} [btn]
 */
function pressKey(key, btn) {
    if (!window.keyboard) return;
    window.keyboard[key] = true;
    if (btn) btn.classList.add('on');
}

/**
 * Setzt eine Taste inaktiv und entmarkiert den Button.
 * @param {'LEFT'|'RIGHT'|'SPACE'|'D'} key
 * @param {HTMLElement} [btn]
 */
function releaseKey(key, btn) {
    if (!window.keyboard) return;
    window.keyboard[key] = false;
    if (btn) btn.classList.remove('on');
}

/**
 * Bindet Pointer-Events an einen Control-Button (Multi-Touch-sicher).
 * Keine Doppeltrigger (kein separater mouse/touch Pfad).
 * @param {HTMLElement} btn
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
 * Verhindert Scrollen innerhalb des Wrappers auf Touch-Geräten.
 * @param {HTMLElement} wrap
 */
function blockTouchScroll(wrap) {
    if (!wrap) return;
    wrap.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
}

/**
 * Setzt Eingaben zurück, wenn der Tab/Viewport den Fokus verliert.
 * @param {HTMLElement} wrap
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
 * Initialisiert die Mobile-Controls unterhalb des Roots.
 * @param {string} [root='.mobile-ctrls']
 */
function setupMobileControls(root = '.mobile-ctrls') {
    const wrap = document.querySelector(root);
    if (!wrap) return;
    wrap.querySelectorAll('[data-key]').forEach(bindControl);
    blockTouchScroll(wrap);
    addBlurFailsafe(wrap);
}

/**
 * Prüft „Handy“-Kontext (coarse Pointer oder kleiner Viewport).
 * @returns {boolean}
 */
function isHandy() {
    const coarse = window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const small = Math.min(window.innerWidth, window.innerHeight) <= 900;
    return coarse || small;
}

/**
 * Zeigt/verbirgt das Rotate-Overlay und toggelt `.landscape`.
 * Aktiv nur auf Handy; auf Desktop bleibt alles unverändert.
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





