let keyboard, world;

function init() {
    const canvasEl = document.getElementById('canvas');
    keyboard = new Keyboard();
    world = new World(canvasEl, keyboard);
    window.keyboard = keyboard;
    window.world = world;
    setupMobileControls();
}

function openHelp() {
    let help = document.getElementById('help');
    if (help) help.classList.remove('hide');
}

function closeHelp() {
    let help = document.getElementById('help');
    if (help) help.classList.add('hide');
}

window.addEventListener('keydown', (e) => {
    if (!window.keyboard) return;
    const k = e.key;
    if (k === 'ArrowLeft') window.keyboard.LEFT = true;
    if (k === 'ArrowRight') window.keyboard.RIGHT = true;
    if (k === ' ' || k === 'Spacebar' || k === 'Space') window.keyboard.SPACE = true;
    if (k === 'd' || k === 'D') window.keyboard.D = true;
});

window.addEventListener('keyup', (e) => {
    if (!window.keyboard) return;
    const k = e.key;
    if (k === 'ArrowLeft') window.keyboard.LEFT = false;
    if (k === 'ArrowRight') window.keyboard.RIGHT = false;
    if (k === ' ' || k === 'Spacebar' || k === 'Space') window.keyboard.SPACE = false;
    if (k === 'd' || k === 'D') window.keyboard.D = false;
});

function toggleFullscreen() {
    const el = document.querySelector('.game');
    if (!document.fullscreenElement) {
        el && el.requestFullscreen && el.requestFullscreen();
    } else {
        document.exitFullscreen && document.exitFullscreen();
    }
}

function startGame() {
    const s = document.getElementById('start');
    if (s) s.classList.add('hide');
}

function resetGame() {
  if (this._loop) { clearInterval(this._loop); this._loop = null; }
  if (this._raf)  { cancelAnimationFrame(this._raf); this._raf = null; }
  this.paused = true;
  this.character?.stopLoops?.();
  this.endboss?.stop?.();
  this.level?.enemies?.forEach(e => e?.stop?.());
  this.throwableObjects?.forEach(t => t?.stop?.());
  const kb = this.keyboard || window.keyboard || {};
  kb.LEFT = kb.RIGHT = kb.SPACE = kb.D = false;
  document.getElementById('victory-overlay')?.classList.remove('show');
  document.querySelector('.overlay--lose')?.classList.remove('show');
  this.setOverlay?.(false);
  (document.getElementById('start') || document.querySelector('.start-screen'))?.classList.remove('hide');
  window.world = null;
}

window.addEventListener('load', init);