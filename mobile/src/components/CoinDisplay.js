import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import useGameStore from '../stores/GameStore';
import { formatNumber } from '../utils/NumberFormatter';
import { useLanguage } from '../contexts/LanguageContext';
import { COLORS, SHADOWS, BORDER_RADIUS, BORDERS, SPACING, TYPOGRAPHY } from '../constants/NeoBrutalTheme';

const CoinDisplay = () => {
  const { coins, coinsPerSecond } = useGameStore();
  const { t } = useLanguage();
  const scaleValue = useRef(new Animated.Value(1)).current;
  const glowValue = useRef(new Animated.Value(0)).current;
  const prevCoins = useRef(coins);

  // Slot machine animation for coin counter
  useEffect(() => {
    if (coins !== prevCoins.current) {
      const coinDifference = coins - prevCoins.current;
      
      if (coinDifference > 0) {
        // Scale animation when coins increase
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();

        // Glow effect for big wins
        if (coinDifference > 50) {
          Animated.sequence([
            Animated.timing(glowValue, {
              toValue: 1,
              duration: 200,
              useNativeDriver: false,
            }),
            Animated.timing(glowValue, {
              toValue: 0,
              duration: 400,
              useNativeDriver: false,
            }),
          ]).start();
        }
      }
      
      prevCoins.current = coins;
    }
  }, [coins]);

  const glowStyle = {
    shadowColor: COLORS.tertiary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: glowValue,
    shadowRadius: glowValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 20],
    }),
    elevation: glowValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 10],
    }),
  };
  
  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.coinsContainer, 
        glowStyle,
        { transform: [{ scale: scaleValue }] }
      ]}>
        <Text style={styles.coinsLabel}>💰 {t('game.coins').toUpperCase()}</Text>
        <Text style={styles.coinsValue}>
          {formatNumber(coins)}
        </Text>
      </Animated.View>
      
      {coinsPerSecond > 0 && (
        <View style={styles.cpsContainer}>
          <Text style={styles.cpsText}>
            ⚡ {formatNumber(coinsPerSecond)}/seg
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: SPACING.lg,
  },
  coinsContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    minWidth: 280,
    borderWidth: BORDERS.thicker,
    borderColor: COLORS.dark,
    ...SHADOWS.brutal,
    marginBottom: SPACING.md,
  },
  coinsLabel: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.textLight,
    fontWeight: TYPOGRAPHY.weights.black,
    letterSpacing: 2,
  },
  coinsValue: {
    fontSize: TYPOGRAPHY.sizes.huge,
    color: COLORS.textLight,
    fontWeight: TYPOGRAPHY.weights.black,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  cpsContainer: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
  },
  cpsText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textLight,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: 'center',
    letterSpacing: 1,
  },
});

export default CoinDisplay;