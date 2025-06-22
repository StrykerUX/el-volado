import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

class HapticFeedback {
  constructor() {
    this.isEnabled = true;
    this.isSupported = Platform.OS === 'ios' || Platform.OS === 'android';
    
    // Disable haptics on web to prevent errors
    if (Platform.OS === 'web') {
      this.isEnabled = false;
      this.isSupported = false;
    }
  }

  async vibrate(type = 'light', options = {}) {
    if (!this.isEnabled || !this.isSupported) return;

    try {
      switch (type) {
        case 'selection':
          await Haptics.selectionAsync();
          break;
          
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
          
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
          
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
          
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
          
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
          
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
          
        case 'pattern':
          // Custom pattern vibration for special events
          if (options.pattern && Platform.OS === 'android') {
            // Android supports custom patterns
            await this.customPattern(options.pattern);
          } else {
            // Fallback to heavy for iOS
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }
          break;
          
        default:
          await Haptics.selectionAsync();
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  async customPattern(pattern) {
    // Pattern is an array of durations: [vibrate, pause, vibrate, pause, ...]
    // For iOS, we simulate patterns with delays
    try {
      for (let i = 0; i < pattern.length; i += 2) {
        if (i < pattern.length) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          if (i + 1 < pattern.length) {
            await new Promise(resolve => setTimeout(resolve, pattern[i + 1]));
          }
        }
      }
    } catch (error) {
      console.warn('Custom pattern vibration failed:', error);
    }
  }

  // Game-specific haptic methods
  async tap() {
    await this.vibrate('light');
  }

  async buttonPress() {
    await this.vibrate('selection');
  }

  async coinFlip() {
    await this.vibrate('medium');
  }

  async coinWin(amount = 0) {
    if (amount > 100) {
      await this.vibrate('heavy');
    } else if (amount > 50) {
      await this.vibrate('medium');
    } else {
      await this.vibrate('light');
    }
  }

  async coinLoss() {
    await this.vibrate('light');
  }

  async streak(length = 1) {
    if (length >= 10) {
      // Big streak celebration
      await this.vibrate('pattern', { pattern: [100, 50, 100, 50, 200] });
    } else if (length >= 5) {
      await this.vibrate('success');
    } else {
      await this.vibrate('medium');
    }
  }

  async achievement() {
    // Special celebration pattern
    await this.vibrate('pattern', { pattern: [150, 100, 150, 100, 300] });
  }

  async purchase() {
    await this.vibrate('success');
  }

  async purchaseError() {
    await this.vibrate('error');
  }

  async upgrade() {
    await this.vibrate('success');
  }

  async prestige() {
    // Epic prestige celebration
    await this.vibrate('pattern', { 
      pattern: [200, 100, 200, 100, 200, 200, 400] 
    });
  }

  async bigWin() {
    // Jackpot celebration
    await this.vibrate('pattern', { 
      pattern: [300, 150, 300, 150, 500] 
    });
  }

  async error() {
    await this.vibrate('error');
  }

  async warning() {
    await this.vibrate('warning');
  }

  // Settings
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  isHapticSupported() {
    return this.isSupported;
  }

  getEnabled() {
    return this.isEnabled;
  }
}

export default new HapticFeedback();