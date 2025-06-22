import { Animated, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

class FeedbackSystem {
  constructor() {
    this.screenShakeValue = new Animated.Value(0);
    this.isEnabled = true;
    this.hapticsEnabled = true;
  }

  // Screen Shake Effect
  screenShake(intensity = 1) {
    if (!this.isEnabled) return;

    const shakeDistance = 3 * intensity;
    
    Animated.sequence([
      Animated.timing(this.screenShakeValue, {
        toValue: shakeDistance,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(this.screenShakeValue, {
        toValue: -shakeDistance,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(this.screenShakeValue, {
        toValue: shakeDistance * 0.5,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(this.screenShakeValue, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }

  // Haptic Feedback
  async hapticFeedback(type = 'light') {
    if (!this.hapticsEnabled) return;

    try {
      switch (type) {
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
        default:
          await Haptics.selectionAsync();
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  // Combined effects for game events
  coinTap() {
    this.hapticFeedback('light');
  }

  coinWin(amount) {
    if (amount > 100) {
      this.hapticFeedback('heavy');
      this.screenShake(1.5);
    } else if (amount > 50) {
      this.hapticFeedback('medium');
      this.screenShake(1);
    } else {
      this.hapticFeedback('light');
    }
  }

  streakBonus(streakLength) {
    if (streakLength >= 10) {
      this.hapticFeedback('success');
      this.screenShake(2);
    } else if (streakLength >= 5) {
      this.hapticFeedback('medium');
      this.screenShake(1.2);
    } else {
      this.hapticFeedback('light');
    }
  }

  achievementUnlocked() {
    this.hapticFeedback('success');
    this.screenShake(2.5);
  }

  buttonPress() {
    this.hapticFeedback('selection');
  }

  purchaseSuccess() {
    this.hapticFeedback('success');
  }

  purchaseError() {
    this.hapticFeedback('error');
  }

  bigWin(multiplier = 1) {
    const intensity = Math.min(multiplier / 2, 3);
    this.hapticFeedback('heavy');
    this.screenShake(intensity);
  }

  // Animation Helpers
  createFloatingAnimation(animatedValue, startY, endY, duration = 1000) {
    return Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: { x: 0, y: endY - startY },
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue.opacity || new Animated.Value(1), {
        toValue: 0,
        duration: duration * 0.8,
        delay: duration * 0.2,
        useNativeDriver: true,
      }),
    ]);
  }

  // Slot Machine Effect for Numbers
  createSlotMachineAnimation(animatedValue, finalValue, duration = 800) {
    const steps = 12;
    const stepDuration = duration / steps;
    
    const animations = [];
    
    for (let i = 0; i < steps; i++) {
      const isLastStep = i === steps - 1;
      const targetValue = isLastStep ? finalValue : Math.random() * finalValue * 2;
      
      animations.push(
        Animated.timing(animatedValue, {
          toValue: targetValue,
          duration: stepDuration,
          useNativeDriver: false,
        })
      );
    }
    
    return Animated.sequence(animations);
  }

  // Particle Burst Effect (positions for particles)
  generateParticleBurst(centerX, centerY, particleCount = 8) {
    const particles = [];
    const angleStep = (2 * Math.PI) / particleCount;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = i * angleStep;
      const distance = 100 + Math.random() * 50;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      particles.push({
        id: `particle_${i}_${Date.now()}`,
        startX: centerX,
        startY: centerY,
        endX: x,
        endY: y,
        scale: 0.5 + Math.random() * 0.5,
        rotation: Math.random() * 360,
        color: ['#FFD700', '#FFA500', '#FF6B9D', '#4ECDC4'][Math.floor(Math.random() * 4)],
      });
    }
    
    return particles;
  }

  // Settings
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  setHapticsEnabled(enabled) {
    this.hapticsEnabled = enabled;
  }

  getScreenShakeTransform() {
    return {
      transform: [
        {
          translateX: this.screenShakeValue,
        },
      ],
    };
  }
}

export default new FeedbackSystem();