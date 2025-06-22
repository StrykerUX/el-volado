import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../constants/NeoBrutalTheme';

const FloatingNumbers = ({ 
  value, 
  x, 
  y, 
  onComplete, 
  type = 'coin', // 'coin', 'streak', 'achievement', 'multiplier'
  duration = 1500 
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;
  const scaleValue = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Animación de aparición y movimiento
    Animated.parallel([
      // Movimiento hacia arriba
      Animated.timing(animatedValue, {
        toValue: -80,
        duration: duration,
        useNativeDriver: true,
      }),
      // Fade out
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: duration * 0.8,
        delay: duration * 0.2,
        useNativeDriver: true,
      }),
      // Scale in inicial
      Animated.timing(scaleValue, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onComplete) onComplete();
    });

    // Scale down después del scale in
    setTimeout(() => {
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 200);
  }, []);

  const getTextStyle = () => {
    switch (type) {
      case 'coin':
        return {
          color: COLORS.tertiary,
          fontSize: 24,
          fontWeight: 'black',
          textShadowColor: COLORS.dark,
          textShadowOffset: { width: 2, height: 2 },
          textShadowRadius: 0,
        };
      case 'streak':
        return {
          color: COLORS.success,
          fontSize: 28,
          fontWeight: 'black',
          textShadowColor: COLORS.dark,
          textShadowOffset: { width: 2, height: 2 },
          textShadowRadius: 0,
        };
      case 'achievement':
        return {
          color: COLORS.primary,
          fontSize: 32,
          fontWeight: 'black',
          textShadowColor: COLORS.dark,
          textShadowOffset: { width: 3, height: 3 },
          textShadowRadius: 0,
        };
      case 'multiplier':
        return {
          color: COLORS.accent,
          fontSize: 26,
          fontWeight: 'black',
          textShadowColor: COLORS.dark,
          textShadowOffset: { width: 2, height: 2 },
          textShadowRadius: 0,
        };
      default:
        return {
          color: COLORS.tertiary,
          fontSize: 24,
          fontWeight: 'black',
        };
    }
  };

  const getPrefix = () => {
    switch (type) {
      case 'coin':
        return '+';
      case 'streak':
        return '';
      case 'achievement':
        return '';
      case 'multiplier':
        return 'x';
      default:
        return '+';
    }
  };

  const getSuffix = () => {
    switch (type) {
      case 'coin':
        return '';
      case 'streak':
        return ' STREAK!';
      case 'achievement':
        return ' ACHIEVEMENT!';
      case 'multiplier':
        return '';
      default:
        return '';
    }
  };

  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return (val / 1000000).toFixed(1) + 'M';
      } else if (val >= 1000) {
        return (val / 1000).toFixed(1) + 'K';
      }
      return val.toString();
    }
    return val;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: x,
          top: y,
          transform: [
            {
              translateY: animatedValue,
            },
            {
              scale: scaleValue,
            },
          ],
          opacity: opacityValue,
        },
      ]}
      pointerEvents="none"
    >
      <Text style={[styles.text, getTextStyle()]}>
        {getPrefix()}{formatValue(value)}{getSuffix()}
      </Text>
    </Animated.View>
  );
};

// Hook para gestionar múltiples números flotantes
export const useFloatingNumbers = () => {
  const [floatingNumbers, setFloatingNumbers] = React.useState([]);

  const showFloatingNumber = (value, x, y, type = 'coin') => {
    const id = Date.now() + Math.random();
    const newNumber = {
      id,
      value,
      x: x - 30, // Centrar el texto
      y: y - 20,
      type,
    };

    setFloatingNumbers(prev => [...prev, newNumber]);

    // Remover después de la animación
    setTimeout(() => {
      setFloatingNumbers(prev => prev.filter(num => num.id !== id));
    }, 1600);
  };

  const FloatingNumbersRenderer = () => (
    <View style={styles.overlay} pointerEvents="none">
      {floatingNumbers.map(number => (
        <FloatingNumbers
          key={number.id}
          value={number.value}
          x={number.x}
          y={number.y}
          type={number.type}
          onComplete={() => {
            setFloatingNumbers(prev => prev.filter(num => num.id !== number.id));
          }}
        />
      ))}
    </View>
  );

  return {
    showFloatingNumber,
    FloatingNumbersRenderer,
  };
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: FONTS.black,
    letterSpacing: 1,
    textAlign: 'center',
    minWidth: 60,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    pointerEvents: 'none',
  },
});

export default FloatingNumbers;