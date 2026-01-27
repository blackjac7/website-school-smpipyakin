// Singleton audio context
let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  
  if (!audioCtx) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  return audioCtx;
};

// Resume context on user interaction (to bypass autoplay policy)
export const initAudio = async () => {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    await ctx.resume();
    console.log('[Audio] Context resumed');
  }
};

export const playScanSound = async (type: 'success' | 'error' | 'beep') => {
  try {
    const ctx = getAudioContext();
    if (!ctx) {
      console.warn('[Audio] No AudioContext available');
      return;
    }

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'success') {
      // SUCCESS: High pitch double beep (Ding-Dong)
      osc.type = 'sine';
      
      // Note 1: High
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      
      gain.gain.setValueAtTime(0.5, now); // LOUDER (0.5)
      gain.gain.linearRampToValueAtTime(0, now + 0.1);
      
      osc.start(now);
      osc.stop(now + 0.1);

      // Note 2: Higher (after small delay)
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1800, ctx.currentTime);
        gain2.gain.setValueAtTime(0.5, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.3);
      }, 100);

    } else if (type === 'error') {
      // ERROR: Sawtooth buzzy drop
      osc.type = 'sawtooth';
      
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(50, now + 0.5);
      
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.5);
      
      osc.start(now);
      osc.stop(now + 0.5);

    } else if (type === 'beep') {
      // BEEP: Simple clear tone
      osc.type = 'square';
      osc.frequency.setValueAtTime(1000, now);
      
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      
      osc.start(now);
      osc.stop(now + 0.1);
    }
  } catch (e) {
    console.error('[Audio] Play failed', e);
  }
};
