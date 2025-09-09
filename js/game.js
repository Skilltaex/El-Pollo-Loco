let keyboard = null;
let world = null;
let started = false;
window.__userInteracted = false;

/**
 * Initialize input and UI hooks without starting the game loop.
 * Creates the global keyboard instance and wires up mobile controls.
 */
function init() {
  keyboard = new Keyboard();
  window.keyboard = keyboard;
  setupMobileControls();
}

/**
 * Open the help overlay.
 */
function openHelp() {
  const help = document.getElementById('help');
  if (help) help.classList.remove('hide');
}

/**
 * Close the help overlay.
 */
function closeHelp() {
  const help = document.getElementById('help');
  if (help) help.classList.add('hide');
}

/**
 * Handle keydown events.  
 * Only works after the game has started.
 */
window.addEventListener('keydown', (e) => {
  if (!started || !window.keyboard) return;
  const k = e.key;
  if (k === 'ArrowLeft')  window.keyboard.LEFT  = true;
  if (k === 'ArrowRight') window.keyboard.RIGHT = true;
  if (k === ' ' || k === 'Spacebar' || k === 'Space') window.keyboard.SPACE = true;
  if (k === 'd' || k === 'D') window.keyboard.D = true;
});

/**
 * Handle keyup events.  
 * Only works after the game has started.
 */
window.addEventListener('keyup', (e) => {
  if (!started || !window.keyboard) return;
  const k = e.key;
  if (k === 'ArrowLeft')  window.keyboard.LEFT  = false;
  if (k === 'ArrowRight') window.keyboard.RIGHT = false;
  if (k === ' ' || k === 'Spacebar' || k === 'Space') window.keyboard.SPACE = false;
  if (k === 'd' || k === 'D') window.keyboard.D = false;
});

/**
 * Toggle browser fullscreen mode for the game container.
 */
function toggleFullscreen() {
  const el = document.getElementById('game') || document.querySelector('.game');
  if (!document.fullscreenElement) {
    el && el.requestFullscreen && el.requestFullscreen();
  } else {
    document.exitFullscreen && document.exitFullscreen();
  }
}

/**
 * Start the game once.  
 * Hides the start screen, creates the world and marks the game as started.
 */
function startGame() {
  if (started) return;

  const s = document.getElementById('start') || document.querySelector('.start-screen');
  if (s) s.classList.add('hide');

  const canvas = document.getElementById('canvas');
  if (!canvas) return;

  world = new World(canvas, keyboard);
  window.world = world;
  started = true;
}

/**
 * Reset the game and clear the started flag.
 */
function resetGame() {
  if (window.world && typeof world.resetGame === 'function') {
    world.resetGame();
  }
  started = false;
}

/**
 * Mark that the user has interacted with the page.
 * Needed for unlocking audio on some browsers.
 */
window.addEventListener('pointerdown', () => { window.__userInteracted = true; }, { once:true });

/**
 * Set up inputs and mobile controls on page load.
 */
window.addEventListener('load', init);
