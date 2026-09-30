// Audio Utility for Notifications
// Supports both audio asset (/sounds/notification.wav) and Web Audio API fallback.
// Respects browser autoplay policies and avoids repeating sound for the same notification.

let audioUnlocked = false;
let audioContext = null;
const playedNotificationIds = new Set();

// Function to unlock audio on first user interaction
export const initAudioUnlock = () => {
  if (typeof window === 'undefined') return;

  const unlock = () => {
    if (audioUnlocked) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioContext = new AudioCtx();
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }
      }
      audioUnlocked = true;
    } catch {
      // Ignore unlock error
    }
    window.removeEventListener('click', unlock);
    window.removeEventListener('keydown', unlock);
    window.removeEventListener('touchstart', unlock);
  };

  window.addEventListener('click', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
  window.addEventListener('touchstart', unlock, { once: true });
};

// Synthetic chime using Web Audio API
const playSyntheticChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = audioContext || new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    // Tone 1: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Tone 2: 880 Hz (A5) with slight delay
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.1);
    gain2.gain.setValueAtTime(0.35, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.6);
  } catch {
    // Autoplay blocked or context unavailable
  }
};

/**
 * Play notification sound for a specific notification ID/key.
 * If notificationKey is provided, it only plays once for that key.
 */
export const playNotificationSound = (notificationKey = null) => {
  if (notificationKey) {
    const keyStr = String(notificationKey);
    if (playedNotificationIds.has(keyStr)) {
      return; // Already played for this notification
    }
    playedNotificationIds.add(keyStr);
  }

  // Attempt to play /sounds/notification.wav first
  try {
    const audio = new Audio('/sounds/notification.wav');
    audio.volume = 0.6;
    const promise = audio.play();
    if (promise !== undefined) {
      promise.catch(() => {
        // If file playback blocked, try synthetic chime
        playSyntheticChime();
      });
    }
  } catch {
    playSyntheticChime();
  }
};
