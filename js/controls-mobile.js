/**
 * Activates a key in the global keyboard state and highlights the button.
 */
function pressKey(key, btn) {
  if (!window.keyboard) return;
  window.keyboard[key] = true;
  if (btn) btn.classList.add('on');
}

/**
 * Deactivates a key in the global keyboard state and removes button highlight.
 */
function releaseKey(key, btn) {
  if (!window.keyboard) return;
  window.keyboard[key] = false;
  if (btn) btn.classList.remove('on');
}

/**
 * Handles pointer down on a control button.
 * Supports multi-touch and prevents duplicate triggers.
 */
function handleControlDown(e, key, btn, state) {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  e.preventDefault();
  if (state.count === 0) {
    pressKey(key, btn);
    btn.classList.add('on');
  }
  state.count++;
  btn.setPointerCapture?.(e.pointerId);
}

/**
 * Handles pointer up/cancel/leave on a control button.
 */
function handleControlUp(key, btn, state) {
  if (state.count > 0) state.count--;
  if (state.count === 0) {
    releaseKey(key, btn);
    btn.classList.remove('on');
  }
}

/**
 * Binds pointer events to a control button.
 * Ensures multi-touch support and avoids duplicate triggers.
 */
function bindControl(btn) {
  const key = btn.dataset.key;
  if (!key) return;
  const state = { count: 0 };
  btn.addEventListener('pointerdown', e => handleControlDown(e, key, btn, state), { passive: false });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(type =>
    btn.addEventListener(type, () => handleControlUp(key, btn, state))
  );
  btn.addEventListener('contextmenu', e => e.preventDefault());
}

/**
 * Prevents scrolling inside the wrapper on touch devices.
 */
function blockTouchScroll(wrap) {
  if (!wrap) return;
  wrap.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
}

/**
 * Resets all inputs when the tab or viewport loses focus.
 */
function addBlurFailsafe(wrap) {
  const clear = () => {
    if (!window.keyboard) return;
    ['LEFT', 'RIGHT', 'SPACE', 'D'].forEach(k => (window.keyboard[k] = false));
    wrap.querySelectorAll('.on').forEach(b => b.classList.remove('on'));
  };
  window.addEventListener('blur', clear);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); });
}

/**
 * Initializes mobile controls and sets up scroll/blur safety.
 */
function setupMobileControls(root = '.mobile-ctrls') {
  const wrap = document.querySelector(root);
  if (!wrap) return;
  wrap.querySelectorAll('[data-key]').forEach(bindControl);
  blockTouchScroll(wrap);
  addBlurFailsafe(wrap);
}

/**
 * Detects if the environment is mobile/tablet-like.
 */
function isMobile() {
  const coarse = window.matchMedia?.('(hover: none) and (pointer: coarse)').matches;
  const small = Math.min(window.innerWidth, window.innerHeight) <= 900;
  return !!(coarse || small);
}

/**
 * Applies the landscape state: overlay hidden, game stretched.
 */
function applyLandscape(rotate, game) {
  rotate.classList.remove('show');
  game.classList.add('landscape');
}

/**
 * Applies the portrait state: overlay shown, game reset.
 */
function applyPortrait(rotate, game) {
  rotate.classList.add('show');
  game.classList.remove('landscape');
}

/**
 * Applies the desktop state: overlay hidden, no forced landscape class.
 */
function applyDesktop(rotate, game) {
  rotate.classList.remove('show');
  game.classList.remove('landscape');
}

/**
 * Updates the rotate overlay and toggles `.landscape` mode.
 * Active on mobile/tablet only; desktop remains unchanged.
 */
function updateRotateOverlay() {
  const rotate = document.getElementById('rotate-lock');
  const game = document.querySelector('.game');
  if (!rotate || !game) return;
  if (isMobile()) {
    const landscape = window.innerWidth > window.innerHeight;
    landscape ? applyLandscape(rotate, game) : applyPortrait(rotate, game);
  } else {
    applyDesktop(rotate, game);
  }
}

window.addEventListener('load', updateRotateOverlay);
window.addEventListener('resize', updateRotateOverlay);
window.addEventListener('orientationchange', updateRotateOverlay);