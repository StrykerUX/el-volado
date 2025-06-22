import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import useGameStore from '../stores/GameStore';
import { formatNumber } from '../utils/NumberFormatter';
import { COLORS, SHADOWS, BORDER_RADIUS, BORDERS, SPACING, TYPOGRAPHY } from '../constants/NeoBrutalTheme';

const AchievementsPanel = ({ visible, onClose }) => {
  const { 
    achievements,
    getProgressTowardsAchievement
  } = useGameStore();

  if (!visible) return null;

  const renderAchievement = (achievement) => {
    const progress = getProgressTowardsAchievement(achievement.id);
    const isUnlocked = achievement.unlocked;

    return (
      <View 
        key={achievement.id}
        style={[
          styles.achievementItem,
          { 
            backgroundColor: isUnlocked ? COLORS.success : COLORS.surface,
            opacity: isUnlocked ? 1 : 0.7 
          }
        ]}
      >
        <View style={styles.achievementInfo}>
          <View style={styles.achievementHeader}>
            <Text style={[
              styles.achievementName,
              { color: isUnlocked ? COLORS.textLight : COLORS.text }
            ]}>
              {isUnlocked ? '🏆' : '🔒'} {achievement.name}
            </Text>
            {isUnlocked && (
              <Text style={styles.unlockedBadge}>✓</Text>
            )}
          </View>
          
          <Text style={[
            styles.achievementDescription,
            { color: isUnlocked ? COLORS.textLight : COLORS.textSecondary }
          ]}>
            {achievement.description}
          </Text>
          
          <View style={styles.rewardContainer}>
            <Text style={[
              styles.rewardText,
              { color: isUnlocked ? COLORS.textLight : COLORS.textSecondary }
            ]}>
              Recompensa: {achievement.reward.type === 'coins' 
                ? `${formatNumber(achievement.reward.amount)} monedas`
                : `${achievement.reward.amount}x multiplicador`
              }
            </Text>
          </View>
          
          {!isUnlocked && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${progress * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {Math.floor(progress * 100)}%
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const unlockedAchievements = Object.values(achievements).filter(a => a.unlocked);
  const lockedAchievements = Object.values(achievements).filter(a => !a.unlocked);

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🏆 LOGROS</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Desbloqueados: {unlockedAchievements.length}/{Object.keys(achievements).length}
          </Text>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✨ DESBLOQUEADOS</Text>
              {unlockedAchievements.map(renderAchievement)}
            </View>
          )}
          
          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔒 BLOQUEADOS</Text>
              {lockedAchievements.map(renderAchievement)}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: COLORS.background,
    width: '90%',
    maxHeight: '80%',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: BORDERS.thicker,
    borderColor: COLORS.dark,
    ...SHADOWS.brutal,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.lg - BORDERS.thicker,
    borderTopRightRadius: BORDER_RADIUS.lg - BORDERS.thicker,
    borderBottomWidth: BORDERS.thick,
    borderBottomColor: COLORS.dark,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.text,
    letterSpacing: 1,
  },
  closeButton: {
    backgroundColor: COLORS.error,
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
  },
  closeButtonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.textLight,
  },
  statsContainer: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
    alignItems: 'center',
  },
  statsText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.textLight,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  section: {
    marginVertical: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.text,
    marginBottom: SPACING.md,
    letterSpacing: 1,
  },
  achievementItem: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  achievementName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.black,
    flex: 1,
  },
  unlockedBadge: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.textLight,
  },
  achievementDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  rewardContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  rewardText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 4,
    marginRight: SPACING.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.warning,
    borderRadius: 4,
  },
  progressText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    minWidth: 40,
  },
});

export default AchievementsPanel;