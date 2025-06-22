import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import useGameStore from '../stores/GameStore';
import { formatNumber } from '../utils/NumberFormatter';
import { COLORS, SHADOWS, BORDER_RADIUS, BORDERS, SPACING, TYPOGRAPHY } from '../constants/NeoBrutalTheme';

const BettingPanel = () => {
  const { 
    coins, 
    bettingMode, 
    currentBet, 
    setBettingMode, 
    setBetAmount,
    isFlipping 
  } = useGameStore();
  
  const [selectedPercentage, setSelectedPercentage] = useState(0);
  
  const betPercentages = [
    { label: '10%', value: 0.1, color: COLORS.success },
    { label: '25%', value: 0.25, color: COLORS.warning },
    { label: '50%', value: 0.5, color: COLORS.error },
    { label: 'ALL IN', value: 1, color: COLORS.primary },
  ];
  
  const handleBetSelection = (percentage) => {
    const betAmount = Math.floor(coins * percentage.value);
    if (betAmount > 0) {
      setSelectedPercentage(percentage.value);
      setBetAmount(betAmount);
    }
  };
  
  const toggleBettingMode = () => {
    setBettingMode(!bettingMode);
    if (!bettingMode) {
      setSelectedPercentage(0);
      setBetAmount(0);
    }
  };
  
  const getPotentialWin = () => {
    return Math.floor(currentBet * 1.8); // 80% return on win
  };
  
  if (coins < 5) {
    return null; // Hide betting panel if not enough coins
  }
  
  return (
    <View style={styles.container}>
      {/* Betting Mode Toggle */}
      <TouchableOpacity
        style={[
          styles.toggleButton,
          { backgroundColor: bettingMode ? COLORS.primary : COLORS.textSecondary }
        ]}
        onPress={toggleBettingMode}
        disabled={isFlipping}
      >
        <Text style={styles.toggleText}>
          🎰 {bettingMode ? 'MODO APUESTA' : 'ACTIVAR APUESTAS'}
        </Text>
      </TouchableOpacity>
      
      {bettingMode && (
        <View style={styles.bettingContent}>
          {/* Current Bet Display */}
          {currentBet > 0 && (
            <View style={styles.betInfo}>
              <Text style={styles.betLabel}>APOSTANDO:</Text>
              <Text style={styles.betAmount}>{formatNumber(currentBet)}</Text>
              <Text style={styles.winAmount}>
                Ganar: {formatNumber(getPotentialWin())}
              </Text>
            </View>
          )}
          
          {/* Bet Percentage Buttons */}
          <View style={styles.betButtons}>
            {betPercentages.map((percentage, index) => {
              const betAmount = Math.floor(coins * percentage.value);
              const isSelected = selectedPercentage === percentage.value;
              const canAfford = betAmount > 0 && betAmount <= coins;
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.betButton,
                    {
                      backgroundColor: isSelected 
                        ? percentage.color 
                        : canAfford 
                          ? COLORS.surface 
                          : COLORS.textSecondary,
                      opacity: canAfford ? 1 : 0.5,
                    }
                  ]}
                  onPress={() => handleBetSelection(percentage)}
                  disabled={!canAfford || isFlipping}
                >
                  <Text style={[
                    styles.betButtonText,
                    { color: isSelected ? COLORS.textLight : COLORS.text }
                  ]}>
                    {percentage.label}
                  </Text>
                  <Text style={[
                    styles.betButtonAmount,
                    { color: isSelected ? COLORS.textLight : COLORS.textSecondary }
                  ]}>
                    {formatNumber(betAmount)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          
          {currentBet > 0 && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                ⚠️ Puedes perder todo lo apostado
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: SPACING.md,
  },
  toggleButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.textLight,
    letterSpacing: 1,
  },
  bettingContent: {
    marginTop: SPACING.md,
  },
  betInfo: {
    backgroundColor: COLORS.accent,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  betLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  betAmount: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.text,
    marginVertical: SPACING.xs,
  },
  winAmount: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.success,
  },
  betButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  betButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
    alignItems: 'center',
  },
  betButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.black,
    letterSpacing: 1,
    marginBottom: 2,
  },
  betButtonAmount: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  warningContainer: {
    backgroundColor: COLORS.error,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  warningText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});

export default BettingPanel;