import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { formatNumber } from '../utils/NumberFormatter';
import { COLORS, SHADOWS, BORDER_RADIUS, BORDERS, SPACING, TYPOGRAPHY } from '../constants/NeoBrutalTheme';

const OfflineEarningsModal = ({ visible, onClose, offlineData }) => {
  if (!visible || !offlineData) return null;

  const { coins, hours, coinsPerSecond, multiplier } = offlineData;

  const formatTime = (hours) => {
    if (hours < 1) {
      const minutes = Math.floor(hours * 60);
      return `${minutes} minutos`;
    } else if (hours < 24) {
      const wholeHours = Math.floor(hours);
      const minutes = Math.floor((hours - wholeHours) * 60);
      return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours} horas`;
    } else {
      return '24+ horas';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>💰 ¡BIENVENIDO DE VUELTA!</Text>
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            <Text style={styles.subtitle}>Mientras estuviste ausente...</Text>
            
            <View style={styles.timeCard}>
              <Text style={styles.timeLabel}>Tiempo offline:</Text>
              <Text style={styles.timeValue}>{formatTime(hours)}</Text>
            </View>

            <View style={styles.earningsCard}>
              <Text style={styles.earningsLabel}>Generaste:</Text>
              <Text style={styles.earningsValue}>
                💎 {formatNumber(coins)} coins
              </Text>
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Producción:</Text>
                <Text style={styles.detailValue}>
                  {formatNumber(coinsPerSecond)}/s
                </Text>
              </View>
              
              {multiplier > 1 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Multiplicador:</Text>
                  <Text style={styles.detailValue}>
                    {multiplier.toFixed(2)}x
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.tipText}>
                💡 Tip: Mejora tus generadores y Prestige para ganar más offline!
              </Text>
            </View>
          </View>

          {/* Footer Button */}
          <TouchableOpacity
            style={styles.collectButton}
            onPress={onClose}
          >
            <Text style={styles.collectButtonText}>
              ✨ COBRAR GANANCIAS
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  container: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: BORDERS.thicker,
    borderColor: COLORS.dark,
    ...SHADOWS.brutal,
    width: '100%',
    maxWidth: 350,
  },
  header: {
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderTopLeftRadius: BORDER_RADIUS.lg - BORDERS.thicker,
    borderTopRightRadius: BORDER_RADIUS.lg - BORDERS.thicker,
    borderBottomWidth: BORDERS.thick,
    borderBottomColor: COLORS.dark,
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.textLight,
    letterSpacing: 1,
    textAlign: 'center',
  },
  content: {
    padding: SPACING.lg,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  timeCard: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  timeLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.textLight,
  },
  earningsCard: {
    backgroundColor: COLORS.warning,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  earningsLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  earningsValue: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  detailsContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  tipCard: {
    backgroundColor: COLORS.accent,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
  },
  tipText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 16,
  },
  collectButton: {
    backgroundColor: COLORS.tertiary,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderBottomLeftRadius: BORDER_RADIUS.lg - BORDERS.thicker,
    borderBottomRightRadius: BORDER_RADIUS.lg - BORDERS.thicker,
    borderTopWidth: BORDERS.thick,
    borderTopColor: COLORS.dark,
    alignItems: 'center',
  },
  collectButtonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.text,
    letterSpacing: 1,
  },
});

export default OfflineEarningsModal;