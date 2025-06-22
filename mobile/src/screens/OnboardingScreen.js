import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import hapticFeedback from '../utils/HapticFeedback';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  COLORS, 
  SHADOWS, 
  BORDER_RADIUS, 
  BORDERS, 
  SPACING, 
  TYPOGRAPHY,
  FONTS 
} from '../constants/NeoBrutalTheme';

const { width } = Dimensions.get('window');

const OnboardingScreen = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { t } = useLanguage();

  const ONBOARDING_STEPS = [
    {
      id: 1,
      title: t('onboarding.step1.title'),
      subtitle: 'El Juego de Lanzar Monedas Justo',
      description: t('onboarding.step1.description'),
      highlight: 'fair_play',
    },
    {
      id: 2,
      title: '🪙 Lanza Monedas, Gana Recompensas',
      subtitle: 'Simple pero Adictivo',
      description: t('onboarding.step2.description'),
      highlight: 'coin_flip',
    },
    {
      id: 3,
      title: '⚡ Mejora y Progresa',
      subtitle: 'Hazte Más Fuerte con el Tiempo',
      description: t('onboarding.step3.description'),
      highlight: 'progression',
    },
    {
      id: 4,
      title: '🏆 Prestigio y Competencia',
      subtitle: 'Juego Sin Fin',
      description: t('onboarding.step4.description'),
      highlight: 'prestige',
    },
  ];

  React.useEffect(() => {
    // OnboardingScreen initialized
  }, []);

  const handleNext = () => {
    hapticFeedback.vibrate('light');
    
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    hapticFeedback.vibrate('light');
    
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
    }
  };

  const handleComplete = () => {
    hapticFeedback.vibrate('success');
    onComplete();
  };

  const handleSkip = () => {
    hapticFeedback.vibrate('light');
    onSkip();
  };

  const renderStep = (step, index) => {
    const isActive = index === currentStep;
    
    return (
      <View key={step.id} style={styles.stepContainer}>
        <View 
          style={[
            styles.stepContent,
            {
              opacity: isActive ? 1 : 0.3,
              transform: [{
                scale: isActive ? 1 : 0.9,
              }],
            }
          ]}
        >
          {/* Step Visual */}
          <View style={styles.stepVisual}>
            <Text style={styles.stepEmoji}>
              {step.title.split(' ')[0]}
            </Text>
          </View>

          {/* Step Text */}
          <View style={styles.stepTextContainer}>
            <Text style={styles.stepTitle}>
              {step.title.substring(2)} {/* Remove emoji from title */}
            </Text>
            <Text style={styles.stepSubtitle}>
              {step.subtitle}
            </Text>
            <Text style={styles.stepDescription}>
              {step.description}
            </Text>
          </View>

          {/* Feature Highlights */}
          <View style={styles.highlightContainer}>
            {step.highlight === 'fair_play' && (
              <View style={styles.highlightCard}>
                <Text style={styles.highlightText}>
                  ✓ Probabilidades garantizadas 50/50{'\n'}
                  ✓ Sin mecánicas pay-to-win{'\n'}
                  ✓ Sistema anti-trampa justo
                </Text>
              </View>
            )}
            
            {step.highlight === 'coin_flip' && (
              <View style={styles.highlightCard}>
                <Text style={styles.highlightText}>
                  🪙 Toca para lanzar monedas{'\n'}
                  🔥 Construye rachas para bonos{'\n'}
                  💰 Sistema de apuestas estratégico
                </Text>
              </View>
            )}
            
            {step.highlight === 'progression' && (
              <View style={styles.highlightCard}>
                <Text style={styles.highlightText}>
                  ⚡ Mejora multiplicadores{'\n'}
                  🏭 Generadores pasivos{'\n'}
                  🏆 Recompensas de logros
                </Text>
              </View>
            )}
            
            {step.highlight === 'prestige' && (
              <View style={styles.highlightCard}>
                <Text style={styles.highlightText}>
                  🌟 Prestigio para multiplicadores{'\n'}
                  🏅 Tablas globales de clasificación{'\n'}
                  ♾️ Progreso sin fin
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Empezar</Text>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipButtonText}>{t('onboarding.skip')}</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {ONBOARDING_STEPS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentStep && styles.progressDotActive,
              index < currentStep && styles.progressDotCompleted,
            ]}
          />
        ))}
      </View>

      {/* Steps Content */}
      <View style={styles.stepsContainer}>
        {renderStep(ONBOARDING_STEPS[currentStep], currentStep)}
      </View>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[
            styles.navButton,
            styles.prevButton,
            currentStep === 0 && styles.navButtonDisabled,
          ]}
          onPress={handlePrevious}
          disabled={currentStep === 0}
        >
          <Text style={[
            styles.navButtonText,
            currentStep === 0 && styles.navButtonTextDisabled,
          ]}>
            {t('common.previous')}
          </Text>
        </TouchableOpacity>

        <Text style={styles.stepCounter}>
          {currentStep + 1} de {ONBOARDING_STEPS.length}
        </Text>

        <TouchableOpacity
          style={[styles.navButton, styles.nextButton]}
          onPress={handleNext}
        >
          <Text style={styles.navButtonText}>
            {currentStep === ONBOARDING_STEPS.length - 1 ? t('onboarding.start') : t('onboarding.next')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: FONTS.black,
    color: COLORS.text,
  },
  skipButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  skipButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.xs,
    ...BORDERS.medium,
    borderColor: COLORS.border,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
    transform: [{ scale: 1.2 }],
  },
  progressDotCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.successDark,
  },
  stepsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  stepContainer: {
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepContent: {
    alignItems: 'center',
  },
  stepVisual: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...BORDERS.thick,
    borderColor: COLORS.border,
    ...SHADOWS.large,
  },
  stepEmoji: {
    fontSize: 48,
  },
  stepTextContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  stepTitle: {
    fontSize: 28,
    fontFamily: FONTS.black,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  stepSubtitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  stepDescription: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.md,
  },
  highlightContainer: {
    width: '100%',
  },
  highlightCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...BORDERS.thick,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  highlightText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    lineHeight: 20,
    textAlign: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  navButton: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    ...BORDERS.thick,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
    minWidth: 80,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  prevButton: {
    backgroundColor: COLORS.surface,
  },
  navButtonDisabled: {
    backgroundColor: COLORS.disabled,
    borderColor: COLORS.disabled,
  },
  navButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    textAlign: 'center',
  },
  navButtonTextDisabled: {
    color: COLORS.textSecondary,
  },
  stepCounter: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
});

export default OnboardingScreen;