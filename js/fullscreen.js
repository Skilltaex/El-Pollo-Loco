
function toggleFullscreen() {
    const el = document.querySelector('.game');
    if (!document.fullscreenElement) {
        el && el.requestFullscreen && el.requestFullscreen();
    } else {
        document.exitFullscreen && document.exitFullscreen();
    }
}

function startGame() {
    let s = document.querySelector('.start-screen');
    if (s) s.style.display = 'none';
    init();
}

function openHelp() {
    let h = document.querySelector('.help');
    if (h) h.classList.remove('hide');
}

function closeHelp() {
    let h = document.querySelector('.help');
    if (h) h.classList.add('hide');
}





