import { Audio } from 'expo-av';
import { Platform } from 'react-native';

class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.5;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Only set audio mode on mobile platforms
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
          playThroughEarpieceAndroid: false,
        });
      }
      
      // Load default sounds
      await this.loadSounds();
      this.initialized = true;
    } catch (error) {
      console.warn('Sound initialization failed (this is normal on web):', error);
      // Continue without audio on web
      this.initialized = true;
      this.enabled = false;
    }
  }

  async loadSounds() {
    // Skip loading sounds on web for now
    if (Platform.OS === 'web') {
      console.log('Skipping sound loading on web platform');
      return;
    }

    try {
      // Using web-compatible sound URLs (for testing on web)
      const soundSources = {
        coinFlip: 'https://www.soundjay.com/misc/sounds/coin-flip-1.wav',
        coinWin: 'https://www.soundjay.com/misc/sounds/coin-drop-1.wav',
        achievement: 'https://www.soundjay.com/misc/sounds/achievement.wav',
        prestige: 'https://www.soundjay.com/misc/sounds/magical.wav',
        tap: 'https://www.soundjay.com/misc/sounds/click.wav',
        generator: 'https://www.soundjay.com/misc/sounds/ding.wav',
      };

      // For actual deployment, you would use local sound files
      // Example: require('../assets/sounds/coin-flip.wav')
      
      for (const [key, source] of Object.entries(soundSources)) {
        try {
          const { sound } = await Audio.Sound.createAsync(
            typeof source === 'string' ? { uri: source } : source,
            { 
              shouldPlay: false,
              volume: this.volume,
              isLooping: false,
            }
          );
          this.sounds[key] = sound;
        } catch (error) {
          console.warn(`Failed to load sound ${key}:`, error);
          // Create a dummy sound object that won't crash
          this.sounds[key] = {
            playAsync: () => Promise.resolve(),
            setVolumeAsync: () => Promise.resolve(),
            unloadAsync: () => Promise.resolve(),
          };
        }
      }
    } catch (error) {
      console.warn('Failed to load sounds:', error);
    }
  }

  async playSound(soundName, options = {}) {
    if (!this.enabled || !this.initialized) return;
    
    const sound = this.sounds[soundName];
    if (!sound) {
      console.warn(`Sound ${soundName} not found`);
      return;
    }

    try {
      const volume = options.volume !== undefined ? options.volume : this.volume;
      await sound.setVolumeAsync(volume);
      await sound.replayAsync();
    } catch (error) {
      console.warn(`Failed to play sound ${soundName}:`, error);
    }
  }

  // Convenience methods for common game events
  async playCoinFlip() {
    await this.playSound('coinFlip', { volume: 0.3 });
  }

  async playCoinWin() {
    await this.playSound('coinWin', { volume: 0.4 });
  }

  async playTap() {
    await this.playSound('tap', { volume: 0.2 });
  }

  async playAchievement() {
    await this.playSound('achievement', { volume: 0.6 });
  }

  async playPrestige() {
    await this.playSound('prestige', { volume: 0.7 });
  }

  async playGenerator() {
    await this.playSound('generator', { volume: 0.1 });
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    
    // Update volume for all loaded sounds
    Object.values(this.sounds).forEach(async (sound) => {
      try {
        await sound.setVolumeAsync(this.volume);
      } catch (error) {
        // Ignore errors for unloaded sounds
      }
    });
  }

  getVolume() {
    return this.volume;
  }

  isEnabled() {
    return this.enabled;
  }

  async cleanup() {
    try {
      for (const sound of Object.values(this.sounds)) {
        await sound.unloadAsync();
      }
      this.sounds = {};
      this.initialized = false;
    } catch (error) {
      console.warn('Failed to cleanup sounds:', error);
    }
  }
}

// Create a singleton instance
export const soundManager = new SoundManager();

// Auto-initialize when imported
soundManager.initialize().catch(console.warn);

export default soundManager;