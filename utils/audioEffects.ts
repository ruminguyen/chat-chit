
// Use a single AudioContext instance
let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

// Function to play a sound with a given frequency, duration, and type
const playSound = (frequency: number, duration: number, type: OscillatorType, volume: number = 0.5) => {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        // Apply a simple envelope to avoid harsh clicks
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
        console.error("Lỗi khi phát âm thanh:", e);
    }
};

export const playKeypressSound = () => {
    // A short, high-pitched click
    const randomPitch = 1200 + Math.random() * 300;
    playSound(randomPitch, 0.05, 'triangle', 0.3);
};

export const playNotificationSound = () => {
    // A pleasant two-tone ping
    const ctx = getAudioContext();
    if (!ctx) return;
    
    try {
        // First tone
        playSound(1046.50, 0.1, 'sine', 0.4); // C6
        // Second tone, slightly delayed and higher
        setTimeout(() => {
            playSound(1396.91, 0.15, 'sine', 0.4); // F6
        }, 80);
    } catch (e) {
        console.error("Lỗi khi phát âm thanh thông báo:", e);
    }
};


export const playAppOpenSound = () => {
    // A soft, short sound for UI interaction
    playSound(800, 0.1, 'sine', 0.3);
};
