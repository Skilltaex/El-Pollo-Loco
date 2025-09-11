/**
 * Central audio manager: loads, mutes and plays SFX/music with user-unlock.
 * Keeps mute state in localStorage under key "muted".
 */
class SoundManager {
  constructor() {
    this.sounds = {};
    this.musicEl = null;
    this.muted = localStorage.getItem('muted') === '1';
    this.ready = false;
    this._unlockHandler = () => this.unlock();
    window.addEventListener('pointerdown', this._unlockHandler, { once: true, capture: true });
  }

  /** Loads an audio file and stores it under a name. */
  load(name, src, opts = {}) {
    const a = new Audio(src);
    a.loop = !!opts.loop;
    a.volume = typeof opts.volume === 'number' ? opts.volume : 1;
    a.muted = this.muted;
    this.sounds[name] = a;
    return a;
  }

  /** Marks one loaded sound as background music. */
  setMusic(name) {
    this.musicEl = this.sounds[name] || null;
    if (this.musicEl) {
      this.musicEl.muted = this.muted;      
      if (this.ready && !this.muted) {
        try { this.musicEl.play().catch(() => { }); } catch { }
      }
    }
  }

  /** Called after first user interaction; allows playback. */
  unlock() {
    this.ready = true;
    if (!this.muted && this.musicEl) {
      try { this.musicEl.play().catch(() => { }); } catch { }
    }
  }

  /** Sets global mute state and syncs all audio elements. */
  setMuted(m) {
    this.muted = !!m;
    localStorage.setItem('muted', this.muted ? '1' : '0');
    Object.values(this.sounds).forEach(a => {
      a.muted = this.muted;
      if (this.muted) { try { a.pause(); } catch { } }
    });
    if (!this.muted && this.musicEl) {
      try { this.musicEl.play().catch(() => { }); } catch { }
    }
  }

  /** Toggles the mute state. */
  toggle() {
    this.setMuted(!this.muted);
  }

  /** Plays a one-shot sound if ready and not muted. */
  play(name) {
    const a = this.sounds[name];
    if (!a || this.muted || !this.ready) return;
    try { a.currentTime = 0; a.play().catch(() => { }); } catch { }
  }
}

// Make it globally available
window.sound = new SoundManager();


