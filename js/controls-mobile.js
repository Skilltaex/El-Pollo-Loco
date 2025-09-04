function pressKey(key, btn) {
    if (!window.keyboard) return;
    keyboard[key] = true;
    btn && btn.classList.add('on');
}

function releaseKey(key, btn) {
    if (!window.keyboard) return;
    keyboard[key] = false;
    btn && btn.classList.remove('on');
}

function bindControl(btn) {
    let key = btn.dataset.key;
    if (!key) return;
    let down = (e) => { e.preventDefault(); pressKey(key, btn); };
    let up = (e) => { e.preventDefault(); releaseKey(key, btn); };
    btn.addEventListener('touchstart', down, { passive: false });
    btn.addEventListener('touchend', up);
    btn.addEventListener('touchcancel', up);
    btn.addEventListener('mousedown', down);
    btn.addEventListener('mouseup', up);
    btn.addEventListener('mouseleave', up);
}

function blockTouchScroll(wrap) {
    if (!wrap) return;
    wrap.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
}

function addBlurFailsafe(wrap) {
    window.addEventListener('blur', () => {
        if (!window.keyboard) return;
        ['LEFT', 'RIGHT', 'SPACE', 'D'].forEach(k => keyboard[k] = false);
        wrap.querySelectorAll('.on').forEach(b => b.classList.remove('on'));
    });
}

function setupMobileControls(root = '.mobile-ctrls') {
    let wrap = document.querySelector(root); if (!wrap) return;
    wrap.querySelectorAll('[data-key]').forEach(bindControl);
    blockTouchScroll(wrap);
    addBlurFailsafe(wrap);
}

function isLandscape() {
  return (window.matchMedia && window.matchMedia('(orientation: landscape)').matches)
      || (window.innerWidth > window.innerHeight);
}

function isHandy() {
  var coarse = window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  var small  = Math.min(window.innerWidth, window.innerHeight) <= 900; // Fallback
  return coarse || small;
}

function updateRotateOverlay() {
  var rotate = document.getElementById('rotate-lock');
  var game = document.querySelector('.game');
  if (!rotate || !game) return;

  var landscape = window.innerWidth > window.innerHeight;

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



