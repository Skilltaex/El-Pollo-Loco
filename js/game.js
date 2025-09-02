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
    const s = document.querySelector('.start-screen');
    const h = document.querySelector('.help');
    if (h) h.classList.remove('hide');   
    if (s) s.style.display = 'none';
}

function closeHelp() {
    const s = document.querySelector('.start-screen');
    const h = document.querySelector('.help');
    if (h) h.classList.add('hide');   
    if (s) s.style.display = '';
}

window.addEventListener("keydown", (e) => {
    if (e.keyCode == 39) keyboard.RIGHT = true;
    if (e.keyCode == 37) keyboard.LEFT  = true;
    if (e.keyCode == 38) keyboard.UP    = true;
    if (e.keyCode == 40) keyboard.DOWN  = true;
    if (e.keyCode == 32) keyboard.SPACE = true;
    if (e.keyCode == 68) keyboard.D     = true;
});

window.addEventListener("keyup", (e) => {
    if (e.keyCode == 39) keyboard.RIGHT = false;
    if (e.keyCode == 37) keyboard.LEFT  = false;
    if (e.keyCode == 38) keyboard.UP    = false;
    if (e.keyCode == 40) keyboard.DOWN  = false;
    if (e.keyCode == 32) keyboard.SPACE = false;
    if (e.keyCode == 68) keyboard.D     = false;
});
