import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import useGameStore from '../stores/GameStore';
import { formatNumber } from '../utils/NumberFormatter';
import { COLORS, SHADOWS, BORDER_RADIUS, BORDERS, SPACING, TYPOGRAPHY } from '../constants/NeoBrutalTheme';
import HapticFeedback from '../utils/HapticFeedback';

const FlipStats = () => {
  const { 
    totalFlips,
    headsStreak,
    coins,
    bettingMode,
    currentBet,
    setBetAmount,
    isFlipping
  } = useGameStore();
  
  const betPercentages = [
    { label: '10%', value: 0.1, color: COLORS.success },
    { label: '25%', value: 0.25, color: COLORS.warning },
    { label: '50%', value: 0.5, color: COLORS.error },
    { label: 'ALL IN', value: 1, color: COLORS.primary },
  ];
  
  const handleBetSelection = (percentage) => {
    const betAmount = Math.floor(coins * percentage.value);
    if (betAmount > 0) {
      HapticFeedback.buttonPress();
      setBetAmount(betAmount);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Stats Row - Solo FLIPS y STREAK */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatNumber(totalFlips)}</Text>
          <Text style={styles.statLabel}>FLIPS</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: COLORS.primary }]}>
            {headsStreak}
          </Text>
          <Text style={styles.statLabel}>STREAK</Text>
        </View>
      </View>
      
      {/* Betting Buttons */}
      <View style={styles.bettingSection}>
        <Text style={styles.bettingTitle}>🎰 APOSTAR</Text>
        <View style={styles.betButtons}>
          {betPercentages.map((percentage, index) => {
            const betAmount = Math.floor(coins * percentage.value);
            const isSelected = currentBet === betAmount && betAmount > 0;
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
      </View>
      
      {/* Streak Bonus */}
      {headsStreak >= 3 && (
        <View style={styles.streakBonus}>
          <Text style={styles.streakText}>
            🔥 BONUS: {1 + (headsStreak * 0.1)}x
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statCard: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: SPACING.xs,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 1,
    textAlign: 'center',
  },
  bettingSection: {
    marginTop: SPACING.sm,
  },
  bettingTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    letterSpacing: 1,
  },
  betButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.xs,
  },
  betButton: {
    flex: 1,
    paddingVertical: SPACING.md, // Increased from SPACING.sm to SPACING.md (44pt minimum)
    paddingHorizontal: SPACING.sm, // Increased from SPACING.xs to SPACING.sm
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
    alignItems: 'center',
    minHeight: 44, // Ensure 44pt minimum touch target
    justifyContent: 'center',
  },
  betButtonText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.black,
    letterSpacing: 1,
    marginBottom: 2,
  },
  betButtonAmount: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  streakBonus: {
    backgroundColor: COLORS.warning,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.md,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
  },
  streakText: {
    color: COLORS.textLight,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: 'center',
    letterSpacing: 1,
  },
});

export default FlipStats;