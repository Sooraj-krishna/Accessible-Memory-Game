// Utility to generate game sound effects using Web Audio API

export const generateSoundEffects = () => {
  const audioContext = new AudioContext();

  const generateTone = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
    
    return new Promise(resolve => setTimeout(resolve, duration * 1000));
  };

  const sounds = {
    async cardFlip() {
      await generateTone(400, 0.1, 'sine');
    },
    
    async match() {
      await generateTone(600, 0.1, 'sine');
      await generateTone(800, 0.2, 'sine');
    },
    
    async noMatch() {
      await generateTone(300, 0.1, 'sine');
      await generateTone(200, 0.2, 'sine');
    },
    
    async victory() {
      await generateTone(400, 0.1, 'sine');
      await generateTone(600, 0.1, 'sine');
      await generateTone(800, 0.2, 'sine');
    },
    
    async select() {
      await generateTone(500, 0.05, 'sine');
    },
    
    async move() {
      await generateTone(350, 0.05, 'sine');
    }
  };

  return sounds;
};

// Export a singleton instance
export const gameSounds = generateSoundEffects(); 