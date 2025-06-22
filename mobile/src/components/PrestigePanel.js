import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import useGameStore from '../stores/GameStore';
import { formatNumber } from '../utils/NumberFormatter';
import { COLORS, SHADOWS, BORDER_RADIUS, BORDERS, SPACING, TYPOGRAPHY } from '../constants/NeoBrutalTheme';

const PrestigePanel = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const { 
    prestigeLevel,
    prestigePoints,
    totalPrestiges,
    prestigeUpgrades,
    totalCoinsEarned,
    canPrestige,
    getPrestigeCost,
    getPrestigePoints,
    performPrestige,
    buyPrestigeUpgrade,
    getPrestigeUpgradeCost,
    getPrestigeUpgradeMaxLevel
  } = useGameStore();

  if (!visible) return null;

  // Hardcoded prestige upgrade data
  const PRESTIGE_UPGRADES_DATA = {
    coinMultiplier: {
      name: 'Multiplicador de Monedas',
      description: 'Aumenta todas las ganancias de monedas',
      effect: '+20% por nivel',
    },
    generatorBoost: {
      name: 'Potenciador de Generadores',
      description: 'Aumenta la velocidad de todos los generadores',
      effect: '+15% por nivel',
    },
    streakPower: {
      name: 'Poder de Rachas',
      description: 'Las rachas otorgan más bonus',
      effect: '+10% por nivel',
    },
    betReturns: {
      name: 'Retornos de Apuesta',
      description: 'Aumenta las ganancias de las apuestas',
      effect: '+5% por nivel',
    },
  };

  const handlePrestige = () => {
    Alert.alert(
      '🌟 ¡PRESTIGE!',
      `¿Estás seguro de que quieres realizar Prestige?\n\n` +
      `• Ganarás ${getPrestigePoints()} Prestige Points\n` +
      `• Se reiniciará todo tu progreso\n` +
      `• Mantendrás tus upgrades de Prestige\n` +
      `• Obtendrás multiplicadores permanentes`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Prestigiar', 
          style: 'destructive',
          onPress: () => {
            const pointsGained = performPrestige();
            Alert.alert(
              '✨ ¡Prestige Completado!',
              `¡Has ganado ${pointsGained} Prestige Points!\n\nTu multiplicador de Prestige ha aumentado.`,
              [{ text: 'Continuar' }]
            );
          }
        },
      ]
    );
  };

  const renderPrestigeUpgrade = (upgradeKey, upgrade) => {
    const currentLevel = prestigeUpgrades[upgradeKey] || 0;
    const cost = getPrestigeUpgradeCost(upgradeKey);
    const maxLevel = getPrestigeUpgradeMaxLevel(upgradeKey);
    const canAfford = prestigePoints >= cost;
    const isMaxLevel = currentLevel >= maxLevel;

    return (
      <View key={upgradeKey} style={styles.upgradeItem}>
        <View style={styles.upgradeInfo}>
          <Text style={styles.upgradeName}>{upgrade.name}</Text>
          <Text style={styles.upgradeDescription}>{upgrade.description}</Text>
          <Text style={styles.upgradeEffect}>{upgrade.effect}</Text>
          <Text style={styles.upgradeLevel}>Nivel: {currentLevel}/{maxLevel}</Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.buyButton,
            {
              backgroundColor: isMaxLevel 
                ? COLORS.textSecondary 
                : canAfford 
                  ? COLORS.accent 
                  : COLORS.error,
              opacity: isMaxLevel ? 0.5 : 1,
            }
          ]}
          onPress={() => buyPrestigeUpgrade(upgradeKey)}
          disabled={!canAfford || isMaxLevel}
        >
          <Text style={styles.buyButtonText}>
            {isMaxLevel ? 'MAX' : `${cost} PP`}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🌟 PRESTIGE</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Prestige Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Nivel de Prestige</Text>
            <Text style={styles.statValue}>{prestigeLevel}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Prestige Points</Text>
            <Text style={styles.statValue}>{prestigePoints}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Prestiges</Text>
            <Text style={styles.statValue}>{totalPrestiges}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tab,
              { backgroundColor: activeTab === 'overview' ? COLORS.primary : COLORS.surface }
            ]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'overview' ? COLORS.textLight : COLORS.text }
            ]}>
              PRESTIGE
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              { backgroundColor: activeTab === 'upgrades' ? COLORS.primary : COLORS.surface }
            ]}
            onPress={() => setActiveTab('upgrades')}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'upgrades' ? COLORS.textLight : COLORS.text }
            ]}>
              UPGRADES
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'overview' && (
            <View>
              <Text style={styles.sectionTitle}>Información de Prestige</Text>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoText}>
                  El Prestige te permite reiniciar tu progreso a cambio de Prestige Points, 
                  que desbloquean mejoras permanentes.
                </Text>
              </View>

              <View style={styles.prestigeRequirement}>
                <Text style={styles.requirementLabel}>Requerido para Prestige:</Text>
                <Text style={styles.requirementValue}>
                  {formatNumber(getPrestigeCost())} coins totales
                </Text>
                <Text style={styles.currentProgress}>
                  Actual: {formatNumber(totalCoinsEarned)} coins
                </Text>
              </View>

              {canPrestige() && (
                <View style={styles.prestigeReward}>
                  <Text style={styles.rewardLabel}>Ganarás:</Text>
                  <Text style={styles.rewardValue}>
                    {getPrestigePoints()} Prestige Points
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.prestigeButton,
                  { 
                    backgroundColor: canPrestige() ? COLORS.warning : COLORS.textSecondary,
                    opacity: canPrestige() ? 1 : 0.5 
                  }
                ]}
                onPress={handlePrestige}
                disabled={!canPrestige()}
              >
                <Text style={styles.prestigeButtonText}>
                  {canPrestige() ? '🌟 PRESTIGIAR' : '❌ NO DISPONIBLE'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          {activeTab === 'upgrades' && (
            <View>
              <Text style={styles.sectionTitle}>Upgrades de Prestige</Text>
              {Object.entries(PRESTIGE_UPGRADES_DATA).map(([key, upgrade]) => 
                renderPrestigeUpgrade(key, upgrade)
              )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: COLORS.background,
    width: '90%',
    maxHeight: '85%',
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
    backgroundColor: COLORS.warning,
    borderTopLeftRadius: BORDER_RADIUS.lg - BORDERS.thicker,
    borderTopRightRadius: BORDER_RADIUS.lg - BORDERS.thicker,
    borderBottomWidth: BORDERS.thick,
    borderBottomColor: COLORS.dark,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.textLight,
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
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.warning,
  },
  tabs: {
    flexDirection: 'row',
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  tabText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.black,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: COLORS.accent,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
    marginBottom: SPACING.md,
  },
  infoText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 20,
  },
  prestigeRequirement: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  requirementLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  requirementValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.warning,
    marginBottom: 4,
  },
  currentProgress: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text,
  },
  prestigeReward: {
    backgroundColor: COLORS.success,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  rewardLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  rewardValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.textLight,
  },
  prestigeButton: {
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutal,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  prestigeButtonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.textLight,
    letterSpacing: 1,
  },
  upgradeItem: {
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
    flexDirection: 'row',
    alignItems: 'center',
  },
  upgradeInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  upgradeName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.text,
    marginBottom: 2,
  },
  upgradeDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  upgradeEffect: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: 4,
  },
  upgradeLevel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.warning,
  },
  buyButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
    minWidth: 80,
    alignItems: 'center',
  },
  buyButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.textLight,
    letterSpacing: 1,
  },
});

export default PrestigePanel;