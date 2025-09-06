let keyboard = null;
let world = null;
let started = false;

function init() {
  keyboard = new Keyboard();
  window.keyboard = keyboard;
  setupMobileControls();
}

function openHelp() {
  const help = document.getElementById('help');
  if (help) help.classList.remove('hide');
}

function closeHelp() {
  const help = document.getElementById('help');
  if (help) help.classList.add('hide');
}

window.addEventListener('keydown', (e) => {
  if (!started || !window.keyboard) return;
  const k = e.key;
  if (k === 'ArrowLeft')  window.keyboard.LEFT  = true;
  if (k === 'ArrowRight') window.keyboard.RIGHT = true;
  if (k === ' ' || k === 'Spacebar' || k === 'Space') window.keyboard.SPACE = true;
  if (k === 'd' || k === 'D') window.keyboard.D = true;
});

window.addEventListener('keyup', (e) => {
  if (!started || !window.keyboard) return;
  const k = e.key;
  if (k === 'ArrowLeft')  window.keyboard.LEFT  = false;
  if (k === 'ArrowRight') window.keyboard.RIGHT = false;
  if (k === ' ' || k === 'Spacebar' || k === 'Space') window.keyboard.SPACE = false;
  if (k === 'd' || k === 'D') window.keyboard.D = false;
});

function toggleFullscreen() {
  const el = document.getElementById('game') || document.querySelector('.game');
  if (!document.fullscreenElement) {
    el && el.requestFullscreen && el.requestFullscreen();
  } else {
    document.exitFullscreen && document.exitFullscreen();
  }
}

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

function resetGame() {
  if (window.world && typeof world.resetGame === 'function') {
    world.resetGame();
  }
  started = false;
}

window.addEventListener('load', init);