import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import useGameStore from '../stores/GameStore';
import { COLORS, SHADOWS, BORDER_RADIUS, BORDERS, SPACING, TYPOGRAPHY } from '../constants/NeoBrutalTheme';

const SettingsPanel = ({ visible, onClose }) => {
  const { 
    soundEnabled, 
    soundVolume, 
    setSoundEnabled, 
    setSoundVolume, 
    highContrastMode,
    reducedMotion,
    screenReaderMode,
    setHighContrastMode,
    setReducedMotion,
    setScreenReaderMode,
    resetGame 
  } = useGameStore();

  if (!visible) return null;

  const handleResetGame = () => {
    Alert.alert(
      '⚠️ RESETEAR JUEGO',
      'Esto eliminará PERMANENTEMENTE todo tu progreso:\n\n' +
      '• Todas las monedas y mejoras\n' +
      '• Logros desbloqueados\n' +
      '• Progreso de Prestige\n' +
      '• Estadísticas\n\n' +
      '¿Estás SEGURO de que quieres continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'SÍ, RESETEAR TODO', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '🔥 ÚLTIMA CONFIRMACIÓN',
              '¿REALMENTE quieres borrar todo?\n\nEsta acción NO se puede deshacer.',
              [
                { text: 'No, regresar', style: 'cancel' },
                { 
                  text: 'SÍ, BORRAR TODO', 
                  style: 'destructive',
                  onPress: () => {
                    resetGame();
                    onClose();
                    Alert.alert('✅ Juego reseteado', 'Todo tu progreso ha sido eliminado.');
                  }
                },
              ]
            );
          }
        },
      ]
    );
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>⚙️ CONFIGURACIÓN</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Audio Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔊 AUDIO</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>Sonidos Activados</Text>
                <Text style={styles.settingDescription}>
                  Activa o desactiva todos los efectos de sonido
                </Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: COLORS.textSecondary, true: COLORS.success }}
                thumbColor={soundEnabled ? COLORS.textLight : COLORS.surface}
                style={styles.switch}
              />
            </View>

            {soundEnabled && (
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingName}>Volumen</Text>
                  <Text style={styles.settingDescription}>
                    Ajusta el volumen de los efectos de sonido
                  </Text>
                </View>
                <View style={styles.sliderContainer}>
                  <Text style={styles.volumeLabel}>🔉</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={1}
                    value={soundVolume}
                    onValueChange={setSoundVolume}
                    minimumTrackTintColor={COLORS.primary}
                    maximumTrackTintColor={COLORS.textSecondary}
                    thumbStyle={styles.sliderThumb}
                  />
                  <Text style={styles.volumeLabel}>🔊</Text>
                </View>
                <Text style={styles.volumeValue}>
                  {Math.round(soundVolume * 100)}%
                </Text>
              </View>
            )}
          </View>

          {/* Accessibility Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>♿ ACCESIBILIDAD</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>Modo Alto Contraste</Text>
                <Text style={styles.settingDescription}>
                  Aumenta el contraste de colores para mejor visibilidad
                </Text>
              </View>
              <Switch
                value={highContrastMode}
                onValueChange={setHighContrastMode}
                trackColor={{ false: COLORS.textSecondary, true: COLORS.success }}
                thumbColor={highContrastMode ? COLORS.textLight : COLORS.surface}
                style={styles.switch}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>Movimiento Reducido</Text>
                <Text style={styles.settingDescription}>
                  Reduce las animaciones para evitar mareos
                </Text>
              </View>
              <Switch
                value={reducedMotion}
                onValueChange={setReducedMotion}
                trackColor={{ false: COLORS.textSecondary, true: COLORS.success }}
                thumbColor={reducedMotion ? COLORS.textLight : COLORS.surface}
                style={styles.switch}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>Modo Lector de Pantalla</Text>
                <Text style={styles.settingDescription}>
                  Optimiza la interfaz para lectores de pantalla
                </Text>
              </View>
              <Switch
                value={screenReaderMode}
                onValueChange={setScreenReaderMode}
                trackColor={{ false: COLORS.textSecondary, true: COLORS.success }}
                thumbColor={screenReaderMode ? COLORS.textLight : COLORS.surface}
                style={styles.switch}
              />
            </View>
          </View>

          {/* Game Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ℹ️ INFORMACIÓN</Text>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Volado - Coin Flip Game</Text>
              <Text style={styles.infoText}>Versión 1.0.0</Text>
              <Text style={styles.infoText}>
                Un juego idle clicker con mecánicas de lanzamiento de monedas fair play.
              </Text>
              <Text style={styles.infoCredit}>
                Desarrollado con React Native & Expo
              </Text>
            </View>
          </View>

          {/* Debug/Reset Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔧 AVANZADO</Text>
            
            <View style={styles.warningCard}>
              <Text style={styles.warningTitle}>⚠️ ZONA PELIGROSA</Text>
              <Text style={styles.warningText}>
                Las acciones en esta sección son permanentes y no se pueden deshacer.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetGame}
            >
              <Text style={styles.resetButtonText}>
                🔥 RESETEAR JUEGO COMPLETO
              </Text>
            </TouchableOpacity>
          </View>

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
    backgroundColor: COLORS.secondary,
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
  settingItem: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
    marginBottom: SPACING.md,
  },
  settingInfo: {
    marginBottom: SPACING.sm,
  },
  settingName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  switch: {
    alignSelf: 'flex-end',
    marginTop: SPACING.sm,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: SPACING.sm,
  },
  sliderThumb: {
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
  },
  volumeLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text,
  },
  volumeValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: COLORS.accent,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text,
    marginBottom: 4,
    lineHeight: 18,
  },
  infoCredit: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  warningCard: {
    backgroundColor: COLORS.warning,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
    marginBottom: SPACING.md,
  },
  warningTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  warningText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textLight,
    lineHeight: 18,
  },
  resetButton: {
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.textLight,
    letterSpacing: 1,
  },
});

export default SettingsPanel;