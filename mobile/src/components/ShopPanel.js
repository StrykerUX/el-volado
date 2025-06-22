import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import useGameStore from '../stores/GameStore';
import { formatNumber } from '../utils/NumberFormatter';
import { COLORS, SHADOWS, BORDER_RADIUS, BORDERS, SPACING, TYPOGRAPHY } from '../constants/NeoBrutalTheme';
// Removed import of UPGRADES and GENERATORS to use hardcoded data

const ShopPanel = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState('upgrades');
  
  const { 
    coins,
    upgrades,
    generators,
    buyUpgrade,
    buyGenerator,
    getUpgradeCost,
    getGeneratorCost
  } = useGameStore();

  if (!visible) return null;

  // Hardcoded upgrade data
  const UPGRADES = {
    tapMultiplier: {
      name: 'Multiplicador de Tap',
      description: 'Aumenta las monedas base por tap',
      maxLevel: 50,
    },
    streakMultiplier: {
      name: 'Bonus de Streak',
      description: 'Aumenta el bonus por streaks consecutivos',
      maxLevel: 20,
    },
    flipSpeed: {
      name: 'Velocidad de Flip',
      description: 'Reduce el tiempo de animación',
      maxLevel: 8,
    },
    multiBet: {
      name: 'Apuesta Múltiple',
      description: 'Permite apostar en varios flips consecutivos',
      maxLevel: 5,
    },
  };

  // Hardcoded generator data
  const GENERATORS = {
    basic: {
      name: 'Generador Básico',
      description: 'Genera monedas cada 5 segundos',
      baseProduction: 1,
      interval: 5000,
    },
    intermediate: {
      name: 'Generador Intermedio',
      description: 'Genera monedas cada 3 segundos',
      baseProduction: 3,
      interval: 3000,
    },
    advanced: {
      name: 'Generador Avanzado',
      description: 'Genera monedas cada segundo',
      baseProduction: 10,
      interval: 1000,
    },
    autoFlipper: {
      name: 'Auto-Flipper',
      description: 'Realiza flips automáticos (sin apuestas)',
      baseProduction: 2,
      interval: 8000,
    },
  };

  const renderUpgradeItem = (upgradeKey, upgrade) => {
    const currentLevel = upgrades[upgradeKey] || 0;
    const cost = getUpgradeCost(upgradeKey);
    const canAfford = coins >= cost;
    const isMaxLevel = currentLevel >= upgrade.maxLevel;

    return (
      <View key={upgradeKey} style={styles.shopItem}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{upgrade.name}</Text>
          <Text style={styles.itemDescription}>{upgrade.description}</Text>
          <Text style={styles.itemLevel}>Nivel: {currentLevel}/{upgrade.maxLevel}</Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.buyButton,
            {
              backgroundColor: isMaxLevel 
                ? COLORS.textSecondary 
                : canAfford 
                  ? COLORS.success 
                  : COLORS.error,
              opacity: isMaxLevel ? 0.5 : 1,
            }
          ]}
          onPress={() => buyUpgrade(upgradeKey)}
          disabled={!canAfford || isMaxLevel}
        >
          <Text style={styles.buyButtonText}>
            {isMaxLevel ? 'MAX' : formatNumber(cost)}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderGeneratorItem = (generatorKey, generator) => {
    const currentCount = generators[generatorKey] || 0;
    const cost = getGeneratorCost(generatorKey);
    const canAfford = coins >= cost;

    return (
      <View key={generatorKey} style={styles.shopItem}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{generator.name}</Text>
          <Text style={styles.itemDescription}>{generator.description}</Text>
          <Text style={styles.itemLevel}>Cantidad: {currentCount}</Text>
          <Text style={styles.itemProduction}>
            Produce: {formatNumber(generator.baseProduction)} cada {generator.interval/1000}s
          </Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.buyButton,
            {
              backgroundColor: canAfford ? COLORS.primary : COLORS.error,
            }
          ]}
          onPress={() => buyGenerator(generatorKey)}
          disabled={!canAfford}
        >
          <Text style={styles.buyButtonText}>
            {formatNumber(cost)}
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
          <Text style={styles.title}>🛒 TIENDA</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Coins Display */}
        <View style={styles.coinsDisplay}>
          <Text style={styles.coinsText}>💰 {formatNumber(coins)}</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
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
              MEJORAS
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              { backgroundColor: activeTab === 'generators' ? COLORS.primary : COLORS.surface }
            ]}
            onPress={() => setActiveTab('generators')}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'generators' ? COLORS.textLight : COLORS.text }
            ]}>
              GENERADORES
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'upgrades' && 
            Object.entries(UPGRADES).map(([key, upgrade]) => 
              renderUpgradeItem(key, upgrade)
            )
          }
          
          {activeTab === 'generators' && 
            Object.entries(GENERATORS).map(([key, generator]) => 
              renderGeneratorItem(key, generator)
            )
          }
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
  coinsDisplay: {
    backgroundColor: COLORS.tertiary,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
    alignItems: 'center',
  },
  coinsText: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.text,
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
    borderWidth: 0,
  },
  tabText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.black,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  shopItem: {
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
  itemInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  itemName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.text,
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  itemLevel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    marginBottom: 2,
  },
  itemProduction: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.weights.bold,
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

export default ShopPanel;