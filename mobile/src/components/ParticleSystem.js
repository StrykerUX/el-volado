import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../constants/NeoBrutalTheme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Particle = ({ 
  particle, 
  onComplete, 
  duration = 1500 
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(particle.scale || 1)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const deltaX = particle.endX - particle.startX;
    const deltaY = particle.endY - particle.startY;

    Animated.parallel([
      // Movement
      Animated.timing(translateX, {
        toValue: deltaX,
        duration: duration,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: deltaY,
        duration: duration,
        useNativeDriver: true,
      }),
      // Fade out
      Animated.timing(opacity, {
        toValue: 0,
        duration: duration * 0.8,
        delay: duration * 0.2,
        useNativeDriver: true,
      }),
      // Scale animation
      Animated.sequence([
        Animated.timing(scale, {
          toValue: (particle.scale || 1) * 1.2,
          duration: duration * 0.1,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0,
          duration: duration * 0.9,
          useNativeDriver: true,
        }),
      ]),
      // Rotation
      Animated.timing(rotation, {
        toValue: particle.rotation || 360,
        duration: duration,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onComplete) onComplete();
    });
  }, []);

  const getParticleStyle = () => {
    switch (particle.type) {
      case 'coin':
        return {
          backgroundColor: COLORS.tertiary,
          width: 8,
          height: 8,
          borderRadius: 4,
          borderWidth: 1,
          borderColor: COLORS.dark,
        };
      case 'star':
        return {
          backgroundColor: COLORS.primary,
          width: 12,
          height: 12,
          transform: [{ rotate: '45deg' }],
          borderWidth: 1,
          borderColor: COLORS.dark,
        };
      case 'heart':
        return {
          backgroundColor: COLORS.error,
          width: 10,
          height: 10,
          borderRadius: 5,
          borderWidth: 1,
          borderColor: COLORS.dark,
        };
      case 'diamond':
        return {
          backgroundColor: COLORS.accent,
          width: 10,
          height: 10,
          transform: [{ rotate: '45deg' }],
          borderWidth: 1,
          borderColor: COLORS.dark,
        };
      case 'confetti':
        return {
          backgroundColor: particle.color || COLORS.primary,
          width: 6,
          height: 6,
          borderRadius: 1,
          borderWidth: 1,
          borderColor: COLORS.dark,
        };
      default:
        return {
          backgroundColor: particle.color || COLORS.tertiary,
          width: 8,
          height: 8,
          borderRadius: 4,
          borderWidth: 1,
          borderColor: COLORS.dark,
        };
    }
  };

  return (
    <Animated.View
      style={[
        styles.particle,
        getParticleStyle(),
        {
          left: particle.startX,
          top: particle.startY,
          transform: [
            { translateX },
            { translateY },
            { scale },
            { rotate: rotation.interpolate({
              inputRange: [0, 360],
              outputRange: ['0deg', '360deg'],
            })},
          ],
          opacity,
        },
      ]}
    />
  );
};

const ParticleSystem = ({ 
  particles, 
  onComplete,
  duration = 1500 
}) => {
  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map(particle => (
        <Particle
          key={particle.id}
          particle={particle}
          duration={duration}
          onComplete={() => {
            if (onComplete) onComplete(particle.id);
          }}
        />
      ))}
    </View>
  );
};

// Hook para gestionar el sistema de partículas
export const useParticles = () => {
  const [particles, setParticles] = React.useState([]);

  const createParticleBurst = (
    centerX, 
    centerY, 
    options = {}
  ) => {
    const {
      count = 8,
      type = 'coin',
      radius = 100,
      colors = [COLORS.tertiary, COLORS.primary, COLORS.accent, COLORS.success],
      duration = 1500
    } = options;

    const newParticles = [];
    const angleStep = (2 * Math.PI) / count;

    for (let i = 0; i < count; i++) {
      const angle = i * angleStep + (Math.random() - 0.5) * 0.5; // Add some randomness
      const distance = radius + (Math.random() - 0.5) * 40;
      const endX = centerX + Math.cos(angle) * distance;
      const endY = centerY + Math.sin(angle) * distance;

      newParticles.push({
        id: `particle_${Date.now()}_${i}`,
        startX: centerX - 4, // Center the particle
        startY: centerY - 4,
        endX: Math.max(0, Math.min(screenWidth, endX)),
        endY: Math.max(0, Math.min(screenHeight, endY)),
        type: type,
        color: colors[Math.floor(Math.random() * colors.length)],
        scale: 0.5 + Math.random() * 0.5,
        rotation: Math.random() * 360,
      });
    }

    setParticles(prev => [...prev, ...newParticles]);

    // Clean up particles after animation
    setTimeout(() => {
      setParticles(prev => 
        prev.filter(p => !newParticles.some(np => np.id === p.id))
      );
    }, duration + 100);
  };

  const createCoinExplosion = (x, y) => {
    createParticleBurst(x, y, {
      count: 12,
      type: 'coin',
      radius: 80,
      colors: [COLORS.tertiary, '#FFD700', '#FFA500'],
    });
  };

  const createStreakCelebration = (x, y, streakLength) => {
    const count = Math.min(streakLength * 2, 20);
    createParticleBurst(x, y, {
      count,
      type: 'star',
      radius: 120,
      colors: [COLORS.success, COLORS.primary, COLORS.accent],
    });
  };

  const createAchievementCelebration = (x, y) => {
    createParticleBurst(x, y, {
      count: 16,
      type: 'confetti',
      radius: 150,
      colors: [COLORS.primary, COLORS.secondary, COLORS.tertiary, COLORS.accent],
      duration: 2000,
    });
  };

  const createPrestigeCelebration = (x, y) => {
    // Multiple bursts for prestige
    createParticleBurst(x, y, {
      count: 20,
      type: 'diamond',
      radius: 200,
      colors: ['#FFD700', '#FF6B9D', '#4ECDC4', '#A8E6CF'],
      duration: 2500,
    });

    // Second burst delayed
    setTimeout(() => {
      createParticleBurst(x, y, {
        count: 15,
        type: 'star',
        radius: 150,
        colors: ['#FFD700', '#FFA500', '#FF6B9D'],
        duration: 2000,
      });
    }, 300);
  };

  const ParticleRenderer = () => (
    <ParticleSystem
      particles={particles}
      onComplete={(particleId) => {
        setParticles(prev => prev.filter(p => p.id !== particleId));
      }}
    />
  );

  return {
    createParticleBurst,
    createCoinExplosion,
    createStreakCelebration,
    createAchievementCelebration,
    createPrestigeCelebration,
    ParticleRenderer,
    particleCount: particles.length,
  };
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    zIndex: 999,
  },
});

export default ParticleSystem;