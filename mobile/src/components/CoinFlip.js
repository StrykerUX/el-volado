import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import useGameStore from '../stores/GameStore';
import { COLORS, SHADOWS, BORDER_RADIUS, BORDERS, SPACING, TYPOGRAPHY } from '../constants/NeoBrutalTheme';
import FeedbackSystem from '../utils/FeedbackSystem';
import hapticFeedback from '../utils/HapticFeedback';

const { width, height } = Dimensions.get('window');

const CoinFlip = () => {
  const { 
    flipCoin, 
    coins, 
    coinsPerTap, 
    isFlipping, 
    bettingMode, 
    currentBet,
    lastFlipResult,
    getFlipDuration
  } = useGameStore();
  const [lastResult, setLastResult] = useState(null);
  
  // Animated values
  const rotationY = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  const coinAnimatedStyle = useAnimatedStyle(() => {
    // Control the rotation to show different faces
    const normalizedRotation = ((rotationY.value % 360) + 360) % 360;
    const isBackFace = normalizedRotation > 90 && normalizedRotation < 270;
    
    return {
      transform: [
        { rotateY: `${rotationY.value}deg` },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });
  
  const handleCoinFlip = () => {
    const gameState = useGameStore.getState();
    console.log('CoinFlip clicked - isFlipping:', isFlipping, 'showTutorial:', gameState.showTutorial);
    if (isFlipping) {
      console.log('Flip blocked - already flipping');
      return;
    }
    
    console.log('Starting coin flip...');
    
    // Haptic feedback on tap
    hapticFeedback.tap();
    
    // Start the flip animation
    startFlipAnimation();
  };
  
  const startFlipAnimation = () => {
    console.log('startFlipAnimation called');
    // Reset values
    rotationY.value = 0;
    translateY.value = 0;
    scale.value = 1;
    opacity.value = 1;
    
    // Get dynamic flip duration
    const flipDuration = getFlipDuration();
    const halfDuration = flipDuration / 2;
    
    // Controlled flip animation - less rotations for better visibility
    const finalRotation = 720 + (Math.random() > 0.5 ? 180 : 0); // Either heads or tails
    rotationY.value = withTiming(finalRotation, {
      duration: flipDuration,
      easing: Easing.out(Easing.cubic),
    });
    
    // Proportional vertical movement for larger coin
    translateY.value = withSequence(
      withTiming(-100, {
        duration: halfDuration,
        easing: Easing.out(Easing.quad),
      }),
      withTiming(0, {
        duration: halfDuration,
        easing: Easing.in(Easing.bounce),
      }, () => {
        runOnJS(completeCoinFlip)();
      })
    );
    
    // Subtle scale effect
    scale.value = withSequence(
      withTiming(1.1, { duration: Math.max(100, flipDuration * 0.08) }),
      withTiming(1, { duration: flipDuration * 0.84 }),
      withTiming(1.05, { duration: Math.max(50, flipDuration * 0.04) }),
      withTiming(1, { duration: Math.max(50, flipDuration * 0.04) })
    );
    
    // Call the game store flip function
    console.log('Calling flipCoin() from GameStore...');
    flipCoin();
  };
  
  const completeCoinFlip = () => {
    console.log('completeCoinFlip called');
    // Get the result from the store after animation completes
    const result = useGameStore.getState().lastFlipResult;
    const gameState = useGameStore.getState();
    console.log('Flip result:', result, 'isFlipping:', gameState.isFlipping);
    setLastResult(result);
    
    // Haptic feedback based on result
    if (result === 'heads') {
      const coinsWon = bettingMode && currentBet > 0 ? 
        Math.floor(currentBet * 1.8) : 
        gameState.coinsPerTap * 2;
      
      hapticFeedback.coinWin(coinsWon);
      
      // Screen shake for big wins
      if (coinsWon > 100) {
        FeedbackSystem.screenShake(1.5);
      } else if (coinsWon > 50) {
        FeedbackSystem.screenShake(1);
      }
      
      // Success animation - more dramatic for wins
      scale.value = withSequence(
        withTiming(1.3, { duration: 200 }),
        withTiming(1, { duration: 200 })
      );
    } else {
      hapticFeedback.coinLoss();
      
      // Small shake for tails
      scale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
    }
    
    // Streak haptic feedback
    if (gameState.headsStreak > 1) {
      hapticFeedback.streak(gameState.headsStreak);
    }
  };
  
  const getCoinFace = () => {
    if (!isFlipping && lastResult) {
      return lastResult === 'heads' ? '💰' : '👑';
    }
    
    // During animation, show spinning effect
    return '💰';
  };
  
  const animatedCoinFace = useAnimatedStyle(() => {
    const rotation = rotationY.value % 360;
    const faceOpacity = interpolate(
      rotation,
      [80, 90, 270, 280],
      [1, 0, 0, 1],
      'clamp'
    );
    
    return {
      opacity: faceOpacity,
    };
  });
  
  return (
    <View style={styles.container}>
      {/* Coin */}
      <TouchableOpacity
        style={styles.coinContainer}
        onPress={handleCoinFlip}
        disabled={isFlipping}
        activeOpacity={0.8}
        accessible={true}
        accessibilityLabel={`Flip coin. Current coins: ${coins}`}
        accessibilityHint={bettingMode && currentBet > 0 ? `Betting ${currentBet} coins. Tap to flip` : 'Tap to flip the coin and earn coins'}
        accessibilityRole="button"
        accessibilityState={{ disabled: isFlipping }}
        onPressIn={() => console.log('TouchableOpacity onPressIn detected')}
        onPressOut={() => console.log('TouchableOpacity onPressOut detected')}
      >
        <Animated.View style={[styles.coinWrapper, coinAnimatedStyle]}>
          {/* Neo-brutal coin design */}
          <View style={styles.coin}>
            <View style={styles.coinInner}>
              <Text style={styles.coinFace}>
                {getCoinFace()}
              </Text>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
      
      {/* Instruction */}
      <Text style={styles.instruction}>
        {isFlipping ? 'Volando...' : bettingMode && currentBet > 0 ? '¡APOSTANDO!' : 'Tap para lanzar'}
      </Text>
      
      {/* Reward display */}
      {bettingMode && currentBet > 0 ? (
        <Text style={[styles.rewardText, { backgroundColor: COLORS.warning }]}>
          🎰 Apostando: {currentBet} | Ganar: {Math.floor(currentBet * 1.8)}
        </Text>
      ) : (
        <Text style={styles.rewardText}>
          +{coinsPerTap} coins base
        </Text>
      )}
      
      {/* Last result */}
      {lastResult && !isFlipping && (
        <View style={[
          styles.resultContainer,
          { backgroundColor: lastResult === 'heads' ? COLORS.success : COLORS.error }
        ]}>
          <Text style={styles.resultText}>
            {lastResult === 'heads' ? 
              (bettingMode ? '🎉 ¡GANASTE!' : '¡CARA! 2x coins') : 
              (bettingMode ? '💸 Perdiste...' : 'Cruz - Normal')
            }
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: COLORS.background,
  },
  coinContainer: {
    width: 320, // Increased from 300 to 320 (88pt minimum touch target)
    height: 320, // Increased from 300 to 320
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    // Ensure proper touch area
    minWidth: 88,
    minHeight: 88,
  },
  coinWrapper: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coin: {
    width: 280,
    height: 280,
    backgroundColor: COLORS.tertiary,
    borderRadius: BORDER_RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: BORDERS.thickest,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalLarge,
  },
  coinInner: {
    width: 220,
    height: 220,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
  },
  coinFace: {
    fontSize: 120,
    textAlign: 'center',
  },
  instruction: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.text,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
    textAlign: 'center',
  },
  rewardText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
    textAlign: 'center',
  },
  resultContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.md,
    borderWidth: BORDERS.thicker,
    borderColor: COLORS.dark,
    ...SHADOWS.brutal,
  },
  resultText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.black,
    textAlign: 'center',
    color: COLORS.textLight,
  },
});

export default CoinFlip;